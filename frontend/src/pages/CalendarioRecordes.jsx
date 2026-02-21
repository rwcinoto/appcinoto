import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ErrorMessage from "../components/common/ErrorMessage";
import Loading from "../components/common/Loading";
import ListaRecordesCalendario from "../components/recordes/ListaRecordesCalendario";
import ListaUltimosRecordesCalendarioBatidos from "../components/recordes/ListaUltimosRecordesCalendarioBatidos";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getErrorMessage, logError } from "../utils/errorHandler";
import "./Recordes.css";

const TIPOS_CALENDARIO = [
  { value: "", label: "Todos" },
  { value: "data_geral", label: "Data 1582-2399" },
  { value: "dia", label: "Dia" },
  { value: "mes", label: "Mês" },
  { value: "ano", label: "Ano" },
  { value: "seculo", label: "Século" },
  { value: "data_esse_ano", label: "Data esse ano" },
  { value: "data_2021", label: "Data 1900-2099" },
];

const CalendarioRecordes = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const usuarioIdParam = searchParams.get("usuario_id");

  const [usuarioVisualizado, setUsuarioVisualizado] = useState(null);
  const [recordes, setRecordes] = useState([]);
  const [limites, setLimites] = useState([]);
  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [limiteSelecionado, setLimiteSelecionado] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const carregarDadosBasicos = useCallback(async () => {
    setErro("");

    try {
      // Se estiver visualizando outro usuário, passar usuario_id para que limites sigam o plano dele
      const params = new URLSearchParams();
      if (usuarioIdParam) {
        const usuarioId = parseInt(usuarioIdParam);
        if (!isNaN(usuarioId) && usuarioId !== 0 && usuarioId !== usuario?.id) {
          params.append("usuario_id", usuarioId.toString());
        }
      }

      const queryString = params.toString();
      const querySuffix = queryString ? `?${queryString}` : "";

      const limitesRes = await api.get(`/limites${querySuffix}`);
      setLimites(limitesRes.data);
    } catch (error) {
      logError("CalendarioRecordes - carregarDadosBasicos", error);
      setErro(getErrorMessage(error));
    }
  }, [usuarioIdParam, usuario]);

  // Carregar dados do usuário visualizado (quando vindo do ranking de outra pessoa)
  useEffect(() => {
    const carregarUsuarioVisualizado = async () => {
      if (usuarioIdParam) {
        const usuarioId = parseInt(usuarioIdParam);
        if (!isNaN(usuarioId) && usuarioId !== 0 && usuarioId !== usuario?.id) {
          try {
            const response = await api.get(`/usuarios/${usuarioId}/nome`);
            setUsuarioVisualizado(response.data);
          } catch (error) {
            logError("CalendarioRecordes - carregarUsuarioVisualizado", error);
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
    setLoading(true);
    setErro("");

    try {
      const params = new URLSearchParams();

      if (tipoSelecionado) {
        params.append("tipo", tipoSelecionado);
      }

      if (limiteSelecionado) {
        params.append("limite_id", limiteSelecionado);
      }

      // Adicionar usuario_id se estiver visualizando outro usuário
      if (usuarioIdParam) {
        const usuarioId = parseInt(usuarioIdParam);
        if (!isNaN(usuarioId) && usuarioId !== 0 && usuarioId !== usuario?.id) {
          params.append("usuario_id", usuarioId.toString());
        }
      } else if (usuario?.isVisitante) {
        // Visitantes não têm recordes salvos – usar id=0 para receber array vazio
        params.append("usuario_id", "0");
      }

      const queryString = params.toString();
      const url = `/calendario/recordes${queryString ? `?${queryString}` : ""}`;

      const response = await api.get(url);
      setRecordes(response.data || []);
    } catch (error) {
      logError("CalendarioRecordes - carregarRecordes", error);
      setErro(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [tipoSelecionado, limiteSelecionado, usuarioIdParam, usuario]);

  useEffect(() => {
    if (usuario) {
      carregarDadosBasicos();
    }
  }, [usuario, usuarioIdParam, carregarDadosBasicos]);

  useEffect(() => {
    if (usuario) {
      carregarRecordes();
    }
  }, [usuario, carregarRecordes]);

  if (!usuario) {
    return (
      <div className="recordes-container">
        <Loading text="Carregando..." />
      </div>
    );
  }

  const titulo = usuarioVisualizado
    ? `Recordes de calendário de ${usuarioVisualizado.nome}`
    : "Meus recordes de calendário";

  const LIMITE_EXIBICAO = 40;
  const totalRecordes = recordes.length;
  const recordesExibidos = recordes.slice(0, LIMITE_EXIBICAO);
  const temMaisRecordes = totalRecordes > LIMITE_EXIBICAO;

  return (
    <div className="recordes-container">
      <div className="recordes-header">
        <div className="recordes-titulo-container">
          <div className="titulo-com-ajuda">
            <h1>{titulo}</h1>
            <button
              className="btn-ajuda"
              onClick={() => navigate("/instrucoes/calendario-recordes")}
              title="Ver instruções sobre recordes de calendário"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
          </div>
          {temMaisRecordes && (
            <span className="recordes-contador">
              (mostrando {LIMITE_EXIBICAO} de {totalRecordes})
            </span>
          )}
        </div>

        <div className="filtros-header">
          {/* Tipo de treino de calendário */}
          <div className="select-group-filtro">
            <span className="filtro-label">Tipo:</span>
            <select
              value={tipoSelecionado}
              onChange={(e) => setTipoSelecionado(e.target.value)}
              className="select-filtro"
            >
              {TIPOS_CALENDARIO.map((tipo) => (
                <option key={tipo.value || "todos"} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Limite de tempo */}
          <div className="select-group-filtro">
            <span className="filtro-label">Limite:</span>
            <select
              value={limiteSelecionado}
              onChange={(e) => setLimiteSelecionado(e.target.value)}
              className="select-filtro"
            >
              <option value="">Todos</option>
              {limites.map((limite) => (
                <option key={limite.id} value={limite.id}>
                  {limite.descricao}
                </option>
              ))}
            </select>
          </div>
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

      <ListaRecordesCalendario
        recordes={recordesExibidos}
        loading={loading}
        usuarioIdVisualizado={usuarioIdParam ? parseInt(usuarioIdParam) : null}
        isVisitante={usuario?.isVisitante || false}
      />

      <ListaUltimosRecordesCalendarioBatidos />
    </div>
  );
};

export default CalendarioRecordes;
