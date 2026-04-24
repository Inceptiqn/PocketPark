from flask import Flask

from routes import api

app = Flask(__name__)

# routes/api.py
app.register_blueprint(api)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
