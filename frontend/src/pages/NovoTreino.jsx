import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../components/common/ErrorMessage";
import Loading from "../components/common/Loading";
import ContagemRegressiva from "../components/treino/ContagemRegressiva";
import ModalEscolhaFormatoResposta from "../components/treino/ModalEscolhaFormatoResposta";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getErrorMessage, logError } from "../utils/errorHandler";
import "./NovoTreino.css";

const NovoTreino = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [operacoes, setOperacoes] = useState([]);
  const [limites, setLimites] = useState([]);
  const [sistemas, setSistemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operacaoSelecionada, setOperacaoSelecionada] = useState(null);
  const [limiteSelecionado, setLimiteSelecionado] = useState("");
  const [sistemaSelecionado, setSistemaSelecionado] = useState("");
  const [tipoOperacaoSelecionado, setTipoOperacaoSelecionado] = useState("");
  const [erro, setErro] = useState("");
  const [iniciando, setIniciando] = useState(false);
  const [mostrarContagem, setMostrarContagem] = useState(false);
  const [mostrarModalFormato, setMostrarModalFormato] = useState(false);
  const [dadosTreino, setDadosTreino] = useState(null);
  const [formatoResposta, setFormatoResposta] = useState(null);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const [operacoesRes, limitesRes, sistemasRes] = await Promise.all([
        api.get("/operacoes"),
        api.get("/limites"),
        api.get("/sistemas"),
      ]);

      setOperacoes(operacoesRes.data);
      setLimites(limitesRes.data);
      setSistemas(sistemasRes.data);
    } catch (error) {
      logError("NovoTreino - carregarDados", error);
      setErro(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (usuario) {
      carregarDados();
    }
  }, [usuario, carregarDados]);

  // Definir valores padrão para limite: preferência do usuário (limite_id) ou primeiro da lista
  useEffect(() => {
    if (limites.length > 0 && !limiteSelecionado) {
      const limiteFavorito = usuario?.limite_id && limites.find((l) => l.id === usuario.limite_id);
      if (limiteFavorito) {
        setLimiteSelecionado(limiteFavorito.id.toString());
      } else if (limites.length === 1) {
        setLimiteSelecionado(limites[0].id.toString());
      } else {
        const limitePadrao = limites.find((limite) => limite.id === 1) || limites[0];
        if (limitePadrao) {
          setLimiteSelecionado(limitePadrao.id.toString());
        }
      }
    }
  }, [limites, limiteSelecionado, usuario]);

  // Obter tipos únicos de operação para o filtro
  // Se o plano do usuário for id = 2, não mostrar "raiz" nem "conversao"
  const tiposOperacaoDisponiveis = useMemo(() => {
    const tipos = Array.from(new Set(operacoes.map((op) => op.tipo)));
    if (usuario?.id_plano === 2) {
      return tipos.filter((tipo) => tipo !== "raiz" && tipo !== "conversao");
    }
    return tipos;
  }, [operacoes, usuario]);

  // Filtrar operações baseado no tipo selecionado
  const operacoesFiltradas = useMemo(() => {
    if (!tipoOperacaoSelecionado) {
      return operacoes;
    }
    return operacoes.filter((operacao) => operacao.tipo === tipoOperacaoSelecionado);
  }, [operacoes, tipoOperacaoSelecionado]);

  // Definir operação padrão: preferência do usuário (operacao_id) se estiver em operacoesFiltradas, senão aleatória
  useEffect(() => {
    if (operacoesFiltradas.length > 0 && !operacaoSelecionada) {
      const operacaoFavorita = usuario?.operacao_id && operacoesFiltradas.find((o) => o.id === usuario.operacao_id);
      if (operacaoFavorita) {
        setOperacaoSelecionada(operacaoFavorita);
      } else {
        // Selecionar uma operação aleatória da lista
        const indiceAleatorio = Math.floor(Math.random() * operacoesFiltradas.length);
        setOperacaoSelecionada(operacoesFiltradas[indiceAleatorio]);
      }
    }
  }, [operacoesFiltradas, operacaoSelecionada, tipoOperacaoSelecionado, usuario]);

  // Indica se a operação exige apenas sistemas de conversão (romano, binário, hexadecimal):
  // tipo "conversao" ou descrição contendo "Conversão" (ex.: operação aleatória de conversão)
  const ehOperacaoConversao = useCallback((op) => {
    if (!op) return false;
    if (op.tipo === "conversao") return true;
    return op.descricao && op.descricao.toLowerCase().includes("conversão");
  }, []);

  // Filtrar sistemas disponíveis baseado no tipo da operação selecionada:
  // - Se operação for raiz, remover sistema "inteiro"
  // - Se operação for conversão (ou descrição com "Conversão"), permitir apenas romano, binário ou hexadecimal
  // - Caso contrário, mostrar todos os sistemas
  const sistemasDisponiveis = useMemo(() => {
    // Se não há operação selecionada (caso raro: durante carregamento ou sem operações disponíveis),
    // retornar todos os sistemas
    if (!operacaoSelecionada) {
      return sistemas;
    }

    // Aplicar filtros baseados no tipo da operação selecionada
    if (operacaoSelecionada.tipo === "raiz") {
      return sistemas.filter((sistema) => sistema.tipo !== "inteiro");
    }
    if (ehOperacaoConversao(operacaoSelecionada)) {
      return sistemas.filter((sistema) =>
        sistema.tipo === "romano" || sistema.tipo === "binario" || sistema.tipo === "hexadecimal"
      );
    }
    return sistemas;
  }, [sistemas, operacaoSelecionada, ehOperacaoConversao]);

  // Definir valor padrão para sistema: preferência do usuário (sistema_id) se estiver em sistemasDisponiveis, senão primeiro da lista
  useEffect(() => {
    if (sistemasDisponiveis.length > 0 && !sistemaSelecionado) {
      const sistemaFavorito = usuario?.sistema_id && sistemasDisponiveis.find((s) => s.id === usuario.sistema_id);
      if (sistemaFavorito) {
        setSistemaSelecionado(sistemaFavorito.id.toString());
      } else if (sistemasDisponiveis.length === 1) {
        setSistemaSelecionado(sistemasDisponiveis[0].id.toString());
      } else {
        const sistemaPadrao = sistemasDisponiveis.find((s) => s.id === 1) || sistemasDisponiveis[0];
        if (sistemaPadrao) {
          setSistemaSelecionado(sistemaPadrao.id.toString());
        }
      }
    }
  }, [sistemasDisponiveis, sistemaSelecionado, usuario]);

  // Se o sistema selecionado atual não está mais disponível, ajustar seleção
  useEffect(() => {
    if (sistemaSelecionado && sistemasDisponiveis.length > 0) {
      const sistemaAtual = sistemasDisponiveis.find(
        (s) => s.id.toString() === sistemaSelecionado
      );
      if (!sistemaAtual) {
        // Sistema selecionado não está mais disponível, selecionar o primeiro disponível
        setSistemaSelecionado(sistemasDisponiveis[0].id.toString());
      }
    } else if (sistemaSelecionado && sistemasDisponiveis.length === 0) {
      // Não há sistemas disponíveis, limpar seleção
      setSistemaSelecionado("");
    }
  }, [sistemasDisponiveis, sistemaSelecionado]);

  // Se a operação selecionada não está mais disponível após filtrar, selecionar aleatoriamente uma disponível
  useEffect(() => {
    if (operacaoSelecionada && operacoesFiltradas.length > 0) {
      const operacaoAtual = operacoesFiltradas.find(
        (op) => op.id === operacaoSelecionada.id
      );
      if (!operacaoAtual) {
        // Operação selecionada não está mais disponível, selecionar aleatoriamente uma disponível
        // Mas só se o usuário não tiver uma operação favorita
        const operacaoFavorita = usuario?.operacao_id && operacoesFiltradas.find((o) => o.id === usuario.operacao_id);
        if (operacaoFavorita) {
          setOperacaoSelecionada(operacaoFavorita);
        } else {
          const indiceAleatorio = Math.floor(Math.random() * operacoesFiltradas.length);
          setOperacaoSelecionada(operacoesFiltradas[indiceAleatorio]);
        }
      }
    } else if (operacaoSelecionada && operacoesFiltradas.length === 0) {
      // Não há operações disponíveis, limpar seleção
      setOperacaoSelecionada(null);
    }
  }, [operacoesFiltradas, operacaoSelecionada, usuario]);

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

  const obterCorOperacao = (tipo) => {
    const cores = {
      soma: "#2196F3", // Azul
      subtracao: "#4CAF50", // Verde
      multiplicacao: "#FF9800", // Laranja
      divisao: "#FFD700", // Amarelo
      raiz: "#F44336", // Vermelho
      conversao: "#BA68C8", // Roxo claro
    };
    return cores[tipo] || "#E0E0E0";
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

  const handleSelecionarOperacao = (operacao) => {
    setOperacaoSelecionada(operacao);

    // Se a operação for raiz quadrada e o sistema selecionado for "inteiro",
    // limpar a seleção do sistema
    if (operacao.tipo === "raiz" && sistemaSelecionado) {
      const sistemaAtual = sistemas.find(
        (s) => s.id.toString() === sistemaSelecionado
      );
      if (sistemaAtual && sistemaAtual.tipo === "inteiro") {
        setSistemaSelecionado("");
      }
    }

    // Se a operação for de conversão e o sistema selecionado não for válido,
    // limpar a seleção do sistema
    if (ehOperacaoConversao(operacao) && sistemaSelecionado) {
      const sistemaAtual = sistemas.find(
        (s) => s.id.toString() === sistemaSelecionado
      );
      if (sistemaAtual && (sistemaAtual.tipo !== "romano" && sistemaAtual.tipo !== "binario" && sistemaAtual.tipo !== "hexadecimal")) {
        setSistemaSelecionado("");
      }
    }
  };

  const handleIniciarTreino = async () => {
    if (!operacaoSelecionada || !limiteSelecionado || !sistemaSelecionado) {
      setErro("Por favor, selecione operação, limite e sistema");
      return;
    }

    setIniciando(true);
    setErro("");

    try {
      const response = await api.post("/treinos/iniciar", {
        operacao_id: operacaoSelecionada.id,
        limite_id: parseInt(limiteSelecionado),
        sistema_id: parseInt(sistemaSelecionado),
      });

      // Salvar dados do treino
      setDadosTreino(response.data);

      // Verificar se o sistema é romano, hexadecimal ou binário para mostrar modal de escolha
      const sistemaAtual = sistemas.find(
        (s) => s.id.toString() === sistemaSelecionado
      );

      if (sistemaAtual && (sistemaAtual.tipo === "romano" || sistemaAtual.tipo === "hexadecimal" || sistemaAtual.tipo === "binario")) {
        // Mostrar modal de escolha de formato
        setMostrarModalFormato(true);
      } else {
        // Sistema não requer escolha, ir direto para contagem
        setFormatoResposta("sistema"); // Padrão: usar o sistema escolhido
        // confirmar-inicio será chamado em TreinoAtivo quando a contagem terminar
        setMostrarContagem(true);
      }
    } catch (error) {
      logError("NovoTreino - handleIniciarTreino", error);
      setErro(getErrorMessage(error));
      setIniciando(false);
    }
  };

  const handleEscolherFormato = async (formato) => {
    setFormatoResposta(formato);
    setMostrarModalFormato(false);
    // confirmar-inicio será chamado em TreinoAtivo quando a contagem terminar
    setMostrarContagem(true);
  };

  const handleCancelarFormato = () => {
    setMostrarModalFormato(false);
    setIniciando(false);
    setDadosTreino(null);
    setFormatoResposta(null);
  };

  const handleContagemTerminar = () => {
    setMostrarContagem(false);
    setIniciando(false);
    // Navegar para tela de treino ativo com dados do treino e formato escolhido
    const sistemaAtual = sistemas.find(
      (s) => s.id.toString() === sistemaSelecionado
    );
    navigate("/treino-ativo", {
      state: {
        treinoData: dadosTreino,
        formatoResposta: formatoResposta || "sistema", // Padrão se não escolhido
        sistemaTipo: sistemaAtual?.tipo || "natural"
      }
    });
  };

  const podeIniciar =
    operacaoSelecionada && limiteSelecionado && sistemaSelecionado;

  if (!usuario) {
    return (
      <div className="novo-treino-container">
        <Loading text="Carregando..." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="novo-treino-container">
        <Loading text="Carregando..." />
      </div>
    );
  }

  // Obter tipo do sistema atual para o modal
  const sistemaAtual = sistemas.find(
    (s) => s.id.toString() === sistemaSelecionado
  );

  return (
    <>
      {mostrarModalFormato && sistemaAtual && (
        <ModalEscolhaFormatoResposta
          sistemaTipo={sistemaAtual.tipo}
          onEscolher={handleEscolherFormato}
          onCancelar={handleCancelarFormato}
        />
      )}
      {mostrarContagem && (
        <ContagemRegressiva onTerminar={handleContagemTerminar} />
      )}
      <div className="novo-treino-container">
        <div className="novo-treino-header">
          <div className="titulo-com-ajuda">
            <h1>Novo treino</h1>
            <button
              className="btn-ajuda"
              onClick={() => navigate("/instrucoes/novo-treino")}
              title="Instruções sobre novo treino"
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
            {/* Tipo de operação */}
            {tiposOperacaoDisponiveis.length > 1 ? (
              <div className="select-group-filtro">
                <span className="filtro-label">Tipo:</span>
                <select
                  value={tipoOperacaoSelecionado}
                  onChange={(e) => setTipoOperacaoSelecionado(e.target.value)}
                  className="select-filtro"
                >
                  <option value="">Todos</option>
                  {tiposOperacaoDisponiveis.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {formatarTipoOperacao(tipo)}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {/* Limite de tempo - mostra select se houver múltiplas opções, senão mostra apenas o valor */}
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

            {/* Sistema numérico - mostra select se houver múltiplas opções, senão mostra apenas o valor */}
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
                      {sistema.descricao || formatarTipoSistema(sistema.tipo)}
                    </option>
                  ))}
                </select>
              </div>
            ) : sistemasDisponiveis.length === 1 ? (
              <div className="filtro-valor-unico">
                <span className="filtro-label">Sistema:</span>
                <span className="filtro-valor">
                  {sistemasDisponiveis[0].descricao || formatarTipoSistema(sistemasDisponiveis[0].tipo)}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="novo-treino-content">
          {erro && (
            <ErrorMessage
              message={erro}
              type="error"
              dismissible
              onDismiss={() => setErro("")}
            />
          )}

          {/* Seção de Operações */}
          <section className="secao-selecao">
            <div className="cards-operacoes">
              {operacoesFiltradas.length === 0 ? (
                <p className="sem-opcoes">
                  {tipoOperacaoSelecionado
                    ? "Nenhuma operação encontrada para o tipo selecionado."
                    : "Nenhuma operação disponível no seu nível."}
                </p>
              ) : (
                operacoesFiltradas.map((operacao) => {
                  const corOperacao = obterCorOperacao(operacao.tipo);
                  return (
                    <div
                      key={operacao.id}
                      className={`card-operacao card-operacao-${operacao.tipo} ${
                        operacaoSelecionada?.id === operacao.id
                          ? "selecionado"
                          : ""
                      }`}
                      style={{ borderColor: corOperacao }}
                      onClick={() => handleSelecionarOperacao(operacao)}
                    >
                      <h3>{operacao.nome}</h3>
                      <p className="tipo-operacao">
                        {formatarTipoOperacao(operacao.tipo)}
                      </p>
                      {operacao.descricao && (
                        <p className="descricao">{operacao.descricao}</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Botão Começar */}
          <div className="botoes-acoes">
            <button
              className="btn-comecar"
              onClick={handleIniciarTreino}
              disabled={!podeIniciar || iniciando}
            >
              {iniciando ? "Iniciando..." : "Começar treino"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NovoTreino;
