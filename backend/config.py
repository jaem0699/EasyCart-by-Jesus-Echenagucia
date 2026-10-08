import os
from dotenv import load_dotenv

# Cargar las variables de entorno desde un archivo .env si existe
load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'clave-secreta-por-defecto-super-segura')
    
    # Clave específica para los tokens JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-clave-secreta-por-defecto')
    
    # URL de conexión a MySQL usando PyMySQL
    # Formato: mysql+pymysql://usuario:contraseña@host:puerto/nombre_base_de_datos
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL', 
        'mysql+pymysql://root:@localhost:3306/easycart_db'
    )
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False