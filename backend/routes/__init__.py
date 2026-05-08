from routes.emissioni import emissioni_bp
from routes.health import health_bp
from routes.parcheggi import parcheggi_bp
from routes.prenotazioni import prenotazioni_bp
from routes.roles import roles_bp
from routes.tariffe import tariffe_bp
from routes.users import users_bp
from routes.veicoli import veicoli_bp


def register_routes(app):
	app.register_blueprint(health_bp)
	app.register_blueprint(roles_bp)
	app.register_blueprint(users_bp)
	app.register_blueprint(veicoli_bp)
	app.register_blueprint(parcheggi_bp)
	app.register_blueprint(tariffe_bp)
	app.register_blueprint(prenotazioni_bp)
	app.register_blueprint(emissioni_bp)
