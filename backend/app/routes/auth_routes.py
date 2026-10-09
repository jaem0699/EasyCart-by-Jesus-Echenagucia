from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import db, Restaurant
from itsdangerous import URLSafeTimedSerializer
import os

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Clave y salt para firmar los tokens temporales de recuperación
SECURITY_PASSWORD_SALT = os.getenv('SECURITY_PASSWORD_SALT', 'recovery-salt-key-easycart')

def generar_token_recuperacion(email):
    serializer = URLSafeTimedSerializer(os.getenv('SECRET_KEY', 'tu-secret-key-muy-segura'))
    return serializer.dumps(email, salt=SECURITY_PASSWORD_SALT)

def confirmar_token_recuperacion(token, expiration=3600): # Expira en 1 hora (3600 segundos)
    serializer = URLSafeTimedSerializer(os.getenv('SECRET_KEY', 'tu-secret-key-muy-segura'))
    try:
        email = serializer.loads(
            token,
            salt=SECURITY_PASSWORD_SALT,
            max_age=expiration
        )
    except Exception:
        return None
    return email

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('nombre') or not data.get('email') or not data.get('password') or not data.get('slug'):
        return jsonify({"error": "Faltan datos obligatorios"}), 400
        
    existing_user = Restaurant.query.filter_by(email=data['email']).first()
    existing_slug = Restaurant.query.filter_by(slug=data['slug']).first()
    
    if existing_user or existing_slug:
        return jsonify({"error": "El correo electrónico o el slug ya están registrados"}), 400
        
    hashed_password = generate_password_hash(data['password'])
    
    nuevo_restaurante = Restaurant(
        nombre=data['nombre'],
        email=data['email'],
        password_hash=hashed_password,
        whatsapp_numero=data.get('whatsapp_numero', ''),
        slug=data['slug'],
        color_primario=data.get('color_primario', '#ff5722'),
        moneda=data.get('moneda', 'USD')
    )
    
    db.session.add(nuevo_restaurante)
    db.session.commit()
    
    return jsonify({
        "message": "Restaurante registrado con éxito",
        "restaurant": nuevo_restaurante.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Se requiere email y contraseña"}), 400
        
    restaurant = Restaurant.query.filter_by(email=data['email']).first()
    
    if not restaurant or not check_password_hash(restaurant.password_hash, data['password']):
        return jsonify({"error": "Credenciales inválidas"}), 401
        
    access_token = create_access_token(identity=str(restaurant.id))
    
    return jsonify({
        "message": "Inicio de sesión exitoso",
        "access_token": access_token,
        "restaurant": restaurant.to_dict()
    }), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    if not data or not data.get('email'):
        return jsonify({"error": "Se requiere el correo electrónico"}), 400
        
    email = data.get('email')
    restaurant = Restaurant.query.filter_by(email=email).first()
    
    if restaurant:
        token = generar_token_recuperacion(email)
        enlace_reset = f"http://localhost:5173/reset-password?token={token}"
        # Aquí se simula la impresión en consola; luego puedes integrarlo con Flask-Mail
        print(f"--- ENLACE DE RECUPERACIÓN PARA {email} ---")
        print(enlace_reset)
        print("-------------------------------------------")
        
    return jsonify({
        "message": "Si el correo está registrado, recibirás las instrucciones de recuperación."
    }), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    if not data or not data.get('token') or not data.get('password'):
        return jsonify({"error": "Faltan datos obligatorios (token o contraseña)"}), 400
        
    token = data.get('token')
    nueva_password = data.get('password')
    
    email = confirmar_token_recuperacion(token)
    if not email:
        return jsonify({"error": "El enlace de recuperación es inválido o ha expirado."}), 400
        
    restaurant = Restaurant.query.filter_by(email=email).first()
    if not restaurant:
        return jsonify({"error": "Restaurante no encontrado."}), 404
        
    restaurant.password_hash = generate_password_hash(nueva_password)
    db.session.commit()
    
    return jsonify({"message": "Contraseña actualizada exitosamente. Ya puedes iniciar sesión."}), 200

@auth_bp.route('/perfil', methods=['GET'])
@jwt_required()
def obtener_perfil():
    current_restaurant_id = get_jwt_identity()
    restaurant = Restaurant.query.get(current_restaurant_id)
    if not restaurant:
        return jsonify({"error": "Restaurante no encontrado"}), 404
    return jsonify(restaurant.to_dict()), 200

@auth_bp.route('/perfil', methods=['PUT'])
@jwt_required()
def actualizar_perfil():
    current_restaurant_id = get_jwt_identity()
    restaurant = Restaurant.query.get(current_restaurant_id)
    if not restaurant:
        return jsonify({"error": "Restaurante no encontrado"}), 404
    
    data = request.get_json()
    
    if 'nombre' in data:
        restaurant.nombre = data['nombre']
    if 'whatsapp_numero' in data:
        restaurant.whatsapp_numero = data['whatsapp_numero']
    if 'color_primario' in data:
        restaurant.color_primario = data['color_primario']
    if 'moneda' in data:
        restaurant.moneda = data['moneda']
        
    db.session.commit()
    
    return jsonify({
        "message": "Perfil y configuración actualizados con éxito",
        "restaurant": restaurant.to_dict()
    }), 200