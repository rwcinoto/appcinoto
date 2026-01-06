import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { Navigate } from "react-router-dom";
import ListaSistemas from "../components/sistemas/ListaSistemas";
import ModalSistema from "../components/sistemas/ModalSistema";
import Loading from "../components/common/Loading";
import { useAuth } from "../context/AuthContext";
import { debounce } from "../utils/debounce";
import { logError } from "../utils/errorHandler";
import api from "../services/api";
import "./Sistemas.css";

const Sistemas = () => {
  const { usuario } = useAuth();
  const [sistemas, setSistemas] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [buscaDebounced, setBuscaDebounced] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroPlano, setFiltroPlano] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [sistemaEditando, setSistemaEditando] = useState(null);
  const [sistemasTodos, setSistemasTodos] = useState([]);

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

  const carregarSistemas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/sistemas");
      setSistemasTodos(response.data);
    } catch (error) {
      logError("Sistemas - carregarSistemas", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Aplicar filtros usando useMemo
  const sistemasFiltrados = useMemo(() => {
    let sistemasData = sistemasTodos;

    if (buscaDebounced.trim()) {
      sistemasData = sistemasData.filter(
        (sistema) =>
          (sistema.descricao &&
            sistema.descricao.toLowerCase().includes(buscaDebounced.toLowerCase())) ||
          sistema.tipo.toLowerCase().includes(buscaDebounced.toLowerCase())
      );
    }

    if (filtroTipo) {
      sistemasData = sistemasData.filter(
        (sistema) => sistema.tipo === filtroTipo
      );
    }

    if (filtroPlano) {
      sistemasData = sistemasData.filter(
        (sistema) => sistema.id_plano === parseInt(filtroPlano)
      );
    }

    return sistemasData;
  }, [sistemasTodos, buscaDebounced, filtroTipo, filtroPlano]);

  useEffect(() => {
    setSistemas(sistemasFiltrados);
  }, [sistemasFiltrados]);

  useEffect(() => {
    if (usuario && usuario.tipo === "admin") {
      carregarPlanos();
      carregarSistemas();
    }
  }, [usuario, carregarPlanos, carregarSistemas]);

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

  const handleCriarSistema = () => {
    setSistemaEditando(null);
    setModalAberto(true);
  };

  const handleEditarSistema = (sistema) => {
    setSistemaEditando(sistema);
    setModalAberto(true);
  };

  const handleExcluirSistema = async (sistemaId) => {
    if (
      !window.confirm(
        "Deseja realmente excluir este sistema? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/sistemas/${sistemaId}`);
      carregarSistemas();
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir sistema";
      alert(mensagemErro);
      console.error("Erro ao excluir sistema:", error);
    }
  };

  const handleModalFechar = () => {
    setModalAberto(false);
    setSistemaEditando(null);
  };

  const handleSistemaSalvo = () => {
    handleModalFechar();
    carregarSistemas();
  };

  const formatarTipo = (tipo) => {
    const tipos = {
      natural: "Natural",
      inteiro: "Inteiro",
      romano: "Romano",
      decimal: "Decimal",
      binario: "Binário",
      hexadecimal: "Hexadecimal",
    };
    return tipos[tipo] || tipo;
  };

  return (
    <div className="sistemas-container">
      <div className="sistemas-header">
        <h1>Sistemas</h1>
        <button className="btn-criar" onClick={handleCriarSistema}>
          + Criar sistema
        </button>
      </div>

      <div className="sistemas-filtros">
        <div className="filtro-group">
          <label>Busca</label>
          <input
            type="text"
            placeholder="Descrição ou tipo..."
            value={busca}
            onChange={handleBuscaChange}
          />
        </div>

        <div className="filtro-group">
          <label>Tipo</label>
          <select value={filtroTipo} onChange={handleFiltroTipoChange}>
            <option value="">Todos</option>
            <option value="natural">Natural</option>
            <option value="inteiro">Inteiro</option>
            <option value="romano">Romano</option>
            <option value="decimal">Decimal</option>
            <option value="binario">Binário</option>
            <option value="hexadecimal">Hexadecimal</option>
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
        <Loading text="Carregando sistemas..." />
      ) : (
        <ListaSistemas
          sistemas={sistemas}
          onEditar={handleEditarSistema}
          onExcluir={handleExcluirSistema}
          formatarTipo={formatarTipo}
        />
      )}

      {modalAberto && (
        <ModalSistema
          sistema={sistemaEditando}
          planos={planos}
          onFechar={handleModalFechar}
          onSalvo={handleSistemaSalvo}
        />
      )}
    </div>
  );
};

export default Sistemas;
