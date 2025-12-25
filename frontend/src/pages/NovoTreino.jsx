import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ContagemRegressiva from "../components/treino/ContagemRegressiva";
import { useAuth } from "../context/AuthContext";
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
      console.error("Erro ao carregar dados:", error);
      setErro("Erro ao carregar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (usuario) {
      carregarDados();
    }
  }, [usuario, carregarDados]);

  // Definir valores padrão para limite e sistema (id = 1)
  useEffect(() => {
    if (limites.length > 0 && !limiteSelecionado) {
      const limitePadrao = limites.find((limite) => limite.id === 1);
      if (limitePadrao) {
        setLimiteSelecionado("1");
      }
    }
  }, [limites, limiteSelecionado]);

  useEffect(() => {
    if (sistemas.length > 0 && !sistemaSelecionado) {
      const sistemaPadrao = sistemas.find((sistema) => sistema.id === 1);
      if (sistemaPadrao) {
        setSistemaSelecionado("1");
      }
    }
  }, [sistemas, sistemaSelecionado]);

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
      arabico: "Arábico",
      romano: "Romano",
      binario: "Binário",
    };
    return tipos[tipo] || tipo;
  };

  const formatarTempo = (segundos) => {
    if (segundos < 60) {
      return `${segundos}s`;
    } else if (segundos < 3600) {
      const minutos = Math.floor(segundos / 60);
      const segundosRestantes = segundos % 60;
      return segundosRestantes > 0
        ? `${minutos}min ${segundosRestantes}s`
        : `${minutos}min`;
    } else {
      const horas = Math.floor(segundos / 3600);
      const minutos = Math.floor((segundos % 3600) / 60);
      const segundosRestantes = segundos % 60;
      let resultado = `${horas}h`;
      if (minutos > 0) resultado += ` ${minutos}min`;
      if (segundosRestantes > 0) resultado += ` ${segundosRestantes}s`;
      return resultado;
    }
  };

  const handleSelecionarOperacao = (operacao) => {
    setOperacaoSelecionada(operacao);
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
      const mensagemErro =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        "Erro ao iniciar treino. Tente novamente.";
      setErro(mensagemErro);
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
    return <div>Carregando...</div>;
  }

  if (loading) {
    return (
      <div className="novo-treino-container">
        <div className="loading">Carregando...</div>
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
        </div>

        <div className="novo-treino-content">
          {erro && <div className="erro">{erro}</div>}

          {/* Seção de Operações */}
          <section className="secao-selecao">
            <h2>1. Selecione a operação</h2>
            <div className="cards-operacoes">
              {operacoes.length === 0 ? (
                <p className="sem-opcoes">
                  Nenhuma operação disponível no seu plano.
                </p>
              ) : (
                operacoes.map((operacao) => (
                  <div
                    key={operacao.id}
                    className={`card-operacao ${
                      operacaoSelecionada?.id === operacao.id
                        ? "selecionado"
                        : ""
                    }`}
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
                ))
              )}
            </div>
          </section>

          {/* Seção de Limite */}
          <section className="secao-selecao">
            <h2>2. Selecione o limite de tempo</h2>
            <div className="select-group">
              <select
                value={limiteSelecionado}
                onChange={(e) => setLimiteSelecionado(e.target.value)}
                className="select-limite"
              >
                <option value="">Selecione um limite</option>
                {limites.map((limite) => (
                  <option key={limite.id} value={limite.id}>
                    {limite.descricao} - {formatarTempo(limite.tempo)}
                  </option>
                ))}
              </select>
            </div>
            {limites.length === 0 && (
              <p className="sem-opcoes">
                Nenhum limite disponível no seu plano.
              </p>
            )}
          </section>

          {/* Seção de Sistema */}
          <section className="secao-selecao">
            <h2>3. Selecione o sistema numérico</h2>
            <div className="select-group">
              <select
                value={sistemaSelecionado}
                onChange={(e) => setSistemaSelecionado(e.target.value)}
                className="select-sistema"
              >
                <option value="">Selecione um sistema</option>
                {sistemas.map((sistema) => (
                  <option key={sistema.id} value={sistema.id}>
                    {formatarTipoSistema(sistema.tipo)}
                    {sistema.descricao ? ` - ${sistema.descricao}` : ""}
                  </option>
                ))}
              </select>
            </div>
            {sistemas.length === 0 && (
              <p className="sem-opcoes">
                Nenhum sistema disponível no seu plano.
              </p>
            )}
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
