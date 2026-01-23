import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/common/Layout";
import Loading from "./components/common/Loading";
import { useAuth } from "./context/AuthContext";

// Lazy loading de componentes de páginas
const Login = lazy(() => import("./pages/Login"));
const EsqueciSenha = lazy(() => import("./pages/EsqueciSenha"));
const ResetarSenha = lazy(() => import("./pages/ResetarSenha"));
const Conjuntos = lazy(() => import("./pages/Conjuntos"));
const InstrucoesConjuntos = lazy(() => import("./pages/InstrucoesConjuntos"));
const DetalhesConjunto = lazy(() => import("./pages/DetalhesConjunto"));
const Limites = lazy(() => import("./pages/Limites"));
const NovoTreino = lazy(() => import("./pages/NovoTreino"));
const InstrucoesTreino = lazy(() => import("./pages/InstrucoesTreino"));
const Operacoes = lazy(() => import("./pages/Operacoes"));
const Perfil = lazy(() => import("./pages/Perfil"));
const InstrucoesPerfil = lazy(() => import("./pages/InstrucoesPerfil"));
const Planos = lazy(() => import("./pages/Planos"));
const Rankings = lazy(() => import("./pages/Rankings"));
const InstrucoesRankings = lazy(() => import("./pages/InstrucoesRankings"));
const Recordes = lazy(() => import("./pages/Recordes"));
const InstrucoesRecordes = lazy(() => import("./pages/InstrucoesRecordes"));
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
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/resetar-senha" element={<ResetarSenha />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/novo-treino" element={<NovoTreino />} />
          <Route path="/instrucoes/novo-treino" element={<InstrucoesTreino />} />
          <Route path="/treino-ativo" element={<TreinoAtivo />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/instrucoes/perfil" element={<InstrucoesPerfil />} />
          <Route path="/recordes" element={<Recordes />} />
          <Route path="/instrucoes/recordes" element={<InstrucoesRecordes />} />
          <Route path="/rankings" element={<Rankings />} />
          <Route path="/instrucoes/rankings" element={<InstrucoesRankings />} />
          <Route path="/conjuntos" element={<Conjuntos />} />
          <Route path="/instrucoes/conjuntos" element={<InstrucoesConjuntos />} />
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
