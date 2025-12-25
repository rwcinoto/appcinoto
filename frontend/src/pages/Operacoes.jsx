import React, { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import ListaOperacoes from "../components/operacoes/ListaOperacoes";
import ModalOperacao from "../components/operacoes/ModalOperacao";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Operacoes.css";

const Operacoes = () => {
  const { usuario } = useAuth();
  const [operacoes, setOperacoes] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroPlano, setFiltroPlano] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [operacaoEditando, setOperacaoEditando] = useState(null);

  const carregarPlanos = useCallback(async () => {
    try {
      const response = await api.get("/planos");
      setPlanos(response.data);
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
    }
  }, []);

  const carregarOperacoes = useCallback(async () => {
    setLoading(true);
    try {
      // Admin vê todas, usuário comum vê apenas do seu plano
      const response = await api.get("/operacoes");
      let operacoesData = response.data;

      // Aplicar filtros
      if (busca.trim()) {
        operacoesData = operacoesData.filter(
          (operacao) =>
            operacao.nome.toLowerCase().includes(busca.toLowerCase()) ||
            (operacao.descricao &&
              operacao.descricao.toLowerCase().includes(busca.toLowerCase()))
        );
      }

      if (filtroTipo) {
        operacoesData = operacoesData.filter(
          (operacao) => operacao.tipo === filtroTipo
        );
      }

      if (filtroPlano) {
        operacoesData = operacoesData.filter(
          (operacao) => operacao.id_plano === parseInt(filtroPlano)
        );
      }

      setOperacoes(operacoesData);
    } catch (error) {
      console.error("Erro ao carregar operações:", error);
    } finally {
      setLoading(false);
    }
  }, [busca, filtroTipo, filtroPlano]);

  useEffect(() => {
    if (usuario && usuario.tipo === "admin") {
      carregarPlanos();
      carregarOperacoes();
    }
  }, [usuario, carregarPlanos, carregarOperacoes]);

  // Redirecionar se não for admin
  if (!usuario || usuario.tipo !== "admin") {
    return <Navigate to="/novo-treino" />;
  }

  const handleBuscaChange = (e) => {
    setBusca(e.target.value);
  };

  const handleFiltroTipoChange = (e) => {
    setFiltroTipo(e.target.value);
  };

  const handleFiltroPlanoChange = (e) => {
    setFiltroPlano(e.target.value);
  };

  const handleCriarOperacao = () => {
    setOperacaoEditando(null);
    setModalAberto(true);
  };

  const handleEditarOperacao = (operacao) => {
    setOperacaoEditando(operacao);
    setModalAberto(true);
  };

  const handleExcluirOperacao = async (operacaoId) => {
    if (
      !window.confirm(
        "Deseja realmente excluir esta operação? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/operacoes/${operacaoId}`);
      carregarOperacoes();
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir operação";
      alert(mensagemErro);
      console.error("Erro ao excluir operação:", error);
    }
  };

  const handleModalFechar = () => {
    setModalAberto(false);
    setOperacaoEditando(null);
  };

  const handleOperacaoSalva = () => {
    handleModalFechar();
    carregarOperacoes();
  };

  return (
    <div className="operacoes-container">
      <div className="operacoes-header">
        <h1>Operações</h1>
        <button className="btn-criar" onClick={handleCriarOperacao}>
          + Criar operação
        </button>
      </div>

      <div className="operacoes-filtros">
        <div className="filtro-group">
          <label>Busca</label>
          <input
            type="text"
            placeholder="Nome ou descrição..."
            value={busca}
            onChange={handleBuscaChange}
          />
        </div>

        <div className="filtro-group">
          <label>Tipo</label>
          <select value={filtroTipo} onChange={handleFiltroTipoChange}>
            <option value="">Todos</option>
            <option value="soma">Soma</option>
            <option value="subtracao">Subtração</option>
            <option value="multiplicacao">Multiplicação</option>
            <option value="divisao">Divisão</option>
            <option value="raiz">Raiz</option>
          </select>
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
        <div className="loading">Carregando...</div>
      ) : (
        <ListaOperacoes
          operacoes={operacoes}
          onEditar={handleEditarOperacao}
          onExcluir={handleExcluirOperacao}
        />
      )}

      {modalAberto && (
        <ModalOperacao
          operacao={operacaoEditando}
          planos={planos}
          onFechar={handleModalFechar}
          onSalvo={handleOperacaoSalva}
        />
      )}
    </div>
  );
};

export default Operacoes;
