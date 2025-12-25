import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ContadorPontos from "../components/treino/ContadorPontos";
import ListaContas from "../components/treino/ListaContas";
import ResultadoTreino from "../components/treino/ResultadoTreino";
import Timer from "../components/treino/Timer";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./TreinoAtivo.css";

const TreinoAtivo = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Dados do treino vindos da seleção
  const treinoData = location.state?.treinoData;

  // Estado do treino
  const [treinoId, setTreinoId] = useState(null);
  const [contas, setContas] = useState([]);
  const [contaAtualIndex, setContaAtualIndex] = useState(0);
  const [totalAcertos, setTotalAcertos] = useState(0);
  const totalAcertosRef = useRef(0); // Ref para rastrear acertos de forma mais confiável
  const [tempoLimite, setTempoLimite] = useState(0);
  const [inicioTreino, setInicioTreino] = useState(null); // Timestamp do início do treino
  const [sistemaTipo, setSistemaTipo] = useState("arabico");
  const [processando, setProcessando] = useState(false); // Flag para prevenir múltiplas chamadas simultâneas
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  // Inicializar treino
  useEffect(() => {
    if (!treinoData) {
      // Se não tiver dados, redirecionar para seleção
      navigate("/novo-treino");
      return;
    }

    const iniciarTreino = async () => {
      try {
        setLoading(true);
        const response = await api.post("/treinos/iniciar", {
          operacao_id: treinoData.operacao.id,
          limite_id: treinoData.limite.id,
          sistema_id: treinoData.sistema.id,
        });

        const { treino_id, contas_iniciais, limite, sistema } = response.data;

        setTreinoId(treino_id);
        setContas(contas_iniciais);
        setTempoLimite(limite.tempo);
        setSistemaTipo(sistema.tipo);
        setTotalAcertos(0);
        totalAcertosRef.current = 0;
        setContaAtualIndex(0);
        setInicioTreino(Date.now()); // Registrar início do treino
        setProcessando(false);
      } catch (error) {
        const mensagemErro =
          error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.msg ||
          "Erro ao iniciar treino. Tente novamente.";
        setErro(mensagemErro);
      } finally {
        setLoading(false);
      }
    };

    iniciarTreino();
  }, [treinoData, navigate]);

  const handleAcerto = async (resposta) => {
    if (!resposta || resposta.trim() === "") return;
    if (!treinoId || processando) {
      return;
    }

    // Prevenir múltiplas chamadas simultâneas
    setProcessando(true);

    try {
      const response = await api.post("/treinos/validar-resposta", {
        treino_id: treinoId,
        resposta: resposta,
      });

      const { correto, proximaConta } = response.data;

      // Incrementar contador IMEDIATAMENTE quando acerta
      // Usar ref + setState para garantir sincronização perfeita
      if (correto) {
        const novoTotal = totalAcertosRef.current + 1;
        totalAcertosRef.current = novoTotal;
        setTotalAcertos(novoTotal);
      }

      // Sempre manter o índice em 0 (primeira conta da lista)
      setContaAtualIndex(0);

      // Atualizar lista de contas: sempre remover primeira e adicionar próxima
      setContas((prevContas) => {
        const novasContas = [...prevContas];
        novasContas.shift(); // Remover primeira conta (já respondida)

        // Adicionar próxima conta no final para manter buffer
        if (proximaConta) {
          novasContas.push(proximaConta);
        }

        return novasContas;
      });

      // Reabilitar após processar a resposta
      setProcessando(false);
    } catch (error) {
      console.error("Erro ao validar resposta:", error);
      const mensagemErro =
        error.response?.data?.message || "Erro ao validar resposta";
      setErro(mensagemErro);
      // Reabilitar mesmo em caso de erro
      setProcessando(false);
    }
  };

  const finalizarTreino = async () => {
    if (!treinoId) return;

    try {
      setProcessando(true);
      const response = await api.post("/treinos/finalizar", {
        treino_id: treinoId,
        total: totalAcertos,
      });

      setResultado(response.data);
      setMostrarResultado(true);
    } catch (error) {
      console.error("Erro ao finalizar treino:", error);
      const mensagemErro =
        error.response?.data?.message || "Erro ao finalizar treino";
      setErro(mensagemErro);
    }
  };

  const handleTempoEsgotado = () => {
    finalizarTreino();
  };

  const handleRecomecar = async () => {
    setMostrarResultado(false);
    setResultado(null);

    // Reiniciar treino com os mesmos dados
    try {
      setLoading(true);
      const response = await api.post("/treinos/iniciar", {
        operacao_id: treinoData.operacao.id,
        limite_id: treinoData.limite.id,
        sistema_id: treinoData.sistema.id,
      });

      const { treino_id, contas_iniciais, limite, sistema } = response.data;

      setTreinoId(treino_id);
      setContas(contas_iniciais);
      setTempoLimite(limite.tempo);
      setSistemaTipo(sistema.tipo);
      setTotalAcertos(0);
      totalAcertosRef.current = 0;
      setContaAtualIndex(0);
      setProcessando(false);
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        "Erro ao reiniciar treino. Tente novamente.";
      setErro(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  const handleNovoTreino = () => {
    navigate("/novo-treino");
  };

  if (!usuario) {
    return <div>Carregando...</div>;
  }

  if (!treinoData) {
    return null; // Será redirecionado
  }

  if (loading) {
    return (
      <div className="treino-ativo-container">
        <div className="loading">Carregando treino...</div>
      </div>
    );
  }

  if (erro && !mostrarResultado) {
    return (
      <div className="treino-ativo-container">
        <div className="erro">{erro}</div>
        <button onClick={() => navigate("/novo-treino")}>
          Voltar para seleção
        </button>
      </div>
    );
  }

  return (
    <>
      {mostrarResultado && resultado && (
        <ResultadoTreino
          resultado={resultado}
          onRecomecar={handleRecomecar}
          onNovoTreino={handleNovoTreino}
        />
      )}
      <div className="treino-ativo-container">
        <div className="treino-ativo-grid">
          {/* Coluna esquerda: Lista de contas */}
          <div className="treino-coluna-esquerda">
            <ListaContas
              contas={contas}
              sistema={sistemaTipo}
              contaAtualIndex={contaAtualIndex}
              onAcerto={handleAcerto}
              disabled={processando}
            />
          </div>

          {/* Coluna direita: Timer, Contador */}
          <div className="treino-coluna-direita">
            <Timer
              tempoLimite={tempoLimite}
              inicioTreino={inicioTreino}
              onTempoEsgotado={handleTempoEsgotado}
              pausado={false}
            />

            <ContadorPontos totalAcertos={totalAcertos} />
          </div>
        </div>
      </div>
    </>
  );
};

export default TreinoAtivo;
