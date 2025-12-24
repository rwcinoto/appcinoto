import axios from "axios";

// Em desenvolvimento: usa o proxy configurado no package.json
// Em produção: usa path relativo (mesmo domínio)
const api = axios.create({
  baseURL: "/api", // Path relativo - funciona em dev (via proxy) e produção
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
