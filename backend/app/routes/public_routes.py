from flask import Blueprint, request, jsonify
from app.models import Restaurant, Order, OrderItem, db

public_bp = Blueprint('public', __name__, url_prefix='/api/public')

@public_bp.route('/carta/<string:slug>', methods=['GET'])
def get_public_menu(slug):
    restaurant = Restaurant.query.filter_by(slug=slug).first()
    
    if not restaurant:
        return jsonify({"error": "Restaurante no encontrado"}), 404
        
    menu_data = {
        "restaurant": restaurant.to_dict(),
        "categories": []
    }
    
    for category in restaurant.categories:
        cat_dict = category.to_dict()
        # Solo enviamos productos disponibles al cliente final
        cat_dict['products'] = [p.to_dict() for p in category.products if p.disponible]
        menu_data['categories'].append(cat_dict)
        
    return jsonify(menu_data), 200

@public_bp.route('/orders', methods=['POST'])
def create_order():
    data = request.get_json()
    
    try:
        nueva_orden = Order(
            restaurant_id=data['restaurant_id'],
            cliente_nombre=data['cliente_nombre'],
            cliente_telefono=data.get('cliente_telefono', ''),
            tipo_entrega=data['tipo_entrega'], # 'delivery' o 'pickup'
            direccion_envio=data.get('direccion_envio', ''),
            notas=data.get('notas', ''),
            total=data['total'],
            estado='pendiente'
        )
        db.session.add(nueva_orden)
        db.session.commit()
        
        for item_data in data.get('items', []):
            item = OrderItem(
                order_id=nueva_orden.id,
                product_id=item_data.get('product_id'),
                nombre_producto=item_data['nombre_producto'],
                cantidad=item_data['cantidad'],
                precio_unitario=item_data['precio_unitario'],
                subtotal=item_data['subtotal'],
                seleccion_modificadores=item_data.get('seleccion_modificadores', '')
            )
            db.session.add(item)
            
        db.session.commit()
        
        restaurant = Restaurant.query.get(data['restaurant_id'])
        
        return jsonify({
            "message": "Pedido registrado con éxito",
            "order_id": nueva_orden.id,
            "whatsapp_numero": restaurant.whatsapp_numero if restaurant else ""
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400