from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Order, db

admin_orders_bp = Blueprint('admin_orders', __name__, url_prefix='/api/admin')

@admin_orders_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_admin_orders():
    current_restaurant_id = int(get_jwt_identity())
    # Obtenemos las órdenes de este restaurante ordenadas de la más reciente a la más antigua
    orders = Order.query.filter_by(restaurant_id=current_restaurant_id).order_by(Order.fecha_creacion.desc()).all()
    return jsonify([o.to_dict() for o in orders]), 200

@admin_orders_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    current_restaurant_id = int(get_jwt_identity())
    order = Order.query.filter_by(id=order_id, restaurant_id=current_restaurant_id).first()
    
    if not order:
        return jsonify({"error": "Pedido no encontrado"}), 404
        
    data = request.get_json()
    nuevo_estado = data.get('estado') # Ej: 'pendiente', 'completado', 'cancelado'
    
    if not nuevo_estado:
        return jsonify({"error": "Se requiere el nuevo estado"}), 400
        
    order.estado = nuevo_estado
    db.session.commit()
    
    return jsonify({
        "message": "Estado del pedido actualizado",
        "order": order.to_dict()
    }), 200