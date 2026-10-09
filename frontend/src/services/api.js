import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Interceptor para agregar el token JWT automáticamente a cada petición
api.interceptors.request.use(
    (config) => {
        // Asegúrate de usar la misma clave con la que guardas el token al hacer login (ej: 'token' o 'access_token')
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;