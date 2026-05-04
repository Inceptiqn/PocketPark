from flask import Flask, jsonify

from routes import register_routes

app = Flask(__name__)

register_routes(app)


@app.errorhandler(404)
def not_found(_error):
    return jsonify(error="not_found"), 404


@app.errorhandler(400)
def bad_request(_error):
    return jsonify(error="bad_request"), 400


@app.errorhandler(500)
def server_error(_error):
    return jsonify(error="server_error"), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
