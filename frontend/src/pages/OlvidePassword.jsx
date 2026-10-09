import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Mail, ArrowRight, ChevronLeft } from 'lucide-react';
import api from '../services/api';

const OlvidePassword = ({ irALogin }) => {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      // Conexión con tu endpoint backend de Flask (ej. /api/auth/forgot-password)
      await api.post('/auth/forgot-password', { email });
      setCargando(false);
      setEnviado(true);
    } catch (err) {
      setCargando(false);
      setError(err.response?.data?.message || 'No se pudo procesar la solicitud. Verifica el correo.');
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center px-3 py-5">
      <Container style={{ maxWidth: '420px' }}>
        
        <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
          <Card.Body className="p-0">
            
            {/* Botón para volver al login */}
            <button 
              className="btn btn-link p-0 text-dark text-decoration-none d-flex align-items-center gap-1 mb-3 small fw-semibold"
              onClick={irALogin}
            >
              <ChevronLeft size={16} /> Volver al inicio de sesión
            </button>

            <div className="text-center mb-4">
              <h3 className="fw-bold text-dark mb-1">Recuperar Contraseña</h3>
              <p className="text-muted small">
                Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu acceso.
              </p>
            </div>

            {error && (
              <Alert variant="danger" className="rounded-3 small py-2">
                {error}
              </Alert>
            )}

            {enviado ? (
              <div className="text-center py-4">
                <div className="bg-success bg-opacity-10 text-success rounded-circle p-3 d-inline-flex mb-3">
                  <Mail size={28} />
                </div>
                <h5 className="fw-bold text-dark mb-2">¡Correo enviado!</h5>
                <p className="text-muted small mb-4">
                  Si el correo <strong>{email}</strong> está registrado en EasyCart, recibirás un enlace de recuperación en breve.
                </p>
                <Button
                  className="w-100 rounded-pill py-2.5 fw-bold border-0 text-white bg-dark"
                  onClick={irALogin}
                >
                  Regresar al Login
                </Button>
              </div>
            ) : (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4" controlId="formEmail">
                  <Form.Label className="small fw-semibold text-muted">Correo electrónico</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 rounded-start-pill ps-3">
                      <Mail size={16} className="text-muted" />
                    </span>
                    <Form.Control
                      type="email"
                      placeholder="nombre@restaurante.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-start-0 bg-light rounded-end-pill py-2 small shadow-none"
                    />
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100 rounded-pill py-2.5 fw-bold border-0 d-flex align-items-center justify-content-center gap-2 shadow-sm text-white"
                  disabled={cargando}
                  style={{ backgroundColor: '#111111' }}
                >
                  {cargando ? 'Enviando...' : 'Enviar instrucciones'}
                  {!cargando && <ArrowRight size={16} />}
                </Button>
              </Form>
            )}

          </Card.Body>
        </Card>

      </Container>
    </div>
  );
};

export default OlvidePassword;