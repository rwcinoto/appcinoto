import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { Navigate } from "react-router-dom";
import ListaOperacoes from "../components/operacoes/ListaOperacoes";
import ModalOperacao from "../components/operacoes/ModalOperacao";
import Loading from "../components/common/Loading";
import { useAuth } from "../context/AuthContext";
import { debounce } from "../utils/debounce";
import { logError } from "../utils/errorHandler";
import api from "../services/api";
import "./Operacoes.css";

const Operacoes = () => {
  const { usuario } = useAuth();
  const [operacoes, setOperacoes] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [buscaDebounced, setBuscaDebounced] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroPlano, setFiltroPlano] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [operacaoEditando, setOperacaoEditando] = useState(null);
  const [operacoesTodos, setOperacoesTodos] = useState([]);

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

  const carregarOperacoes = useCallback(async () => {
    setLoading(true);
    try {
      // Admin vê todas, usuário comum vê apenas do seu plano
      const response = await api.get("/operacoes");
      setOperacoesTodos(response.data);
    } catch (error) {
      logError("Operacoes - carregarOperacoes", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Aplicar filtros usando useMemo para evitar recálculos desnecessários
  const operacoesFiltradas = useMemo(() => {
    let operacoesData = operacoesTodos;

    // Aplicar filtros
    if (buscaDebounced.trim()) {
      operacoesData = operacoesData.filter(
        (operacao) =>
          operacao.nome.toLowerCase().includes(buscaDebounced.toLowerCase()) ||
          (operacao.descricao &&
            operacao.descricao.toLowerCase().includes(buscaDebounced.toLowerCase()))
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

    return operacoesData;
  }, [operacoesTodos, buscaDebounced, filtroTipo, filtroPlano]);

  useEffect(() => {
    setOperacoes(operacoesFiltradas);
  }, [operacoesFiltradas]);

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
    const valor = e.target.value;
    setBusca(valor);
    debouncedBusca(valor);
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
        <Loading text="Carregando operações..." />
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
