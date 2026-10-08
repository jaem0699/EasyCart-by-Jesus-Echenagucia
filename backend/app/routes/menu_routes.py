from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Category, Product, ProductModifier

menu_bp = Blueprint('menu', __name__, url_prefix='/api/menu-admin')

# --- CATEGORÍAS ---
@menu_bp.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    current_restaurant_id = get_jwt_identity()
    data = request.get_json()
    
    nueva_categoria = Category(
        restaurante_id=int(current_restaurant_id),
        nombre=data['nombre'],
        orden=data.get('orden', 0)
    )
    db.session.add(nueva_categoria)
    db.session.commit()
    
    return jsonify(nueva_categoria.to_dict()), 201

@menu_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_restaurant_categories():
    current_restaurant_id = get_jwt_identity()
    categorias = Category.query.filter_by(restaurante_id=int(current_restaurant_id)).order_by(Category.orden).all()
    
    return jsonify([c.to_dict() for c in categorias]), 200

# --- PRODUCTOS ---
@menu_bp.route('/products', methods=['POST'])
@jwt_required()
def create_product():
    current_restaurant_id = int(get_jwt_identity())
    data = request.get_json()
    
    # Validar que la categoría pertenezca al restaurante autenticado por seguridad
    categoria = Category.query.get(data['categoria_id'])
    if not categoria or categoria.restaurante_id != current_restaurant_id:
        return jsonify({"error": "Categoría inválida o no pertenece a este restaurante"}), 403
        
    nuevo_producto = Product(
        categoria_id=data['categoria_id'],
        nombre=data['nombre'],
        descripcion=data.get('descripcion', ''),
        precio=data['precio'],
        imagen_url=data.get('imagen_url', ''),
        disponible=data.get('disponible', True)
    )
    db.session.add(nuevo_producto)
    db.session.commit()
    
    return jsonify(nuevo_producto.to_dict()), 201

# --- MODIFICADORES (EXTRAS) ---
@menu_bp.route('/modifiers', methods=['POST'])
@jwt_required()
def create_modifier():
    data = request.get_json()
    
    modificador = ProductModifier(
        producto_id=data['producto_id'],
        nombre_grupo=data['nombre_grupo'],
        nombre_opcion=data['nombre_opcion'],
        precio_adicional=data.get('precio_adicional', 0.00)
    )
    db.session.add(modificador)
    db.session.commit()
    
    return jsonify(modificador.to_dict()), 201