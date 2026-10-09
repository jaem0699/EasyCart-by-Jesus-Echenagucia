import React, { useState } from 'react';
import CartaPublica from './pages/CartaPublica';
import LoginAdmin from './pages/LoginAdmin';
import RegistroAdmin from './pages/RegistroAdmin';
import OlvidePassword from './pages/OlvidePassword';
import ResetPassword from './pages/ResetPassword';
import DashboardAdmin from './pages/DashboardAdmin';

function App() {
  const [tokenJWT, setTokenJWT] = useState(() => localStorage.getItem('token'));
  
  const queryParams = new URLSearchParams(window.location.search);
  const tokenResetUrl = queryParams.get('token');
  
  // DETECTOR DE RUTA PÚBLICA: Verificamos si el usuario entró explícitamente a ver una carta (ej. ?slug=... o /carta/...)
  const esRutaPublica = queryParams.has('slug') || window.location.pathname.includes('/carta');

  // Si hay un token activo, o si NO es una ruta pública, mostramos el flujo de administración por defecto.
  const [vistaAdmin, setVistaAdmin] = useState(() => {
    return Boolean(localStorage.getItem('token')) || Boolean(tokenResetUrl) || !esRutaPublica;
  }); 

  const [authModo, setAuthModo] = useState('login'); // 'login', 'registro', 'recuperar'

  const handleLogout = () => {
    localStorage.removeItem('token');
    setTokenJWT(null);
    setVistaAdmin(true); // Al salir, lo dejamos en el login del admin
  };

  return (
    <div>
      {/* Botón flotante para alternar entre la Carta Pública (si el usuario la busca) y el Admin */}
      {esRutaPublica && !tokenJWT && !tokenResetUrl && (
        <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
          <button 
            className="btn btn-sm btn-dark rounded-pill shadow px-3"
            onClick={() => setVistaAdmin(true)}
          >
            Portal Restaurantes (B2B)
          </button>
        </div>
      )}

      {/* Si viene un token de reseteo en la URL, mostramos ResetPassword */}
      {tokenResetUrl ? (
        <ResetPassword irALogin={() => { window.location.href = '/'; }} />
      ) : vistaAdmin ? (
        tokenJWT ? (
          <DashboardAdmin onLogout={handleLogout} />
        ) : (
          authModo === 'registro' ? (
            <RegistroAdmin 
              onRegistroSuccess={() => {
                alert('¡Registro exitoso! Por favor inicia sesión.');
                setAuthModo('login');
              }}
              irALogin={() => setAuthModo('login')}
            />
          ) : authModo === 'recuperar' ? (
            <OlvidePassword 
              irALogin={() => setAuthModo('login')}
            />
          ) : (
            <LoginAdmin 
              onLoginSuccess={(newToken) => {
                localStorage.setItem('token', newToken);
                setTokenJWT(newToken);
                setVistaAdmin(true);
              }}
              irARegistro={() => setAuthModo('registro')}
              irARecuperar={() => setAuthModo('recuperar')}
            />
          )
        )
      ) : (
        <CartaPublica />
      )}
    </div>
  );
}

export default App;