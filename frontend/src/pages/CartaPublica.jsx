import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { ShoppingBag, Utensils, MessageCircle, Store } from 'lucide-react';
import api from '../services/api';
import ModalCarrito from '../componentes/ModalCarrito';

const CartaPublica = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [mostrarModalCarrito, setMostrarModalCarrito] = useState(false);

  const obtenerSlugDeUrl = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('slug')) return params.get('slug');
    
    const paths = window.location.pathname.split('/');
    if (paths.length > 2 && paths[1] === 'carta') {
      return paths[2];
    }
    return null; 
  };

  useEffect(() => {
    const cargarMenuPublico = async () => {
      const slug = obtenerSlugDeUrl();
      
      if (!slug) {
        setCargando(false);
        setError('Por favor ingresa un enlace de restaurante válido (Ej: /carta/tu-restaurante o ?slug=tu-restaurante).');
        return;
      }

      try {
        const response = await api.get(`/public/carta/${slug}`);
        setRestaurant(response.data.restaurant);
        setCategorias(response.data.categories);
        setCargando(false);
      } catch (err) {
        setCargando(false);
        setError('No se pudo encontrar el restaurante especificado. Verifica el enlace o intenta más tarde.');
      }
    };

    cargarMenuPublico();
  }, []);

  const agregarAlCarrito = (producto, varianteSeleccionada = null) => {
    const itemKey = varianteSeleccionada ? `${producto.id}-${varianteSeleccionada.id}` : `${producto.id}`;
    const precioFinal = varianteSeleccionada ? producto.precio + varianteSeleccionada.precio_adicional : producto.precio;
    const nombreItem = varianteSeleccionada ? `${producto.nombre} (${varianteSeleccionada.nombre_opcion})` : producto.nombre;

    setCarrito(prevCarrito => {
      const index = prevCarrito.findIndex(item => item.itemKey === itemKey);
      if (index >= 0) {
        const nuevoCarrito = [...prevCarrito];
        nuevoCarrito[index].cantidad += 1;
        return nuevoCarrito;
      } else {
        return [...prevCarrito, {
          itemKey,
          id: producto.id,
          nombre: nombreItem,
          precio: precioFinal,
          cantidad: 1,
          whatsapp: restaurant?.whatsapp_numero
        }];
      }
    });
  };

  if (cargando) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
        <Spinner animation="border" variant="dark" className="mb-3" />
        <p className="text-muted small fw-semibold">Cargando menú digital...</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
        <Container style={{ maxWidth: '450px' }}>
          <Alert variant="danger" className="text-center rounded-4 shadow-sm p-4 border-0">
            <Store size={40} className="text-danger mb-3" />
            <h5 className="fw-bold">Restaurante no encontrado</h5>
            <p className="small text-muted mb-0">{error || 'El establecimiento que buscas no existe o está inactivo.'}</p>
          </Alert>
        </Container>
      </div>
    );
  }

  const colorPrimario = restaurant.color_primario || '#111111';
  const totalItemsCarrito = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <div className="bg-light min-vh-100 pb-6" style={{ paddingBottom: '90px' }}>
      
      {/* Cabecera / Branding del Restaurante adaptada a móviles */}
      <div className="bg-white border-bottom shadow-sm py-3 px-3 text-center sticky-top">
        <Container fluid style={{ maxWidth: '600px' }}>
          {restaurant.logo_url && (
            <img 
              src={restaurant.logo_url} 
              alt={restaurant.nombre} 
              className="rounded-circle shadow-sm mb-2 object-fit-cover"
              style={{ width: '65px', height: '65px', border: `2px solid ${colorPrimario}` }}
            />
          )}
          <h5 className="fw-bold text-dark text-truncate mb-1">{restaurant.nombre}</h5>
          <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>Menú Digital Interactivo • Pedidos por WhatsApp</p>
        </Container>
      </div>

      {/* Contenido del Menú por Categorías */}
      <Container fluid className="py-3 px-3" style={{ maxWidth: '600px' }}>
        {categorias.length === 0 ? (
          <div className="text-center py-5">
            <Utensils size={40} className="text-muted mb-2 opacity-50" />
            <p className="text-muted small">Este restaurante aún no ha publicado productos en su menú.</p>
          </div>
        ) : (
          categorias.map((cat) => (
            <div key={cat.id} className="mb-4">
              <h6 className="fw-bold text-dark mb-3 px-1 border-start border-3 ps-2" style={{ borderColor: colorPrimario }}>
                {cat.nombre}
              </h6>

              <div className="d-flex flex-column gap-2.5">
                {cat.products.map((prod) => (
                  <Card key={prod.id} className="border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                    <Card.Body className="p-3 d-flex gap-3 align-items-center">
                      {prod.imagen_url && (
                        <img 
                          src={prod.imagen_url} 
                          alt={prod.nombre} 
                          className="rounded-3 object-fit-cover flex-shrink-0"
                          style={{ width: '75px', height: '75px' }}
                        />
                      )}
                      <div className="flex-grow-1 min-width-0">
                        <h6 className="fw-bold text-dark mb-1 text-truncate" style={{ fontSize: '0.9rem' }}>{prod.nombre}</h6>
                        <p className="text-muted small mb-2 text-muted text-truncate-2" style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>
                          {prod.descripcion}
                        </p>
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="fw-bold small" style={{ color: colorPrimario, fontSize: '0.85rem' }}>
                            {restaurant.moneda} {Number(prod.precio).toFixed(2)}
                          </span>
                          <Button
                            size="sm"
                            className="rounded-pill px-3 py-1 fw-bold border-0 text-white shadow-none"
                            style={{ backgroundColor: colorPrimario, fontSize: '0.7rem' }}
                            onClick={() => agregarAlCarrito(prod)}
                          >
                            Agregar
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </Container>

      {/* Barra Flotante del Carrito optimizada para pantallas pequeñas */}
      {totalItemsCarrito > 0 && (
        <div className="fixed-bottom p-3 bg-transparent" style={{ maxWidth: '600px', margin: '0 auto', zIndex: 1030 }}>
          <div 
            className="rounded-pill p-3 text-white shadow-lg d-flex align-items-center justify-content-between cursor-pointer"
            style={{ backgroundColor: colorPrimario }}
            onClick={() => setMostrarModalCarrito(true)}
          >
            <div className="d-flex align-items-center gap-2 ps-2">
              <div className="bg-white bg-opacity-25 rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px' }}>
                <ShoppingBag size={16} />
              </div>
              <span className="fw-bold small">{totalItemsCarrito} {totalItemsCarrito === 1 ? 'producto' : 'productos'}</span>
            </div>
            <div className="d-flex align-items-center gap-1 pe-2 fw-bold small">
              <span>Ver Carrito</span>
              <MessageCircle size={16} />
            </div>
          </div>
        </div>
      )}

      {/* Modal del Carrito */}
      <ModalCarrito
        show={mostrarModalCarrito}
        onHide={() => setMostrarModalCarrito(false)}
        carrito={carrito}
        setCarrito={setCarrito}
        restaurant={restaurant}
      />

    </div>
  );
};


export default CartaPublica;