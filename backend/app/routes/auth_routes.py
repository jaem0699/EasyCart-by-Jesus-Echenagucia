from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from app.models import db, Restaurant

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

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
        
    # Generamos el token JWT guardando el ID del restaurante como identidad (convertido a string)
    access_token = create_access_token(identity=str(restaurant.id))
    
    return jsonify({
        "message": "Inicio de sesión exitoso",
        "access_token": access_token,
        "restaurant": restaurant.to_dict()
    }), 200