import React from 'react';
import { Modal, Button, ListGroup } from 'react-bootstrap';
import { Trash2, Plus, Minus, Send, ShoppingBag } from 'lucide-react';

const ModalCarrito = ({ 
  show, 
  onHide, 
  carrito, 
  setCarrito, 
  restaurant 
}) => {

  // Asignación segura con encadenamiento opcional y valores por defecto
  const colorPrimario = restaurant?.color_primario || '#111111';
  const nombreRestaurante = restaurant?.nombre || 'Restaurante';
  const numeroWhatsApp = restaurant?.whatsapp_numero || '';
  const moneda = restaurant?.moneda || 'USD';

  // Cálculo del total acumulado
  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  // Funciones para actualizar cantidades
  const actualizarCantidad = (itemKey, delta) => {
    setCarrito(prevCarrito => {
      return prevCarrito.map(item => {
        if (item.itemKey === itemKey) {
          const nuevaCantidad = item.cantidad + delta;
          return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : item;
        }
        return item;
      });
    });
  };

  // Función para eliminar un ítem del carrito
  const eliminarItem = (itemKey) => {
    setCarrito(prevCarrito => prevCarrito.filter(item => item.itemKey !== itemKey));
  };

  // Función para enviar el pedido por WhatsApp
  const enviarPedidoWhatsApp = () => {
    if (carrito.length === 0) return;

    let mensaje = `Hola *${nombreRestaurante}*, quiero hacer el siguiente pedido:\n\n`;

    carrito.forEach((item, index) => {
      mensaje += `${index + 1}. ${item.nombre} x${item.cantidad} - ${moneda} ${(item.precio * item.cantidad).toFixed(2)}\n`;
    });

    mensaje += `\n*Total a pagar:* ${moneda} ${total.toFixed(2)}\n\n¡Gracias!`;

    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      contentClassName="border-0 rounded-4 shadow-lg overflow-hidden bg-white"
    >
      {/* CABECERA DEL MODAL */}
      <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
        <div className="d-flex align-items-center gap-2">
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center text-white"
            style={{ width: '32px', height: '32px', backgroundColor: colorPrimario }}
          >
            <ShoppingBag size={16} />
          </div>
          <Modal.Title className="fw-bold fs-5 text-dark">Tu Orden Actual</Modal.Title>
        </div>
      </Modal.Header>

      {/* CUERPO DEL MODAL (LISTA DE PRODUCTOS) */}
      <Modal.Body className="px-4 py-3" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
        {carrito.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted small mb-0">Tu carrito está vacío.</p>
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
              Agrega deliciosos platos desde la carta.
            </span>
          </div>
        ) : (
          <ListGroup variant="flush">
            {carrito.map((item) => (
              <ListGroup.Item key={item.itemKey} className="d-flex justify-content-between align-items-center px-0 py-3 border-bottom border-light">
                <div className="pe-2">
                  <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '0.9rem' }}>{item.nombre}</h6>
                  <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                    {moneda} {Number(item.precio).toFixed(2)}
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {/* Controladores de cantidad */}
                  <div className="d-flex align-items-center bg-light rounded-pill px-2 py-1 border border-light">
                    <Button 
                      variant="link" 
                      className="p-0 text-dark text-decoration-none d-flex align-items-center"
                      onClick={() => actualizarCantidad(item.itemKey, -1)}
                      disabled={item.cantidad <= 1}
                    >
                      <Minus size={12} />
                    </Button>

                    <span className="mx-2 fw-semibold small" style={{ fontSize: '0.8rem' }}>
                      {item.cantidad}
                    </span>

                    <Button 
                      variant="link" 
                      className="p-0 text-dark text-decoration-none d-flex align-items-center"
                      onClick={() => actualizarCantidad(item.itemKey, 1)}
                    >
                      <Plus size={12} />
                    </Button>
                  </div>

                  {/* Botón eliminar */}
                  <Button 
                    variant="light" 
                    className="rounded-circle p-0 d-flex align-items-center justify-content-center text-danger border-0 bg-light"
                    style={{ width: '30px', height: '30px' }}
                    onClick={() => eliminarItem(item.itemKey)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>

      {/* PIE DE PÁGINA DEL MODAL */}
      <Modal.Footer className="border-0 px-4 pb-4 pt-2 d-flex flex-column bg-light bg-opacity-50">
        <div className="w-100 d-flex justify-content-between align-items-center mb-3 px-1">
          <span className="text-muted small fw-semibold">Total a pagar:</span>
          <span className="fw-bold fs-5 text-dark">{moneda} {total.toFixed(2)}</span>
        </div>

        <Button 
          className="w-100 rounded-pill py-2.5 fw-bold border-0 d-flex align-items-center justify-content-center gap-2 shadow-sm text-white"
          style={{ backgroundColor: '#25D366', fontSize: '0.9rem' }}
          onClick={enviarPedidoWhatsApp}
          disabled={carrito.length === 0}
        >
          <Send size={16} />
          <span>Enviar Pedido por WhatsApp</span>
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalCarrito;