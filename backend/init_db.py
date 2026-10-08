import pymysql
pymysql.install_as_MySQLdb()

from flask import Flask
from config import Config
from app.models import db, Restaurant, Category, Product, ProductModifier, Order, OrderItem

# Creamos la app de Flask
app = Flask(__name__)
app.config.from_object(Config)

# Inicializamos la base de datos con la app
db.init_app(app)

print("1. Conectando a la base de datos...")
with app.app_context():
    print("2. Creando las tablas (restaurants, categories, products, product_modifiers)...")
    db.create_all()
    print("3. ¡Tablas creadas con éxito en easycart_db!")