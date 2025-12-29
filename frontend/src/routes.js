import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/common/Layout";
import { useAuth } from "./context/AuthContext";
import Limites from "./pages/Limites";
import Login from "./pages/Login";
import NovoTreino from "./pages/NovoTreino";
import Operacoes from "./pages/Operacoes";
import Perfil from "./pages/Perfil";
import Planos from "./pages/Planos";
import Rankings from "./pages/Rankings";
import Recordes from "./pages/Recordes";
import Sistemas from "./pages/Sistemas";
import TreinoAtivo from "./pages/TreinoAtivo";
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
        <Route path="/treino-ativo" element={<TreinoAtivo />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/recordes" element={<Recordes />} />
        <Route path="/rankings" element={<Rankings />} />
        <Route path="/usuarios" element={<Usuarios />} />
        {/* Rotas de cadastros */}
        <Route path="/cadastros/planos" element={<Planos />} />
        <Route path="/cadastros/operacoes" element={<Operacoes />} />
        <Route path="/cadastros/limites" element={<Limites />} />
        <Route path="/cadastros/sistemas" element={<Sistemas />} />
        <Route path="/" element={<Navigate to="/novo-treino" replace />} />
        {/* <Route path="/conjuntos" element={<Conjuntos />} /> */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
