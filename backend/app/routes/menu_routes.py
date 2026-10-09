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

# --- LISTAR TODOS LOS PRODUCTOS DEL RESTAURANTE ---
@menu_bp.route('/products', methods=['GET'])
@jwt_required()
def get_restaurant_products():
    current_restaurant_id = int(get_jwt_identity())
    # Buscamos los productos cuyas categorías pertenezcan a este restaurante
    productos = Product.query.join(Category).filter(Category.restaurante_id == current_restaurant_id).all()
    return jsonify([p.to_dict() for p in productos]), 200

# --- ELIMINAR UN PRODUCTO ---
@menu_bp.route('/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    current_restaurant_id = int(get_jwt_identity())
    producto = Product.query.join(Category).filter(
        Product.id == product_id,
        Category.restaurante_id == current_restaurant_id
    ).first()
    
    if not producto:
        return jsonify({"error": "Producto no encontrado o no autorizado"}), 404
        
    db.session.delete(producto)
    db.session.commit()
    return jsonify({"message": "Producto eliminado correctamente"}), 200

# --- ELIMINAR UNA CATEGORÍA ---
@menu_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    current_restaurant_id = int(get_jwt_identity())
    categoria = Category.query.filter_by(id=category_id, restaurante_id=current_restaurant_id).first()
    
    if not categoria:
        return jsonify({"error": "Categoría no encontrada o no autorizada"}), 404
        
    db.session.delete(categoria)
    db.session.commit()
    return jsonify({"message": "Categoría y sus productos eliminados correctamente"}), 200


# --- ACTUALIZAR UN PRODUCTO ---
@menu_bp.route('/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    current_restaurant_id = int(get_jwt_identity())
    producto = Product.query.join(Category).filter(
        Product.id == product_id,
        Category.restaurante_id == current_restaurant_id
    ).first()
    
    if not producto:
        return jsonify({"error": "Producto no encontrado o no autorizado"}), 404
        
    data = request.get_json()
    
    if 'nombre' in data:
        producto.nombre = data['nombre']
    if 'descripcion' in data:
        producto.descripcion = data['descripcion']
    if 'precio' in data:
        producto.precio = data['precio']
    if 'imagen_url' in data:
        producto.imagen_url = data['imagen_url']
    if 'disponible' in data:
        producto.disponible = data['disponible']
    if 'categoria_id' in data:
        # Validar que la nueva categoría pertenezca al restaurante
        nueva_cat = Category.query.get(data['categoria_id'])
        if not nueva_cat or nueva_cat.restaurante_id != current_restaurant_id:
            return jsonify({"error": "Categoría inválida o no autorizada"}), 403
        producto.categoria_id = data['categoria_id']
        
    db.session.commit()
    return jsonify({
        "message": "Producto actualizado correctamente",
        "product": producto.to_dict()
    }), 200

# --- ACTUALIZAR UNA CATEGORÍA ---
@menu_bp.route('/categories/<int:category_id>', methods=['PUT'])
@jwt_required()
def update_category(category_id):
    current_restaurant_id = int(get_jwt_identity())
    categoria = Category.query.filter_by(id=category_id, restaurante_id=current_restaurant_id).first()
    
    if not categoria:
        return jsonify({"error": "Categoría no encontrada o no autorizada"}), 404
        
    data = request.get_json()
    
    if 'nombre' in data:
        categoria.nombre = data['nombre']
    if 'orden' in data:
        categoria.orden = data['orden']
        
    db.session.commit()
    return jsonify({
        "message": "Categoría actualizada correctamente",
        "category": categoria.to_dict()
    }), 200