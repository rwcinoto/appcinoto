import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ListaRecordes from "../components/recordes/ListaRecordes";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage, logError } from "../utils/errorHandler";
import api from "../services/api";
import "./Recordes.css";

const Recordes = () => {
  const { usuario } = useAuth();
  const [searchParams] = useSearchParams();
  const usuarioIdParam = searchParams.get("usuario_id");
  const [usuarioVisualizado, setUsuarioVisualizado] = useState(null);
  const [recordes, setRecordes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limites, setLimites] = useState([]);
  const [sistemas, setSistemas] = useState([]);
  const [limiteSelecionado, setLimiteSelecionado] = useState("");
  const [sistemaSelecionado, setSistemaSelecionado] = useState("");
  const [erro, setErro] = useState("");

  const carregarDados = useCallback(async () => {
    setErro("");

    try {
      const [limitesRes, sistemasRes] = await Promise.all([
        api.get("/limites"),
        api.get("/sistemas"),
      ]);

      setLimites(limitesRes.data);
      setSistemas(sistemasRes.data);

      // Definir valores padrão para limite e sistema automaticamente
      const limitePadrao =
        limitesRes.data.find((l) => l.id === 1) || limitesRes.data[0];
      const sistemaPadrao =
        sistemasRes.data.find((s) => s.id === 1) || sistemasRes.data[0];

      if (limitePadrao) {
        setLimiteSelecionado(String(limitePadrao.id));
      }
      if (sistemaPadrao) {
        setSistemaSelecionado(String(sistemaPadrao.id));
      }
    } catch (error) {
      logError("Recordes - carregarDados", error);
      setErro(getErrorMessage(error));
    }
  }, []);

  // Carregar dados do usuário visualizado se houver usuario_id na URL
  useEffect(() => {
    const carregarUsuarioVisualizado = async () => {
      if (usuarioIdParam) {
        const usuarioId = parseInt(usuarioIdParam);
        if (!isNaN(usuarioId) && usuarioId !== usuario?.id) {
          try {
            const response = await api.get(`/usuarios/${usuarioId}/nome`);
            setUsuarioVisualizado(response.data);
          } catch (error) {
            logError("Recordes - carregarUsuarioVisualizado", error);
            setErro("Usuário não encontrado");
          }
        } else {
          setUsuarioVisualizado(null);
        }
      } else {
        setUsuarioVisualizado(null);
      }
    };

    if (usuario) {
      carregarUsuarioVisualizado();
    }
  }, [usuarioIdParam, usuario]);

  const carregarRecordes = useCallback(async () => {
    if (!limiteSelecionado || !sistemaSelecionado) {
      return;
    }

    setLoading(true);
    setErro("");

    try {
      // Construir query string com filtros
      const params = new URLSearchParams();
      params.append("limite_id", limiteSelecionado);
      params.append("sistema_id", sistemaSelecionado);
      
      // Adicionar usuario_id se estiver visualizando outro usuário
      if (usuarioIdParam) {
        const usuarioId = parseInt(usuarioIdParam);
        if (!isNaN(usuarioId) && usuarioId !== usuario?.id) {
          params.append("usuario_id", usuarioId.toString());
        }
      }

      const queryString = params.toString();
      const url = `/recordes?${queryString}`;

      const response = await api.get(url);
      setRecordes(response.data);
    } catch (error) {
      logError("Recordes - carregarRecordes", error);
      setErro(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [limiteSelecionado, sistemaSelecionado, usuarioIdParam, usuario]);

  useEffect(() => {
    if (usuario) {
      carregarDados();
    }
  }, [usuario, carregarDados]);

  useEffect(() => {
    if (limiteSelecionado && sistemaSelecionado) {
      carregarRecordes();
    }
  }, [limiteSelecionado, sistemaSelecionado, carregarRecordes]);

  if (!usuario) {
    return (
      <div className="recordes-container">
        <Loading text="Carregando..." />
      </div>
    );
  }

  const formatarTipoSistema = (tipo) => {
    const tipos = {
      natural: "Natural",
      romano: "Romano",
      binario: "Binário",
      inteiro: "Inteiro",
    };
    return tipos[tipo] || tipo;
  };

  const obterDescricaoSistema = (sistema) => {
    if (sistema.descricao) {
      return sistema.descricao;
    }
    return formatarTipoSistema(sistema.tipo);
  };

  const titulo = usuarioVisualizado 
    ? `Recordes de ${usuarioVisualizado.nome}` 
    : "Meus recordes";

  return (
    <div className="recordes-container">
      <div className="recordes-header">
        <h1>{titulo}</h1>
        <div className="filtros-header">
          {/* Limite de tempo */}
          {limites.length > 1 ? (
            <div className="select-group-filtro">
              <span className="filtro-label">Limite:</span>
              <select
                value={limiteSelecionado}
                onChange={(e) => setLimiteSelecionado(e.target.value)}
                className="select-limite"
              >
                {limites.map((limite) => (
                  <option key={limite.id} value={limite.id}>
                    {limite.descricao}
                  </option>
                ))}
              </select>
            </div>
          ) : limites.length === 1 ? (
            <div className="filtro-valor-unico">
              <span className="filtro-label">Limite:</span>
              <span className="filtro-valor">{limites[0].descricao}</span>
            </div>
          ) : null}

          {/* Sistema numérico */}
          {sistemas.length > 1 ? (
            <div className="select-group-filtro">
              <span className="filtro-label">Sistema:</span>
              <select
                value={sistemaSelecionado}
                onChange={(e) => setSistemaSelecionado(e.target.value)}
                className="select-sistema"
              >
                {sistemas.map((sistema) => (
                  <option key={sistema.id} value={sistema.id}>
                    {obterDescricaoSistema(sistema)}
                  </option>
                ))}
              </select>
            </div>
          ) : sistemas.length === 1 ? (
            <div className="filtro-valor-unico">
              <span className="filtro-label">Sistema:</span>
              <span className="filtro-valor">
                {obterDescricaoSistema(sistemas[0])}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {erro && (
        <ErrorMessage
          message={erro}
          type="error"
          dismissible
          onDismiss={() => setErro("")}
        />
      )}

      <ListaRecordes 
        recordes={recordes} 
        loading={loading} 
        usuarioIdVisualizado={usuarioIdParam ? parseInt(usuarioIdParam) : null}
      />
    </div>
  );
};

export default Recordes;
