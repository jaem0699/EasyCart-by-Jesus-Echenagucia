import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import api from '../services/api';

const LoginAdmin = ({ onLoginSuccess, irARegistro, irARecuperar }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data.access_token;
      localStorage.setItem('token', token);
      setCargando(false);
      
      if (onLoginSuccess) onLoginSuccess(token);
    } catch (err) {
      setCargando(false);
      setError(err.response?.data?.message || 'Credenciales incorrectas. Verifica tus datos.');
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center px-3">
      <Container style={{ maxWidth: '420px' }}>
        
        <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
          <Card.Body className="p-0">
            
            <div className="text-center mb-4">
              <h3 className="fw-bold text-dark mb-1">EasyCart Admin</h3>
              <p className="text-muted small">Inicia sesión para gestionar tu restaurante</p>
            </div>

            {error && (
              <Alert variant="danger" className="rounded-3 small py-2">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formEmail">
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

              <Form.Group className="mb-2" controlId="formPassword">
                <Form.Label className="small fw-semibold text-muted">Contraseña</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 rounded-start-pill ps-3">
                    <Lock size={16} className="text-muted" />
                  </span>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-start-0 bg-light rounded-end-pill py-2 small shadow-none"
                  />
                </div>
              </Form.Group>

              {/* Enlace de recuperación de contraseña */}
              <div className="d-flex justify-content-end mb-4">
                <button 
                  type="button"
                  className="btn btn-link p-0 text-muted small text-decoration-none"
                  onClick={irARecuperar}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button
                type="submit"
                className="w-100 rounded-pill py-2.5 fw-bold border-0 d-flex align-items-center justify-content-center gap-2 shadow-sm text-white"
                disabled={cargando}
                style={{ backgroundColor: '#111111' }}
              >
                {cargando ? 'Verificando...' : 'Acceder al Panel'}
                {!cargando && <ArrowRight size={16} />}
              </Button>
            </Form>

            <div className="text-center mt-3">
              <span className="text-muted small">¿Aún no tienes cuenta? </span>
              <button 
                className="btn btn-link p-0 text-dark fw-bold small text-decoration-none"
                onClick={irARegistro}
              >
                Regístrate gratis
              </button>
            </div>

          </Card.Body>
        </Card>

        <div className="text-center mt-4">
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>
            Plataforma B2B2C Powered by EasyCart © 2026
          </span>
        </div>

      </Container>
    </div>
  );
};

export default LoginAdmin;