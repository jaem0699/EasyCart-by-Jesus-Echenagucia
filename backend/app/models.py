from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Restaurant(db.Model):
    __tablename__ = 'restaurants'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    logo_url = db.Column(db.String(255), nullable=True)
    whatsapp_numero = db.Column(db.String(20), nullable=False)
    color_primario = db.Column(db.String(7), default="#ff5722") # Color hexadecimal para branding
    moneda = db.Column(db.String(10), default="USD") # Ej: USD, EUR, PEN
    slug = db.Column(db.String(100), unique=True, nullable=False) # Identificador para la URL pública
    
    # Relación de 1 a N: Un restaurante tiene muchas categorías
    categories = db.relationship('Category', backref='restaurant', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        """Convierte el modelo a diccionario para respuestas JSON fáciles"""
        return {
            "id": self.id,
            "nombre": self.nombre,
            "email": self.email,
            "logo_url": self.logo_url,
            "whatsapp_numero": self.whatsapp_numero,
            "color_primario": self.color_primario,
            "moneda": self.moneda,
            "slug": self.slug
        }


class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    restaurante_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    orden = db.Column(db.Integer, default=0)
    
    # Relación de 1 a N: Una categoría tiene muchos productos
    products = db.relationship('Product', backref='category', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "restaurante_id": self.restaurante_id,
            "nombre": self.nombre,
            "orden": self.orden
        }


class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    imagen_url = db.Column(db.String(255), nullable=True)
    disponible = db.Column(db.Boolean, default=True)
    
    # Relación de 1 a N: Un producto puede tener complementos u opciones (ej. bebidas, extras)
    modifiers = db.relationship('ProductModifier', backref='product', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "categoria_id": self.categoria_id,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "precio": float(self.precio),
            "imagen_url": self.imagen_url,
            "disponible": self.disponible,
            "modifiers": [m.to_dict() for m in self.modifiers]
        }


class ProductModifier(db.Model):
    __tablename__ = 'product_modifiers'
    
    id = db.Column(db.Integer, primary_key=True)
    producto_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    nombre_grupo = db.Column(db.String(100), nullable=False)  # Ej: "Elige tu bebida"
    nombre_opcion = db.Column(db.String(100), nullable=False) # Ej: "Coca Cola 500ml"
    precio_adicional = db.Column(db.Numeric(10, 2), default=0.00)

    def to_dict(self):
        return {
            "id": self.id,
            "producto_id": self.producto_id,
            "nombre_grupo": self.nombre_grupo,
            "nombre_opcion": self.nombre_opcion,
            "precio_adicional": float(self.precio_adicional)
        }

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    
    # Datos del cliente
    cliente_nombre = db.Column(db.String(100), nullable=False)
    cliente_telefono = db.Column(db.String(20), nullable=True)
    
    # Tipo de orden: 'delivery' o 'pickup'
    tipo_entrega = db.Column(db.String(20), nullable=False)
    direccion_envio = db.Column(db.Text, nullable=True) # Obligatorio si es delivery
    notas = db.Column(db.Text, nullable=True)
    
    # Montos y estado
    total = db.Column(db.Numeric(10, 2), nullable=False)
    estado = db.Column(db.String(30), default='pendiente') # pendiente, enviado_whatsapp, completado, cancelado
    fecha_creacion = db.Column(db.DateTime, server_default=db.func.now())
    
    # Relación para ver los items de este pedido
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "restaurant_id": self.restaurant_id,
            "cliente_nombre": self.cliente_nombre,
            "cliente_telefono": self.cliente_telefono,
            "tipo_entrega": self.tipo_entrega,
            "direccion_envio": self.direccion_envio,
            "notas": self.notas,
            "total": float(self.total),
            "estado": self.estado,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "items": [item.to_dict() for item in self.items]
        }


class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=True)
    
    nombre_producto = db.Column(db.String(100), nullable=False) # Guardamos el nombre por si el producto cambia de precio/nombre después
    cantidad = db.Column(db.Integer, nullable=False, default=1)
    precio_unitario = db.Column(db.Numeric(10, 2), nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    seleccion_modificadores = db.Column(db.Text, nullable=True) # JSON o texto plano con los extras elegidos (ej: "Bebida: Coca Cola")

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "nombre_producto": self.nombre_producto,
            "cantidad": self.cantidad,
            "precio_unitario": float(self.precio_unitario),
            "subtotal": float(self.subtotal),
            "seleccion_modificadores": self.seleccion_modificadores
        }