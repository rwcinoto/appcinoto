import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/common/Layout";
import Loading from "./components/common/Loading";
import { useAuth } from "./context/AuthContext";

// Lazy loading de componentes de páginas
const Login = lazy(() => import("./pages/Login"));
const Conjuntos = lazy(() => import("./pages/Conjuntos"));
const DetalhesConjunto = lazy(() => import("./pages/DetalhesConjunto"));
const Limites = lazy(() => import("./pages/Limites"));
const NovoTreino = lazy(() => import("./pages/NovoTreino"));
const Operacoes = lazy(() => import("./pages/Operacoes"));
const Perfil = lazy(() => import("./pages/Perfil"));
const Planos = lazy(() => import("./pages/Planos"));
const Rankings = lazy(() => import("./pages/Rankings"));
const Recordes = lazy(() => import("./pages/Recordes"));
const Sistemas = lazy(() => import("./pages/Sistemas"));
const TreinoAtivo = lazy(() => import("./pages/TreinoAtivo"));
const Usuarios = lazy(() => import("./pages/Usuarios"));

const PrivateRoute = ({ children }) => {
  const { usuario, loading } = useAuth();

  if (loading) {
    return <Loading text="Carregando..." fullScreen />;
  }

  return usuario ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading text="Carregando..." fullScreen />}>
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
          <Route path="/conjuntos" element={<Conjuntos />} />
          <Route path="/conjuntos/:id" element={<DetalhesConjunto />} />
          <Route path="/usuarios" element={<Usuarios />} />
          {/* Rotas de cadastros */}
          <Route path="/cadastros/planos" element={<Planos />} />
          <Route path="/cadastros/operacoes" element={<Operacoes />} />
          <Route path="/cadastros/limites" element={<Limites />} />
          <Route path="/cadastros/sistemas" element={<Sistemas />} />
          <Route path="/" element={<Navigate to="/novo-treino" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
