import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import InfoUsuario from "../components/rankings/InfoUsuario";
import TabelaRanking from "../components/rankings/TabelaRanking";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage, logError } from "../utils/errorHandler";
import api from "../services/api";
import "./Rankings.css";

const Rankings = () => {
  const { usuario } = useAuth();
  const [searchParams] = useSearchParams();
  const [ranking, setRanking] = useState([]);
  const [posicaoUsuario, setPosicaoUsuario] = useState(null);
  const [totalParticipantes, setTotalParticipantes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [operacoes, setOperacoes] = useState([]);
  const [limites, setLimites] = useState([]);
  const [sistemas, setSistemas] = useState([]);
  const [conjuntos, setConjuntos] = useState([]);
  const [operacaoSelecionada, setOperacaoSelecionada] = useState("");
  const [limiteSelecionado, setLimiteSelecionado] = useState("");
  const [sistemaSelecionado, setSistemaSelecionado] = useState("");
  const [conjuntoSelecionado, setConjuntoSelecionado] = useState("");
  const [tempoLimite, setTempoLimite] = useState(null);
  const [erro, setErro] = useState("");

  const carregarDados = useCallback(async () => {
    setErro("");

    try {
      const [operacoesRes, limitesRes, sistemasRes, conjuntosRes] =
        await Promise.all([
          api.get("/operacoes"),
          api.get("/limites"),
          api.get("/sistemas"),
          api.get("/conjuntos").catch(() => ({ data: [] })),
        ]);

      setOperacoes(operacoesRes.data);
      setLimites(limitesRes.data);
      setSistemas(sistemasRes.data);
      setConjuntos(conjuntosRes.data || []);

      // Ler query params da URL para inicializar filtros
      const operacaoIdParam = searchParams.get("operacao_id");
      const limiteIdParam = searchParams.get("limite_id");
      const sistemaIdParam = searchParams.get("sistema_id");
      const conjuntoIdParam = searchParams.get("conjunto_id");

      // Definir valores: usar query params se disponíveis, senão usar padrões
      if (operacaoIdParam && operacoesRes.data.find((o) => String(o.id) === operacaoIdParam)) {
        setOperacaoSelecionada(operacaoIdParam);
      } else if (operacoesRes.data.length > 0) {
        setOperacaoSelecionada(String(operacoesRes.data[0].id));
      }

      if (limiteIdParam && limitesRes.data.find((l) => String(l.id) === limiteIdParam)) {
        setLimiteSelecionado(limiteIdParam);
      } else {
        const limitePadrao =
          limitesRes.data.find((l) => l.id === 1) || limitesRes.data[0];
        if (limitePadrao) {
          setLimiteSelecionado(String(limitePadrao.id));
        }
      }

      if (sistemaIdParam && sistemasRes.data.find((s) => String(s.id) === sistemaIdParam)) {
        setSistemaSelecionado(sistemaIdParam);
      } else {
        const sistemaPadrao =
          sistemasRes.data.find((s) => s.id === 1) || sistemasRes.data[0];
        if (sistemaPadrao) {
          setSistemaSelecionado(String(sistemaPadrao.id));
        }
      }

      // Conjunto: usar query param se disponível, senão começar vazio (global)
      if (conjuntoIdParam && conjuntosRes.data.find((c) => String(c.id) === conjuntoIdParam)) {
        setConjuntoSelecionado(conjuntoIdParam);
      } else {
        setConjuntoSelecionado("");
      }
    } catch (error) {
      logError("Rankings - carregarDados", error);
      setErro(getErrorMessage(error));
    }
  }, [searchParams]);

  const carregarRanking = useCallback(async () => {
    // Não carregar se filtros não estão completos
    if (
      !operacaoSelecionada ||
      !limiteSelecionado ||
      !sistemaSelecionado
    ) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErro("");

    try {
      // Construir query string com filtros
      const params = new URLSearchParams({
        operacao_id: operacaoSelecionada,
        limite_id: limiteSelecionado,
        sistema_id: sistemaSelecionado,
      });

      // Adicionar conjunto_id se fornecido
      if (conjuntoSelecionado) {
        params.append("conjunto_id", conjuntoSelecionado);
      }

      const url = `/rankings?${params.toString()}`;
      const response = await api.get(url);

      setRanking(response.data.ranking || []);
      setPosicaoUsuario(response.data.posicaoUsuario);
      setTotalParticipantes(response.data.totalParticipantes || 0);
      
      // Obter tempo do limite para calcular tempo médio
      setTempoLimite(response.data.filtros?.limite?.tempo || null);
    } catch (error) {
      logError("Rankings - carregarRanking", error);
      setErro(getErrorMessage(error));
      setRanking([]);
      setPosicaoUsuario(null);
      setTotalParticipantes(0);
      setTempoLimite(null);
    } finally {
      setLoading(false);
    }
  }, [operacaoSelecionada, limiteSelecionado, sistemaSelecionado, conjuntoSelecionado]);

  useEffect(() => {
    if (usuario) {
      carregarDados();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  useEffect(() => {
    if (usuario && operacaoSelecionada && limiteSelecionado && sistemaSelecionado) {
      carregarRanking();
    }
  }, [usuario, operacaoSelecionada, limiteSelecionado, sistemaSelecionado, conjuntoSelecionado, carregarRanking]);

  if (!usuario) {
    return (
      <div className="rankings-container">
        <Loading text="Carregando..." />
      </div>
    );
  }

  const formatarTipoOperacao = (tipo) => {
    const tipos = {
      soma: "Soma",
      subtracao: "Subtração",
      multiplicacao: "Multiplicação",
      divisao: "Divisão",
      raiz: "Raiz quadrada",
    };
    return tipos[tipo] || tipo;
  };

  const formatarTipoSistema = (tipo) => {
    const tipos = {
      natural: "Natural",
      inteiro: "Inteiro",
      decimal: "Decimal",
      binario: "Binário",
      romano: "Romano",
    };
    return tipos[tipo] || tipo;
  };

  const obterDescricaoSistema = (sistema) => {
    if (sistema.descricao) {
      return sistema.descricao;
    }
    return formatarTipoSistema(sistema.tipo);
  };

  return (
    <div className="rankings-container">
      <div className="rankings-header">
        <h1>Rankings</h1>
        <div className="filtros-header">
          {/* Operação */}
          {operacoes.length > 1 ? (
            <div className="select-group-filtro">
              <span className="filtro-label">Operação:</span>
              <select
                value={operacaoSelecionada}
                onChange={(e) => setOperacaoSelecionada(e.target.value)}
                className="select-operacao"
              >
                {operacoes.map((operacao) => (
                  <option key={operacao.id} value={operacao.id}>
                    {formatarTipoOperacao(operacao.tipo)}: {operacao.nome}
                  </option>
                ))}
              </select>
            </div>
          ) : operacoes.length === 1 ? (
            <div className="filtro-valor-unico">
              <span className="filtro-label">Operação:</span>
              <span className="filtro-valor">
                {formatarTipoOperacao(operacoes[0].tipo)}: {operacoes[0].nome}
              </span>
            </div>
          ) : null}

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

          {/* Conjunto */}
          {conjuntos.length > 0 && (
            <div className="select-group-filtro">
              <span className="filtro-label">Conjunto:</span>
              <select
                value={conjuntoSelecionado}
                onChange={(e) => setConjuntoSelecionado(e.target.value)}
                className="select-conjunto"
              >
                <option value="">Global</option>
                {conjuntos.map((conjunto) => (
                  <option key={conjunto.id} value={conjunto.id}>
                    {conjunto.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
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

      {loading ? (
        <Loading text="Carregando ranking..." />
      ) : operacaoSelecionada && limiteSelecionado && sistemaSelecionado ? (
        <>
          <InfoUsuario
            posicaoUsuario={posicaoUsuario}
            totalParticipantes={totalParticipantes}
            ranking={ranking}
          />

          <TabelaRanking 
            ranking={ranking} 
            posicaoUsuario={posicaoUsuario}
            tempoLimite={tempoLimite}
          />
        </>
      ) : (
        <div className="mensagem-aviso">
          <p>Selecione os filtros acima para visualizar o ranking.</p>
        </div>
      )}
    </div>
  );
};

export default Rankings;

