import React, { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import ListaPlanos from "../components/planos/ListaPlanos";
import ModalPlano from "../components/planos/ModalPlano";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Planos.css";

const Planos = () => {
  const { usuario } = useAuth();
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [planoEditando, setPlanoEditando] = useState(null);

  const carregarPlanos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/planos");
      let planosData = response.data;

      // Aplicar busca se houver
      if (busca.trim()) {
        planosData = planosData.filter(
          (plano) =>
            plano.nome.toLowerCase().includes(busca.toLowerCase()) ||
            (plano.descricao &&
              plano.descricao.toLowerCase().includes(busca.toLowerCase()))
        );
      }

      setPlanos(planosData);
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
    } finally {
      setLoading(false);
    }
  }, [busca]);

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
    setBusca(e.target.value);
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
          + Criar Plano
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
        <div className="loading">Carregando...</div>
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
