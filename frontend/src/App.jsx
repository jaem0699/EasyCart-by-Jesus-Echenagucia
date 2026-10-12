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

  const [authModo, setAuthModo] = useState('login'); // 'login', 'registro', 'recuperar'

  const handleLogout = () => {
    localStorage.removeItem('token');
    setTokenJWT(null);
    window.location.href = '/'; // Redirige al inicio para limpiar la ruta pública
  };

  return (
    <div>
      {/* PRIORIDAD ABSOLUTA: Si es una ruta pública, mostramos estrictamente la Carta Pública */}
      {esRutaPublica ? (
        <>
          {/* Botón flotante opcional para volver al Portal B2B si lo desean */}
          <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
            <button 
              className="btn btn-sm btn-dark rounded-pill shadow px-3"
              onClick={() => { window.location.href = '/'; }}
            >
              Portal Restaurantes (B2B)
            </button>
          </div>
          <CartaPublica />
        </>
      ) : tokenResetUrl ? (
        <ResetPassword irALogin={() => { window.location.href = '/'; }} />
      ) : tokenJWT ? (
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
            }}
            irARegistro={() => setAuthModo('registro')}
            irARecuperar={() => setAuthModo('recuperar')}
          />
        )
      )}
    </div>
  );
}

export default App;