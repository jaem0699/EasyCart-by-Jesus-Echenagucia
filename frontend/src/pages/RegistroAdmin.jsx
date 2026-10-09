import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Lock, Mail, Store, Phone, ArrowRight } from 'lucide-react';
import api from '../services/api';

const RegistroAdmin = ({ onRegistroSuccess, irALogin }) => {
  const [nombreRestaurante, setNombreRestaurante] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    // Generamos un slug limpio automáticamente (ej: "Burguesía Gourmet" -> "burguesia-gourmet")
    const slug = nombreRestaurante
      .toLowerCase()
      .trim()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    try {
      const response = await api.post('/auth/register', {
        nombre: nombreRestaurante, // <-- CAMBIADO DE 'nombre_restaurante' A 'nombre'
        slug: slug,
        whatsapp_numero: whatsapp,
        email,
        password
      });

      setCargando(false);
      if (onRegistroSuccess) {
        onRegistroSuccess(response.data);
      }
    } catch (err) {
      setCargando(false);
      setError(err.response?.data?.error || err.response?.data?.message || 'Hubo un error al registrar el restaurante. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center px-3 py-5">
      <Container style={{ maxWidth: '420px' }}>
        <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
          <Card.Body className="p-0">
            <div className="text-center mb-4">
              <h3 className="fw-bold text-dark mb-1">Crea tu cuenta B2B</h3>
              <p className="text-muted small">Registra tu restaurante en EasyCart y digitaliza tu menú</p>
            </div>

            {error && (
              <Alert variant="danger" className="rounded-3 small py-2">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formRestaurante">
                <Form.Label className="small fw-semibold text-muted">Nombre del Restaurante</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 rounded-start-pill ps-3">
                    <Store size={16} className="text-muted" />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Ej. Burguesía Gourmet"
                    value={nombreRestaurante}
                    onChange={(e) => setNombreRestaurante(e.target.value)}
                    required
                    className="border-start-0 bg-light rounded-end-pill py-2 small shadow-none"
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formWhatsapp">
                <Form.Label className="small fw-semibold text-muted">Número de WhatsApp (para pedidos)</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 rounded-start-pill ps-3">
                    <Phone size={16} className="text-muted" />
                  </span>
                  <Form.Control
                    type="text"
                    placeholder="Ej. +34600000000"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    required
                    className="border-start-0 bg-light rounded-end-pill py-2 small shadow-none"
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label className="small fw-semibold text-muted">Correo electrónico</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 rounded-start-pill ps-3">
                    <Mail size={16} className="text-muted" />
                  </span>
                  <Form.Control
                    type="email"
                    placeholder="contacto@tu-restaurante.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-start-0 bg-light rounded-end-pill py-2 small shadow-none"
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4" controlId="formPassword">
                <Form.Label className="small fw-semibold text-muted">Contraseña</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 rounded-start-pill ps-3">
                    <Lock size={16} className="text-muted" />
                  </span>
                  <Form.Control
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-start-0 bg-light rounded-end-pill py-2 small shadow-none"
                  />
                </div>
              </Form.Group>

              <Button
                type="submit"
                className="w-100 rounded-pill py-2.5 fw-bold border-0 d-flex align-items-center justify-content-center gap-2 shadow-sm text-white mb-3"
                disabled={cargando}
                style={{ backgroundColor: '#111111' }}
              >
                {cargando ? 'Registrando...' : 'Registrar Restaurante'}
                {!cargando && <ArrowRight size={16} />}
              </Button>
            </Form>

            <div className="text-center mt-3">
              <span className="text-muted small">¿Ya tienes una cuenta? </span>
              <button
                className="btn btn-link p-0 text-dark fw-bold small text-decoration-none"
                onClick={irALogin}
              >
                Inicia sesión aquí
              </button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default RegistroAdmin;