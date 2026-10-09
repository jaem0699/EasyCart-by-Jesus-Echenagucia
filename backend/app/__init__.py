from flask import Flask, request
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

    # Configuración ampliada de tamaño máximo para recibir imágenes en Base64 (Ej. 10MB)
    app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

    # Inicializar extensiones con la app
    db.init_app(app)
    migrate.init_app(app, db)
    
    # CORS robusto para permitir cabeceras de autorización y peticiones desde el frontend
    CORS(
        app,
        resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    @app.after_request
    def after_request(response):
        origin = request.headers.get("Origin")
        if origin in {"http://localhost:5173", "http://127.0.0.1:5173"}:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return response

    jwt.init_app(app)  # 3. Inicializar JWT con la app

    # Registrar los Blueprints de la API
    from app.routes.auth_routes import auth_bp
    from app.routes.menu_routes import menu_bp
    from app.routes.public_routes import public_bp
    from app.routes.admin_orders_routes import admin_orders_bp  # <--- NUEVO: Importar blueprint de órdenes de admin

    app.register_blueprint(auth_bp)
    app.register_blueprint(menu_bp)
    app.register_blueprint(public_bp)
    app.register_blueprint(admin_orders_bp)  # <--- NUEVO: Registrar blueprint de órdenes de admin

    @app.route('/')
    def index():
        return {"message": "Bienvenido a la API de EasyCart"}

    return app