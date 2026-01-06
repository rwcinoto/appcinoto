import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ContagemRegressiva from "../components/treino/ContagemRegressiva";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage, logError } from "../utils/errorHandler";
import api from "../services/api";
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
  const [erro, setErro] = useState("");
  const [iniciando, setIniciando] = useState(false);
  const [mostrarContagem, setMostrarContagem] = useState(false);
  const [dadosTreino, setDadosTreino] = useState(null);

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

  // Definir valores padrão para limite e sistema automaticamente
  useEffect(() => {
    if (limites.length > 0 && !limiteSelecionado) {
      // Se há apenas um limite, seleciona automaticamente
      if (limites.length === 1) {
        setLimiteSelecionado(limites[0].id.toString());
      } else {
        // Caso contrário, tenta o id = 1
        const limitePadrao = limites.find((limite) => limite.id === 1);
        if (limitePadrao) {
          setLimiteSelecionado("1");
        }
      }
    }
  }, [limites, limiteSelecionado]);

  useEffect(() => {
    if (sistemas.length > 0 && !sistemaSelecionado) {
      // Se há apenas um sistema, seleciona automaticamente
      if (sistemas.length === 1) {
        setSistemaSelecionado(sistemas[0].id.toString());
      } else {
        // Caso contrário, tenta o id = 1
        const sistemaPadrao = sistemas.find((sistema) => sistema.id === 1);
        if (sistemaPadrao) {
          setSistemaSelecionado("1");
        }
      }
    }
  }, [sistemas, sistemaSelecionado]);

  // Definir operação padrão (id = 1)
  useEffect(() => {
    if (operacoes.length > 0 && !operacaoSelecionada) {
      const operacaoPadrao = operacoes.find((operacao) => operacao.id === 1);
      if (operacaoPadrao) {
        setOperacaoSelecionada(operacaoPadrao);
      }
    }
  }, [operacoes, operacaoSelecionada]);

  // Filtrar sistemas disponíveis: se operação for raiz, remover sistema "inteiro"
  const sistemasDisponiveis = useMemo(() => {
    if (operacaoSelecionada?.tipo === "raiz") {
      return sistemas.filter((sistema) => sistema.tipo !== "inteiro");
    }
    return sistemas;
  }, [sistemas, operacaoSelecionada]);

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

  const formatarTipoOperacao = (tipo) => {
    const tipos = {
      soma: "Soma",
      subtracao: "Subtração",
      multiplicacao: "Multiplicação",
      divisao: "Divisão",
      raiz: "Raiz quadrada",
      aleatorio: "Aleatório",
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

      // Salvar dados do treino e mostrar contagem regressiva
      setDadosTreino(response.data);
      setMostrarContagem(true);
    } catch (error) {
      logError("NovoTreino - handleIniciarTreino", error);
      setErro(getErrorMessage(error));
      setIniciando(false);
    }
  };

  const handleContagemTerminar = () => {
    setMostrarContagem(false);
    setIniciando(false);
    // Navegar para tela de treino ativo com dados do treino
    navigate("/treino-ativo", { state: { treinoData: dadosTreino } });
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

  return (
    <>
      {mostrarContagem && (
        <ContagemRegressiva onTerminar={handleContagemTerminar} />
      )}
      <div className="novo-treino-container">
        <div className="novo-treino-header">
          <h1>Novo treino</h1>
          <div className="filtros-header">
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
              {operacoes.length === 0 ? (
                <p className="sem-opcoes">
                  Nenhuma operação disponível no seu plano.
                </p>
              ) : (
                operacoes.map((operacao) => {
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
