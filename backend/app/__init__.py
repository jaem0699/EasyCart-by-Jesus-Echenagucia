from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager  # 1. Importar el JWTManager
from app.models import db
from config import Config

migrate = Migrate()
jwt = JWTManager()  # 2. Instanciar el JWTManager

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Inicializar extensiones con la app
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    jwt.init_app(app)  # 3. Inicializar JWT con la app

    # Registrar los Blueprints de la API
    from app.routes.auth_routes import auth_bp
    from app.routes.menu_routes import menu_bp
    from app.routes.public_routes import public_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(menu_bp)
    app.register_blueprint(public_bp)

    @app.route('/')
    def index():
        return {"message": "Bienvenido a la API de EasyCart"}

    return app