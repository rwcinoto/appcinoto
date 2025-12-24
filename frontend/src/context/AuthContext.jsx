import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      carregarUsuario();
    } else {
      setLoading(false);
    }
  }, []);

  const carregarUsuario = async () => {
    try {
      const response = await api.get("/auth/me");
      setUsuario(response.data);
    } catch (error) {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, senha) => {
    const response = await api.post("/auth/login", { email, senha });
    const { token, usuario } = response.data;

    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUsuario(usuario);

    return usuario;
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUsuario(null);
  };

  const atualizarUsuario = async () => {
    try {
      const response = await api.get("/auth/me");
      setUsuario(response.data);
    } catch (error) {
      console.error("Erro ao atualizar dados do usuário:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ usuario, loading, login, logout, atualizarUsuario }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
};
