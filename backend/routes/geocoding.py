import json
import os
import ssl
import time
import urllib.error
import urllib.parse
import urllib.request

from flask import Blueprint, jsonify, request

geocoding_bp = Blueprint("geocoding", __name__, url_prefix="/api/geocoding")

NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search"
PHOTON_ENDPOINT = "https://photon.komoot.io/api/"
DEFAULT_LIMIT = 5
NOMINATIM_EMAIL = os.getenv("NOMINATIM_EMAIL")
GEOCODING_USER_AGENT = os.getenv(
    "GEOCODING_USER_AGENT",
    "PocketPark/1.0 (local dev; contact: dev@local)",
)
GEOCODING_CACHE_TTL_SEC = 60
NOMINATIM_MIN_INTERVAL_SEC = 1.2

_cache = {}
_last_nominatim_call = 0.0


def build_nominatim_url(query, limit):
    query_params = {
        "q": query,
        "format": "json",
        "addressdetails": "1",
        "limit": str(limit),
        "accept-language": "it",
    }
    if NOMINATIM_EMAIL:
        query_params["email"] = NOMINATIM_EMAIL
    params = urllib.parse.urlencode(query_params)
    return f"{NOMINATIM_ENDPOINT}?{params}"


def build_photon_url(query, limit):
    params = urllib.parse.urlencode(
        {
            "q": query,
            "limit": str(limit),
            "lang": "it",
        }
    )
    return f"{PHOTON_ENDPOINT}?{params}"


def normalize_query(value):
    return " ".join(value.replace(";", ",").split())


def get_cached(query, limit):
    cache_key = (query.lower(), limit)
    record = _cache.get(cache_key)
    if not record:
        return None
    timestamp, payload = record
    if time.time() - timestamp > GEOCODING_CACHE_TTL_SEC:
        _cache.pop(cache_key, None)
        return None
    return payload


def set_cached(query, limit, payload):
    cache_key = (query.lower(), limit)
    _cache[cache_key] = (time.time(), payload)


def fetch_json(url):
    context = ssl.create_default_context()
    if os.getenv("GEOCODING_INSECURE_SSL") == "1":
        context = ssl._create_unverified_context()
    request_obj = urllib.request.Request(
        url,
        headers={
            "User-Agent": GEOCODING_USER_AGENT,
            "Accept-Language": "it",
            "Accept": "application/json",
            "Referer": "http://127.0.0.1:5000",
        },
    )
    with urllib.request.urlopen(request_obj, timeout=8, context=context) as response:
        return json.loads(response.read().decode("utf-8"))


def map_nominatim_results(payload):
    items = payload if isinstance(payload, list) else []
    mapped = []
    for item in items:
        address = item.get("address") or {}
        name_parts = [
            address.get("road")
            or address.get("pedestrian")
            or address.get("footway")
            or address.get("cycleway"),
            address.get("house_number"),
            address.get("postcode"),
            address.get("city")
            or address.get("town")
            or address.get("village")
            or address.get("state"),
            address.get("country"),
        ]
        name = ", ".join([part for part in name_parts if part]) or item.get("display_name")
        try:
            lat = float(item.get("lat"))
            lng = float(item.get("lon"))
        except (TypeError, ValueError):
            continue
        mapped.append(
            {
                "id": item.get("place_id"),
                "name": name,
                "latitude": lat,
                "longitude": lng,
                "type": item.get("type") or item.get("class") or "indirizzo",
            }
        )
    return mapped


def map_photon_results(payload):
    features = payload.get("features") if isinstance(payload, dict) else []
    mapped = []
    for feature in features or []:
        properties = feature.get("properties") or {}
        coordinates = feature.get("geometry", {}).get("coordinates") or []
        name_parts = [
            properties.get("name"),
            properties.get("street"),
            properties.get("housenumber"),
            properties.get("postcode"),
            properties.get("city") or properties.get("state"),
            properties.get("country"),
        ]
        name = ", ".join([part for part in name_parts if part])
        try:
            lat = float(coordinates[1])
            lng = float(coordinates[0])
        except (TypeError, ValueError, IndexError):
            continue
        mapped.append(
            {
                "id": properties.get("osm_id") or feature.get("id"),
                "name": name,
                "latitude": lat,
                "longitude": lng,
                "type": properties.get("osm_type") or properties.get("type") or "indirizzo",
            }
        )
    return mapped


@geocoding_bp.get("/search")
def search_geocoding():
    raw_query = (request.args.get("q") or "").strip()
    query = normalize_query(raw_query)
    if not query:
        return jsonify(results=[], provider="none", error="missing_query"), 400

    limit = request.args.get("limit", type=int) or DEFAULT_LIMIT
    limit = max(1, min(limit, 10))

    cached = get_cached(query, limit)
    if cached is not None:
        return jsonify(results=cached, provider="cache"), 200

    nominatim_error = None
    photon_error = None

    global _last_nominatim_call
    now = time.time()
    if now - _last_nominatim_call < NOMINATIM_MIN_INTERVAL_SEC:
        nominatim_error = "rate_limited_local"
    else:
        _last_nominatim_call = now
        try:
            data = fetch_json(build_nominatim_url(query, limit))
            results = map_nominatim_results(data)
            if results:
                set_cached(query, limit, results)
                return jsonify(results=results, provider="nominatim"), 200
        except urllib.error.HTTPError as exc:
            nominatim_error = f"HTTP {exc.code}"
        except Exception as exc:
            nominatim_error = str(exc)

    try:
        data = fetch_json(build_photon_url(query, limit))
        results = map_photon_results(data)
        set_cached(query, limit, results)
        return jsonify(results=results, provider="photon"), 200
    except urllib.error.HTTPError as exc:
        photon_error = f"HTTP {exc.code}"
    except Exception as exc:
        photon_error = str(exc)

    return (
        jsonify(
            results=[],
            provider="none",
            error="geocoding_failed",
            nominatim_error=nominatim_error,
            photon_error=photon_error,
        ),
        502,
    )
