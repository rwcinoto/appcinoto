import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { Navigate } from "react-router-dom";
import ListaLimites from "../components/limites/ListaLimites";
import ModalLimite from "../components/limites/ModalLimite";
import Loading from "../components/common/Loading";
import { useAuth } from "../context/AuthContext";
import { debounce } from "../utils/debounce";
import { logError } from "../utils/errorHandler";
import api from "../services/api";
import "./Limites.css";

const Limites = () => {
  const { usuario } = useAuth();
  const [limites, setLimites] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [buscaDebounced, setBuscaDebounced] = useState("");
  const [filtroPlano, setFiltroPlano] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [limiteEditando, setLimiteEditando] = useState(null);
  const [limitesTodos, setLimitesTodos] = useState([]);

  // Debounce para busca
  const debouncedBusca = useRef(
    debounce((valor) => {
      setBuscaDebounced(valor);
    }, 300)
  ).current;

  const carregarPlanos = useCallback(async () => {
    try {
      const response = await api.get("/planos");
      setPlanos(response.data);
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
    }
  }, []);

  const carregarLimites = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/limites");
      setLimitesTodos(response.data);
    } catch (error) {
      logError("Limites - carregarLimites", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Aplicar filtros usando useMemo
  const limitesFiltrados = useMemo(() => {
    let limitesData = limitesTodos;

    if (buscaDebounced.trim()) {
      limitesData = limitesData.filter((limite) =>
        limite.descricao.toLowerCase().includes(buscaDebounced.toLowerCase())
      );
    }

    if (filtroPlano) {
      limitesData = limitesData.filter(
        (limite) => limite.id_plano === parseInt(filtroPlano)
      );
    }

    return limitesData;
  }, [limitesTodos, buscaDebounced, filtroPlano]);

  useEffect(() => {
    setLimites(limitesFiltrados);
  }, [limitesFiltrados]);

  useEffect(() => {
    if (usuario && usuario.tipo === "admin") {
      carregarPlanos();
      carregarLimites();
    }
  }, [usuario, carregarPlanos, carregarLimites]);

  if (!usuario || usuario.tipo !== "admin") {
    return <Navigate to="/novo-treino" />;
  }

  const handleBuscaChange = (e) => {
    const valor = e.target.value;
    setBusca(valor);
    debouncedBusca(valor);
  };

  const handleFiltroPlanoChange = (e) => {
    setFiltroPlano(e.target.value);
  };

  const handleCriarLimite = () => {
    setLimiteEditando(null);
    setModalAberto(true);
  };

  const handleEditarLimite = (limite) => {
    setLimiteEditando(limite);
    setModalAberto(true);
  };

  const handleExcluirLimite = async (limiteId) => {
    if (
      !window.confirm(
        "Deseja realmente excluir este limite? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/limites/${limiteId}`);
      carregarLimites();
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir limite";
      alert(mensagemErro);
      console.error("Erro ao excluir limite:", error);
    }
  };

  const handleModalFechar = () => {
    setModalAberto(false);
    setLimiteEditando(null);
  };

  const handleLimiteSalvo = () => {
    handleModalFechar();
    carregarLimites();
  };

  return (
    <div className="limites-container">
      <div className="limites-header">
        <h1>Limites</h1>
        <button className="btn-criar" onClick={handleCriarLimite}>
          + Criar limite
        </button>
      </div>

      <div className="limites-filtros">
        <div className="filtro-group">
          <label>Busca</label>
          <input
            type="text"
            placeholder="Descrição..."
            value={busca}
            onChange={handleBuscaChange}
          />
        </div>

        <div className="filtro-group">
          <label>Plano</label>
          <select value={filtroPlano} onChange={handleFiltroPlanoChange}>
            <option value="">Todos</option>
            {planos.map((plano) => (
              <option key={plano.id} value={plano.id}>
                {plano.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <Loading text="Carregando limites..." />
      ) : (
        <ListaLimites
          limites={limites}
          onEditar={handleEditarLimite}
          onExcluir={handleExcluirLimite}
        />
      )}

      {modalAberto && (
        <ModalLimite
          limite={limiteEditando}
          planos={planos}
          onFechar={handleModalFechar}
          onSalvo={handleLimiteSalvo}
        />
      )}
    </div>
  );
};

export default Limites;
