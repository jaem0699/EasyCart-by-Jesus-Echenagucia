# 🍽️ EasyCart SaaS



### **Plataforma B2B2C de Menús Digitales y Pedidos Integrados con WhatsApp**



*Una solución moderna, autónoma y ágil para que los restaurantes digitalicen su operativa de pedidos sin comisiones por intermediarios.*



## 🚀 Sobre el Proyecto



**EasyCart** es una plataforma SaaS (Software as a Service) B2B2C diseñada para empoderar a los restaurantes. Les permite crear, personalizar y gestionar su propio menú digital de manera independiente, conectando de forma fluida a los comensales mediante pedidos directos a WhatsApp para modalidades de **Delivery** o **Pick-up**.



## 🛠️ Tecnologías Utilizadas



El proyecto está desarrollado con una arquitectura moderna de separación de responsabilidades:



* **Back-End:** Python, Flask, Flask-SQLAlchemy (ORM)

* **Base de Datos:** MySQL (Relacional)

* **Front-End:** JavaScript (React), Bootstrap 5, HTML5/CSS3

* **Integración:** API de WhatsApp para automatización de flujos de pago y pedidos.



## ✨ Características Principales



### 🖥️ A. Módulo de Restaurante (Panel de Administración / Back-Office)



* **Autenticación y Perfil:** Sistema seguro de registro/login para administradores y gestión integral de datos corporativos (nombre, logotipo y número de WhatsApp de pedidos modificable en tiempo real).

* **Personalización Visual (Branding):** Selector de colores corporativos para adaptar la carta del cliente a la identidad visual de cada negocio y configuración de moneda oficial ($USD, EUR, PEN, etc.).

* **Gestión de Carta y Productos:** CRUD completo de productos (nombre, descripción, fotografía, precio), organización por categorías (Entradas, Principales, Bebidas, Postres) y configuración avanzada de complementos/extras (tamaños, ingredientes, menús combinados).

* **Canales de Acceso Dinámicos:** Generación automática de un enlace único y código QR vinculados al menú público, actualizándose instantáneamente ante cualquier cambio interno.



### 📱 B. Módulo de Experiencia del Cliente (Front-End / Carta Digital)



* **Visualización Adaptativa:** Interfaz web mobile-first optimizada, estilizada dinámicamente con los colores y logotipos del restaurante.

* **Flujo de Pedido Inteligente (Checkout):** Selección intuitiva entre *Delivery* (con validación de dirección) o *Pick-up*, incluyendo captura de datos del cliente y notas especiales.

* **Integración Directa con WhatsApp:** Generación automática de un mensaje estructurado con el resumen completo del pedido, datos de entrega y redirección inmediata al WhatsApp del local.



## ⚙️ Guía de Instalación y Configuración



Sigue estos pasos para clonar y poner en marcha el entorno de desarrollo localmente:



### Prerrequisitos



* Python 3.10 o superior instalado.

* Node.js y npm instalados.

* Servidor MySQL activo.



### 1. Clonar el repositorio



git clone https://github.com/tu-usuario/easycart.git

cd easycart



### 2. Configuración del Back-End (Flask)



# Crear y activar entorno virtual

python -m venv venv

# En Windows:

venv\Scripts\activate

# En macOS/Linux:

source venv/bin/activate



# Instalar dependencias del servidor

pip install -r requirements.txt



Configura tus variables de entorno creando un archivo `.env` en la raíz del proyecto basándote en la conexión de tu base de datos MySQL:



FLASK_APP=app.py

FLASK_ENV=development

SQLALCHEMY_DATABASE_URI=mysql+pymysql://usuario:contraseña@localhost:3306/easycart_db

SECRET_KEY=tu_clave_secreta



### 3. Configuración del Front-End (React)



cd client

npm install

npm run build 



### 4. Ejecución del Servidor



# Regresar a la raíz y correr Flask

flask run



## 👥 Contribución



Las contribuciones son siempre bienvenidas. Si deseas proponer una mejora o reportar un error, por favor abre un *Issue* o envía un *Pull Request*.



1. Haz un Fork del proyecto (`https://github.com/tu-usuario/easycart/fork`)

2. Crea tu rama de características (`git checkout -b feature/NuevaFuncionalidad`)

3. Realiza tus cambios (`git commit -m 'Agregada nueva funcionalidad'`)

4. Sube la rama (`git push origin feature/NuevaFuncionalidad`)

5. Abre un Pull Request



## 📄 Licencia



Este proyecto se encuentra bajo la Licencia [MIT](LICENSE).
