import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { Navigate } from "react-router-dom";
import ListaPlanos from "../components/planos/ListaPlanos";
import ModalPlano from "../components/planos/ModalPlano";
import Loading from "../components/common/Loading";
import { useAuth } from "../context/AuthContext";
import { debounce } from "../utils/debounce";
import { logError } from "../utils/errorHandler";
import api from "../services/api";
import "./Planos.css";

const Planos = () => {
  const { usuario } = useAuth();
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [buscaDebounced, setBuscaDebounced] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [planoEditando, setPlanoEditando] = useState(null);
  const [planosTodos, setPlanosTodos] = useState([]);

  // Debounce para busca
  const debouncedBusca = useRef(
    debounce((valor) => {
      setBuscaDebounced(valor);
    }, 300)
  ).current;

  const carregarPlanos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/planos");
      setPlanosTodos(response.data);
    } catch (error) {
      logError("Planos - carregarPlanos", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Aplicar busca usando useMemo
  const planosFiltrados = useMemo(() => {
    if (buscaDebounced.trim()) {
      return planosTodos.filter(
        (plano) =>
          plano.nome.toLowerCase().includes(buscaDebounced.toLowerCase()) ||
          (plano.descricao &&
            plano.descricao.toLowerCase().includes(buscaDebounced.toLowerCase()))
      );
    }
    return planosTodos;
  }, [planosTodos, buscaDebounced]);

  useEffect(() => {
    setPlanos(planosFiltrados);
  }, [planosFiltrados]);

  useEffect(() => {
    if (usuario && usuario.tipo === "admin") {
      carregarPlanos();
    }
  }, [usuario, carregarPlanos]);

  // Redirecionar se não for admin
  if (!usuario || usuario.tipo !== "admin") {
    return <Navigate to="/novo-treino" />;
  }

  const handleBuscaChange = (e) => {
    const valor = e.target.value;
    setBusca(valor);
    debouncedBusca(valor);
  };

  const handleCriarPlano = () => {
    setPlanoEditando(null);
    setModalAberto(true);
  };

  const handleEditarPlano = (plano) => {
    setPlanoEditando(plano);
    setModalAberto(true);
  };

  const handleExcluirPlano = async (planoId) => {
    if (
      !window.confirm(
        "Deseja realmente excluir este plano? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/planos/${planoId}`);
      carregarPlanos();
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir plano";
      alert(mensagemErro);
      console.error("Erro ao excluir plano:", error);
    }
  };

  const handleModalFechar = () => {
    setModalAberto(false);
    setPlanoEditando(null);
  };

  const handlePlanoSalvo = () => {
    handleModalFechar();
    carregarPlanos();
  };

  return (
    <div className="planos-container">
      <div className="planos-header">
        <h1>Planos</h1>
        <button className="btn-criar" onClick={handleCriarPlano}>
          + Criar plano
        </button>
      </div>

      <div className="planos-filtros">
        <div className="filtro-group">
          <label>Busca</label>
          <input
            type="text"
            placeholder="Nome ou descrição..."
            value={busca}
            onChange={handleBuscaChange}
          />
        </div>
      </div>

      {loading ? (
        <Loading text="Carregando planos..." />
      ) : (
        <ListaPlanos
          planos={planos}
          onEditar={handleEditarPlano}
          onExcluir={handleExcluirPlano}
        />
      )}

      {modalAberto && (
        <ModalPlano
          plano={planoEditando}
          onFechar={handleModalFechar}
          onSalvo={handlePlanoSalvo}
        />
      )}
    </div>
  );
};

export default Planos;
