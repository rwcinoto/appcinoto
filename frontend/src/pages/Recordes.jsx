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
  const [operacoes, setOperacoes] = useState([]);
  const [limites, setLimites] = useState([]);
  const [sistemas, setSistemas] = useState([]);
  const [planos, setPlanos] = useState([]);
  
  // Filtros opcionais
  const [operacaoSelecionada, setOperacaoSelecionada] = useState("");
  const [tipoOperacaoSelecionado, setTipoOperacaoSelecionado] = useState("");
  const [limiteSelecionado, setLimiteSelecionado] = useState("");
  const [sistemaSelecionado, setSistemaSelecionado] = useState("");
  const [planoSelecionado, setPlanoSelecionado] = useState("");
  
  const [erro, setErro] = useState("");

  const carregarDados = useCallback(async () => {
    setErro("");

    try {
      // Se estiver visualizando outro usuário, passar usuario_id para filtrar pelo plano dele
      const params = new URLSearchParams();
      if (usuarioIdParam) {
        const usuarioId = parseInt(usuarioIdParam);
        if (!isNaN(usuarioId) && usuarioId !== 0 && usuarioId !== usuario?.id) {
          params.append("usuario_id", usuarioId.toString());
        }
      }

      const queryString = params.toString();
      const querySuffix = queryString ? `?${queryString}` : "";

      const [operacoesRes, limitesRes, sistemasRes, planosRes] = await Promise.all([
        api.get(`/operacoes${querySuffix}`),
        api.get(`/limites${querySuffix}`),
        api.get(`/sistemas${querySuffix}`),
        api.get(`/planos${querySuffix}`),
      ]);

      setOperacoes(operacoesRes.data);
      setLimites(limitesRes.data);
      setSistemas(sistemasRes.data);
      setPlanos(planosRes.data);
    } catch (error) {
      logError("Recordes - carregarDados", error);
      setErro(getErrorMessage(error));
    }
  }, [usuarioIdParam, usuario]);

  // Carregar dados do usuário visualizado se houver usuario_id na URL
  useEffect(() => {
    const carregarUsuarioVisualizado = async () => {
      if (usuarioIdParam) {
        const usuarioId = parseInt(usuarioIdParam);
        // Visitantes podem ver recordes de outros usuários, mas não os seus próprios (id=0)
        if (!isNaN(usuarioId) && usuarioId !== 0 && usuarioId !== usuario?.id) {
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
    setLoading(true);
    setErro("");

    try {
      // Construir query string com filtros opcionais
      const params = new URLSearchParams();
      
      if (operacaoSelecionada) {
        params.append("operacao_id", operacaoSelecionada);
      }
      
      if (tipoOperacaoSelecionado) {
        params.append("tipo_operacao", tipoOperacaoSelecionado);
      }
      
      if (limiteSelecionado) {
        params.append("limite_id", limiteSelecionado);
      }
      
      if (sistemaSelecionado) {
        params.append("sistema_id", sistemaSelecionado);
      }
      
      if (planoSelecionado) {
        params.append("plano_id", planoSelecionado);
      }
      
      // Adicionar usuario_id se estiver visualizando outro usuário
      if (usuarioIdParam) {
        const usuarioId = parseInt(usuarioIdParam);
        // Visitantes podem ver recordes de outros usuários, mas não os seus próprios (id=0)
        if (!isNaN(usuarioId) && usuarioId !== 0 && usuarioId !== usuario?.id) {
          params.append("usuario_id", usuarioId.toString());
        }
      } else if (usuario?.isVisitante) {
        // Se for visitante e não houver usuario_id na URL, usar id=0 (retornará array vazio)
        params.append("usuario_id", "0");
      }

      const queryString = params.toString();
      const url = `/recordes${queryString ? `?${queryString}` : ""}`;

      const response = await api.get(url);
      setRecordes(response.data);
    } catch (error) {
      logError("Recordes - carregarRecordes", error);
      setErro(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [operacaoSelecionada, tipoOperacaoSelecionado, limiteSelecionado, sistemaSelecionado, planoSelecionado, usuarioIdParam, usuario]);

  useEffect(() => {
    if (usuario) {
      carregarDados();
    }
  }, [usuario, usuarioIdParam, carregarDados]);

  // Carregar recordes sempre (sem filtros obrigatórios)
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

  const formatarTipoSistema = (tipo) => {
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

  const formatarTipoOperacao = (tipo) => {
    const tipos = {
      soma: "Soma",
      subtracao: "Subtração",
      multiplicacao: "Multiplicação",
      divisao: "Divisão",
      raiz: "Raiz quadrada",
      aleatorio: "Aleatório",
      conversao: "Conversão",
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

  // Obter tipos únicos de operação para o filtro
  const tiposOperacao = Array.from(
    new Set(operacoes.map((op) => op.tipo))
  );

  return (
    <div className="recordes-container">
      <div className="recordes-header">
        <h1>{titulo}</h1>
        <div className="filtros-header">
          {/* Tipo de operação */}
          <div className="select-group-filtro">
            <span className="filtro-label">Tipo:</span>
            <select
              value={tipoOperacaoSelecionado}
              onChange={(e) => setTipoOperacaoSelecionado(e.target.value)}
              className="select-filtro"
            >
              <option value="">Todos</option>
              {tiposOperacao.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {formatarTipoOperacao(tipo)}
                </option>
              ))}
            </select>
          </div>

          {/* Nome da operação */}
          <div className="select-group-filtro">
            <span className="filtro-label">Operação:</span>
            <select
              value={operacaoSelecionada}
              onChange={(e) => setOperacaoSelecionada(e.target.value)}
              className="select-filtro"
            >
              <option value="">Todas</option>
              {operacoes.map((operacao) => (
                <option key={operacao.id} value={operacao.id}>
                  {operacao.nome}
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

          {/* Sistema numérico */}
          <div className="select-group-filtro">
            <span className="filtro-label">Sistema:</span>
            <select
              value={sistemaSelecionado}
              onChange={(e) => setSistemaSelecionado(e.target.value)}
              className="select-filtro"
            >
              <option value="">Todos</option>
              {sistemas.map((sistema) => (
                <option key={sistema.id} value={sistema.id}>
                  {obterDescricaoSistema(sistema)}
                </option>
              ))}
            </select>
          </div>

          {/* Plano (nível) */}
          <div className="select-group-filtro">
            <span className="filtro-label">Nível:</span>
            <select
              value={planoSelecionado}
              onChange={(e) => setPlanoSelecionado(e.target.value)}
              className="select-filtro"
            >
              <option value="">Todos</option>
              {planos.map((plano) => (
                <option key={plano.id} value={plano.id}>
                  {plano.nome}
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

      <ListaRecordes 
        recordes={recordes} 
        loading={loading} 
        usuarioIdVisualizado={usuarioIdParam ? parseInt(usuarioIdParam) : null}
        isVisitante={usuario?.isVisitante || false}
      />
    </div>
  );
};

export default Recordes;
