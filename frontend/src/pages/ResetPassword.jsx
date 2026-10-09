import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Lock, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';

const ResetPassword = ({ irALogin }) => {
  // Extraemos el token directamente de los parámetros de búsqueda de la URL (ej. ?token=XYZ)
  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor, revísalas.');
      return;
    }

    if (!token) {
      setError('El token de recuperación no es válido o no está presente en el enlace.');
      return;
    }

    setCargando(true);

    try {
      // Conectamos con tu endpoint de Flask
      await api.post('/auth/reset-password', {
        token,
        password
      });

      setCargando(false);
      setExito(true);
    } catch (err) {
      setCargando(false);
      setError(err.response?.data?.error || 'El enlace ha expirado o es inválido. Solicita uno nuevo.');
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center px-3 py-5">
      <Container style={{ maxWidth: '420px' }}>
        
        <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
          <Card.Body className="p-0">
            
            <div className="text-center mb-4">
              <h3 className="fw-bold text-dark mb-1">Nueva Contraseña</h3>
              <p className="text-muted small">Ingresa y confirma tu nueva clave de acceso</p>
            </div>

            {error && (
              <Alert variant="danger" className="rounded-3 small py-2">
                {error}
              </Alert>
            )}

            {exito ? (
              <div className="text-center py-4">
                <div className="bg-success bg-opacity-10 text-success rounded-circle p-3 d-inline-flex mb-3">
                  <CheckCircle size={32} />
                </div>
                <h5 className="fw-bold text-dark mb-2">¡Contraseña Actualizada!</h5>
                <p className="text-muted small mb-4">
                  Tu contraseña se ha modificado correctamente. Ya puedes iniciar sesión en tu panel B2B.
                </p>
                <Button
                  className="w-100 rounded-pill py-2.5 fw-bold border-0 text-white bg-dark"
                  onClick={irALogin}
                >
                  Ir al Inicio de Sesión
                </Button>
              </div>
            ) : (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formNewPassword">
                  <Form.Label className="small fw-semibold text-muted">Nueva contraseña</Form.Label>
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

                <Form.Group className="mb-4" controlId="formConfirmPassword">
                  <Form.Label className="small fw-semibold text-muted">Confirmar contraseña</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 rounded-start-pill ps-3">
                      <Lock size={16} className="text-muted" />
                    </span>
                    <Form.Control
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                  {cargando ? 'Actualizando...' : 'Restablecer contraseña'}
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

export default ResetPassword;