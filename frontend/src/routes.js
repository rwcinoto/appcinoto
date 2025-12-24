import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/common/Layout";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import NovoTreino from "./pages/NovoTreino";
import Perfil from "./pages/Perfil";
import Usuarios from "./pages/Usuarios";

const PrivateRoute = ({ children }) => {
  const { usuario, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return usuario ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/novo-treino" element={<NovoTreino />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/" element={<Navigate to="/novo-treino" replace />} />
        {/* Rotas futuras - descomentar quando criadas */}
        {/* <Route path="/recordes" element={<Recordes />} /> */}
        {/* <Route path="/rankings" element={<Rankings />} /> */}
        {/* <Route path="/conjuntos" element={<Conjuntos />} /> */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
