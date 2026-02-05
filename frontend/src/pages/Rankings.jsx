import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ErrorMessage from "../components/common/ErrorMessage";
import Loading from "../components/common/Loading";
import InfoUsuario from "../components/rankings/InfoUsuario";
import TabelaRanking from "../components/rankings/TabelaRanking";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getErrorMessage, logError } from "../utils/errorHandler";
import "./Rankings.css";

const Rankings = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [ranking, setRanking] = useState([]);
  const [posicaoUsuario, setPosicaoUsuario] = useState(null);
  const [totalParticipantes, setTotalParticipantes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [operacoes, setOperacoes] = useState([]);
  const [limites, setLimites] = useState([]);
  const [sistemas, setSistemas] = useState([]);
  const [conjuntos, setConjuntos] = useState([]);
  const [sistemasUsuario, setSistemasUsuario] = useState([]);
  const [operacaoSelecionada, setOperacaoSelecionada] = useState("");
  const [limiteSelecionado, setLimiteSelecionado] = useState("");
  const [sistemaSelecionado, setSistemaSelecionado] = useState("");
  const [conjuntoSelecionado, setConjuntoSelecionado] = useState("");
  const [tempoLimite, setTempoLimite] = useState(null);
  const [erro, setErro] = useState("");

  const carregarDados = useCallback(async () => {
    setErro("");

    try {
      // Usar parâmetro todos=true para carregar todas as operações, limites e sistemas
      // independentemente do plano do usuário, permitindo ver rankings de coisas que ainda não tem
      // Também carregar as opções do plano do usuário para seleção aleatória quando não houver favoritos
      // Se usuário for admin, carregar todos os conjuntos do banco de dados
      const conjuntosUrl = usuario?.tipo === "admin" ? "/conjuntos?todos=true" : "/conjuntos";
      const [operacoesRes, limitesRes, sistemasRes, conjuntosRes, operacoesUsuarioRes, limitesUsuarioRes, sistemasUsuarioRes] =
        await Promise.all([
          api.get("/operacoes?todos=true"),
          api.get("/limites?todos=true"),
          api.get("/sistemas?todos=true"),
          api.get(conjuntosUrl).catch(() => ({ data: [] })),
          api.get("/operacoes").catch(() => ({ data: [] })),
          api.get("/limites").catch(() => ({ data: [] })),
          api.get("/sistemas").catch(() => ({ data: [] })),
        ]);

      setOperacoes(operacoesRes.data);
      setLimites(limitesRes.data);
      setSistemas(sistemasRes.data);
      setConjuntos(conjuntosRes.data || []);

      // Opções disponíveis para o plano do usuário (para seleção aleatória)
      const operacoesUsuarioData = operacoesUsuarioRes.data || [];
      const limitesUsuarioData = limitesUsuarioRes.data || [];
      const sistemasUsuarioData = sistemasUsuarioRes.data || [];

      setSistemasUsuario(sistemasUsuarioData);

      // Ler query params da URL
      const operacaoIdParam = searchParams.get("operacao_id");
      const limiteIdParam = searchParams.get("limite_id");
      const sistemaIdParam = searchParams.get("sistema_id");
      const conjuntoIdParam = searchParams.get("conjunto_id");

      // Ordem de prioridade: 1) query params, 2) preferências do usuário (operacao_id, limite_id, sistema_id), 3) aleatório das opções do plano
      // Operação
      if (operacaoIdParam && operacoesRes.data.find((o) => String(o.id) === operacaoIdParam)) {
        setOperacaoSelecionada(operacaoIdParam);
      } else if (usuario?.operacao_id && operacoesRes.data.find((o) => o.id === usuario.operacao_id)) {
        setOperacaoSelecionada(String(usuario.operacao_id));
      } else if (operacoesUsuarioData.length > 0) {
        // Selecionar aleatoriamente das operações disponíveis para o plano do usuário
        const indiceAleatorio = Math.floor(Math.random() * operacoesUsuarioData.length);
        setOperacaoSelecionada(String(operacoesUsuarioData[indiceAleatorio].id));
      } else if (operacoesRes.data.length > 0) {
        setOperacaoSelecionada(String(operacoesRes.data[0].id));
      }

      // Limite
      if (limiteIdParam && limitesRes.data.find((l) => String(l.id) === limiteIdParam)) {
        setLimiteSelecionado(limiteIdParam);
      } else if (usuario?.limite_id && limitesRes.data.find((l) => l.id === usuario.limite_id)) {
        setLimiteSelecionado(String(usuario.limite_id));
      } else if (limitesUsuarioData.length > 0) {
        // Selecionar aleatoriamente dos limites disponíveis para o plano do usuário
        const indiceAleatorio = Math.floor(Math.random() * limitesUsuarioData.length);
        setLimiteSelecionado(String(limitesUsuarioData[indiceAleatorio].id));
      } else {
        const limitePadrao =
          limitesRes.data.find((l) => l.id === 1) || limitesRes.data[0];
        if (limitePadrao) {
          setLimiteSelecionado(String(limitePadrao.id));
        }
      }

      // Sistema: depende da operação (raiz sem inteiro, conversão só romano/binário/hex). Usar a operação já definida acima.
      const operacaoParaSistema = operacaoIdParam && operacoesRes.data.find((o) => String(o.id) === operacaoIdParam)
        ? operacoesRes.data.find((o) => String(o.id) === operacaoIdParam)
        : usuario?.operacao_id && operacoesRes.data.find((o) => o.id === usuario.operacao_id)
        ? operacoesRes.data.find((o) => o.id === usuario.operacao_id)
        : operacoesUsuarioData.length > 0
        ? operacoesUsuarioData[0]
        : operacoesRes.data[0];

      let sistemasValidos = sistemasRes.data;
      let sistemasUsuarioValidos = sistemasUsuarioData;
      if (operacaoParaSistema) {
        if (operacaoParaSistema.tipo === "raiz") {
          sistemasValidos = sistemasRes.data.filter((s) => s.tipo !== "inteiro");
          sistemasUsuarioValidos = sistemasUsuarioData.filter((s) => s.tipo !== "inteiro");
        } else if (operacaoParaSistema.tipo === "conversao") {
          sistemasValidos = sistemasRes.data.filter((s) =>
            s.tipo === "romano" || s.tipo === "binario" || s.tipo === "hexadecimal"
          );
          sistemasUsuarioValidos = sistemasUsuarioData.filter((s) =>
            s.tipo === "romano" || s.tipo === "binario" || s.tipo === "hexadecimal"
          );
        }
      }

      if (sistemaIdParam && sistemasValidos.find((s) => String(s.id) === sistemaIdParam)) {
        setSistemaSelecionado(sistemaIdParam);
      } else if (usuario?.sistema_id && sistemasValidos.find((s) => s.id === usuario.sistema_id)) {
        setSistemaSelecionado(String(usuario.sistema_id));
      } else if (sistemasUsuarioValidos.length > 0) {
        // Selecionar aleatoriamente dos sistemas disponíveis para o plano do usuário
        const indiceAleatorio = Math.floor(Math.random() * sistemasUsuarioValidos.length);
        setSistemaSelecionado(String(sistemasUsuarioValidos[indiceAleatorio].id));
      } else {
        const sistemaPadrao =
          sistemasValidos.find((s) => s.id === 1) || sistemasValidos[0];
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
  }, [searchParams, usuario]);

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

  const obterDescricaoSistema = (sistema) => {
    if (sistema.descricao) {
      return sistema.descricao;
    }
    return formatarTipoSistema(sistema.tipo);
  };

  // Encontrar a operação selecionada
  const operacaoAtual = useMemo(() => {
    if (!operacaoSelecionada) return null;
    return operacoes.find((op) => String(op.id) === operacaoSelecionada);
  }, [operacoes, operacaoSelecionada]);

  // Encontrar o sistema selecionado
  const sistemaAtual = useMemo(() => {
    if (!sistemaSelecionado) return null;
    return sistemas.find((s) => String(s.id) === sistemaSelecionado);
  }, [sistemas, sistemaSelecionado]);

  // Filtrar sistemas disponíveis baseado no tipo da operação selecionada:
  // - Se operação for raiz, remover sistema "inteiro"
  // - Se operação for conversão, permitir apenas romano, binário ou hexadecimal
  // - Em todos os outros casos, mostrar todos os sistemas
  const sistemasDisponiveis = useMemo(() => {
    if (!operacaoAtual) {
      return sistemas;
    }

    if (operacaoAtual.tipo === "raiz") {
      return sistemas.filter((sistema) => sistema.tipo !== "inteiro");
    }

    if (operacaoAtual.tipo === "conversao") {
      return sistemas.filter((sistema) =>
        sistema.tipo === "romano" || sistema.tipo === "binario" || sistema.tipo === "hexadecimal"
      );
    }

    return sistemas;
  }, [sistemas, operacaoAtual]);

  // Se o sistema selecionado atual não está mais disponível, ajustar seleção
  useEffect(() => {
    if (sistemaSelecionado && sistemasDisponiveis.length > 0) {
      const sistemaAtual = sistemasDisponiveis.find(
        (s) => String(s.id) === sistemaSelecionado
      );
      if (!sistemaAtual) {
        // Sistema selecionado não está mais disponível
        // Se o usuário tem favorito e está disponível, usar favorito
        // Senão, selecionar aleatoriamente dos sistemas do plano do usuário que estão disponíveis
        const sistemaFavorito = usuario?.sistema_id && sistemasDisponiveis.find((s) => s.id === usuario.sistema_id);
        if (sistemaFavorito) {
          setSistemaSelecionado(String(sistemaFavorito.id));
        } else {
          // Filtrar sistemas do plano do usuário que estão disponíveis
          const sistemasUsuarioDisponiveis = sistemasDisponiveis.filter((s) =>
            sistemasUsuario.some((su) => su.id === s.id)
          );
          if (sistemasUsuarioDisponiveis.length > 0) {
            const indiceAleatorio = Math.floor(Math.random() * sistemasUsuarioDisponiveis.length);
            setSistemaSelecionado(String(sistemasUsuarioDisponiveis[indiceAleatorio].id));
          } else {
            // Se não houver sistemas do plano disponíveis, usar o primeiro disponível
            setSistemaSelecionado(String(sistemasDisponiveis[0].id));
          }
        }
      }
    } else if (sistemaSelecionado && sistemasDisponiveis.length === 0) {
      // Não há sistemas disponíveis, limpar seleção
      setSistemaSelecionado("");
    }
  }, [sistemasDisponiveis, sistemaSelecionado, usuario, sistemasUsuario]);

  if (!usuario) {
    return (
      <div className="rankings-container">
        <Loading text="Carregando..." />
      </div>
    );
  }

  return (
    <div className="rankings-container">
      <div className="rankings-header">
        <div className="titulo-com-ajuda">
          <h1>Rankings</h1>
          <button
            className="btn-ajuda"
            onClick={() => navigate("/instrucoes/rankings")}
            title="Ver instruções sobre rankings"
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
          {sistemasDisponiveis.length > 1 ? (
            <div className="select-group-filtro">
              <span className="filtro-label">Sistema:</span>
              <select
                value={sistemaSelecionado}
                onChange={(e) => setSistemaSelecionado(e.target.value)}
                className="select-sistema"
              >
                {sistemasDisponiveis.map((sistema) => (
                  <option key={sistema.id} value={sistema.id}>
                    {obterDescricaoSistema(sistema)}
                  </option>
                ))}
              </select>
            </div>
          ) : sistemasDisponiveis.length === 1 ? (
            <div className="filtro-valor-unico">
              <span className="filtro-label">Sistema:</span>
              <span className="filtro-valor">
                {obterDescricaoSistema(sistemasDisponiveis[0])}
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
            isVisitante={usuario?.isVisitante || false}
            operacaoId={operacaoSelecionada}
            limiteId={limiteSelecionado}
            sistemaId={sistemaSelecionado}
            sistemaTipo={sistemaAtual?.tipo || null}
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

