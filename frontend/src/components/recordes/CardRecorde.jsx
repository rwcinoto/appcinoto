import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ContagemRegressiva from "../treino/ContagemRegressiva";
import ModalEscolhaFormatoResposta from "../treino/ModalEscolhaFormatoResposta";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import { getErrorMessage, logError } from "../../utils/errorHandler";
import "./CardRecorde.css";

const CardRecorde = ({ recorde, usuarioIdVisualizado = null }) => {
  const { usuario } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [posicaoRanking, setPosicaoRanking] = useState(null);
  const [iniciandoTreino, setIniciandoTreino] = useState(false);
  const [mostrarContagem, setMostrarContagem] = useState(false);
  const [mostrarModalFormato, setMostrarModalFormato] = useState(false);
  const [dadosTreino, setDadosTreino] = useState(null);
  const [formatoResposta, setFormatoResposta] = useState(null);

  // Determinar qual usuário usar para buscar a posição
  const usuarioIdParaPosicao = usuarioIdVisualizado || (usuario?.id || null);

  // Buscar posição no ranking global
  useEffect(() => {
    const buscarPosicaoRanking = async () => {
      if (!recorde || !usuarioIdParaPosicao || !recorde.operacao || !recorde.limite || !recorde.sistema) {
        return;
      }

      try {
        const params = new URLSearchParams({
          operacao_id: recorde.operacao.id.toString(),
          limite_id: recorde.limite.id.toString(),
          sistema_id: recorde.sistema.id.toString(),
        });

        // Adicionar usuario_id se estiver visualizando outro usuário
        if (usuarioIdVisualizado && usuarioIdVisualizado !== usuario?.id) {
          params.append("usuario_id", usuarioIdVisualizado.toString());
        }

        const response = await api.get(`/rankings/posicao?${params.toString()}`);
        setPosicaoRanking(response.data.posicao);
      } catch (error) {
        console.error("Erro ao buscar posição no ranking:", error);
        setPosicaoRanking(null);
      }
    };

    buscarPosicaoRanking();
  }, [recorde, usuarioIdParaPosicao, usuarioIdVisualizado, usuario]);

  if (!recorde) {
    return null;
  }

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

  const formatarData = (data) => {
    if (!data) return "-";
    try {
      const dataObj = new Date(data);
      return format(dataObj, "dd/MM/yy");
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "-";
    }
  };

  const obterCorOperacao = (tipo) => {
    const cores = {
      soma: "#2196f3", // Azul
      subtracao: "#4caf50", // Verde
      multiplicacao: "#ff9800", // Laranja
      divisao: "#ffeb3b", // Amarelo
      raiz: "#f44336", // Vermelho
      conversao: "#BA68C8", // Roxo claro
    };
    return cores[tipo] || "#666";
  };

  const obterCorSistema = (tipo) => {
    if (isDarkMode) {
      const coresDark = {
        natural: { background: "rgba(33, 150, 243, 0.25)", color: "#64B5F6" },
        inteiro: { background: "rgba(0, 105, 92, 0.25)", color: "#4DB6AC" },
        romano: { background: "rgba(156, 39, 176, 0.25)", color: "#BA68C8" },
        decimal: { background: "rgba(198, 40, 40, 0.25)", color: "#EF5350" },
        binario: { background: "rgba(230, 81, 0, 0.25)", color: "#FFB74D" },
        hexadecimal: { background: "rgba(158, 158, 158, 0.25)", color: "#B0B0B0" },
      };
      return coresDark[tipo] || { background: "rgba(158, 158, 158, 0.25)", color: "#B0B0B0" };
    }
    
    const cores = {
      natural: { background: "#e3f2fd", color: "#1976d2" },
      inteiro: { background: "#e0f2f1", color: "#00695c" },
      romano: { background: "#f3e5f5", color: "#7b1fa2" },
      decimal: { background: "#ffebee", color: "#c62828" },
      binario: { background: "#fff3e0", color: "#e65100" },
      hexadecimal: { background: "#F5F5F5", color: "#000000" },
    };
    return cores[tipo] || { background: "#f5f5f5", color: "#666" };
  };

  const tipoOperacao = recorde.operacao?.tipo || "";
  const corOperacao = obterCorOperacao(tipoOperacao);
  const tipoSistema = recorde.sistema?.tipo || "";
  const coresSistema = obterCorSistema(tipoSistema);

  // Calcular tempo médio por conta
  const calcularTempoMedioPorConta = () => {
    const totalAcertos = recorde.total || 0;
    const tempoLimite = recorde.limite?.tempo || 0;

    if (totalAcertos === 0 || tempoLimite === 0) {
      return null;
    }

    const tempoMedio = tempoLimite / totalAcertos;
    return tempoMedio;
  };

  const tempoMedioPorConta = calcularTempoMedioPorConta();
  const tempoMedioFormatado =
    tempoMedioPorConta !== null
      ? tempoMedioPorConta.toFixed(1).replace(".", ",")
      : null;

  const handleIniciarTreino = async () => {
    if (!recorde?.operacao || !recorde?.limite || !recorde?.sistema) {
      return;
    }

    setIniciandoTreino(true);

    try {
      const response = await api.post("/treinos/iniciar", {
        operacao_id: recorde.operacao.id,
        limite_id: recorde.limite.id,
        sistema_id: recorde.sistema.id,
      });

      // Salvar dados do treino
      setDadosTreino(response.data);

      // Verificar se o sistema é romano, hexadecimal ou binário para mostrar modal de escolha
      if (tipoSistema === "romano" || tipoSistema === "hexadecimal" || tipoSistema === "binario") {
        // Mostrar modal de escolha de formato
        setMostrarModalFormato(true);
      } else {
        // Sistema não requer escolha, ir direto para contagem
        setFormatoResposta("sistema"); // Padrão: usar o sistema escolhido
        // Confirmar início do treino (incrementar quantidade) antes de mostrar contagem
        try {
          await api.post("/treinos/confirmar-inicio", {
            treino_id: response.data.treino_id,
          });
        } catch (error) {
          // Não bloquear a contagem regressiva se houver erro
          logError("CardRecorde - handleIniciarTreino confirmarInicio", error);
        }
        setMostrarContagem(true);
      }
    } catch (error) {
      logError("CardRecorde - handleIniciarTreino", error);
      alert(getErrorMessage(error));
      setIniciandoTreino(false);
    }
  };

  const confirmarInicioTreino = async () => {
    if (!dadosTreino?.treino_id) {
      return;
    }

    try {
      await api.post("/treinos/confirmar-inicio", {
        treino_id: dadosTreino.treino_id,
      });
    } catch (error) {
      // Não bloquear a contagem regressiva se houver erro
      logError("CardRecorde - confirmarInicioTreino", error);
    }
  };

  const handleEscolherFormato = async (formato) => {
    setFormatoResposta(formato);
    setMostrarModalFormato(false);
    // Confirmar início do treino (incrementar quantidade) antes de mostrar contagem
    await confirmarInicioTreino();
    // Após escolher formato, mostrar contagem regressiva
    setMostrarContagem(true);
  };

  const handleCancelarFormato = () => {
    setMostrarModalFormato(false);
    setIniciandoTreino(false);
    setDadosTreino(null);
    setFormatoResposta(null);
  };

  const handleContagemTerminar = () => {
    setMostrarContagem(false);
    setIniciandoTreino(false);
    // Navegar para tela de treino ativo com dados do treino e formato escolhido
    navigate("/treino-ativo", { 
      state: { 
        treinoData: dadosTreino,
        formatoResposta: formatoResposta || "sistema", // Padrão se não escolhido
        sistemaTipo: tipoSistema || "natural"
      } 
    });
  };

  return (
    <>
      {mostrarModalFormato && (tipoSistema === "romano" || tipoSistema === "hexadecimal" || tipoSistema === "binario") && (
        <ModalEscolhaFormatoResposta
          sistemaTipo={tipoSistema}
          onEscolher={handleEscolherFormato}
          onCancelar={handleCancelarFormato}
        />
      )}
      {mostrarContagem && (
        <ContagemRegressiva onTerminar={handleContagemTerminar} />
      )}
      <div className="card-recorde" style={{ borderColor: corOperacao, "--cor-operacao": corOperacao }}>
      <div className="card-recorde-header">
        <div className="card-recorde-titulo-linha">
          <button
            className="card-recorde-botao-treino"
            onClick={handleIniciarTreino}
            disabled={iniciandoTreino}
            title="Iniciar treino com estas configurações"
            aria-label="Iniciar treino com estas configurações"
          >
            {iniciandoTreino ? "..." : "🏃"}
          </button>
          <h3>{recorde.operacao?.nome || "Operação"}</h3>
          <span className="card-recorde-tipo" style={{ color: corOperacao }}>
            {formatarTipoOperacao(tipoOperacao)}
          </span>
        </div>
        <div className="card-recorde-acertos-linha">
          <span className="card-recorde-acertos-texto">
            <strong>Acertos:</strong>{" "}
            <span
              className="card-recorde-acertos-valor"
              style={{ color: corOperacao }}
            >
              {recorde.total || 0}
            </span>
            {tempoMedioFormatado && (
              <span className="card-recorde-tempo-medio">
                {" "}({tempoMedioFormatado} seg/conta)
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="card-recorde-info-linha">
        <div className="card-recorde-info-item">
          <span className="card-recorde-info-label">Limite</span>
          <span className="card-recorde-info-value">
            {recorde.limite?.descricao || "-"}
          </span>
        </div>

        <div className="card-recorde-info-item">
          <span className="card-recorde-info-label">Sistema</span>
          <span 
            className="card-recorde-info-value" 
            style={{ 
              backgroundColor: coresSistema.background, 
              color: coresSistema.color,
              padding: "4px 12px",
              borderRadius: "12px",
              display: "inline-block"
            }}
          >
            {recorde.sistema?.tipo
              ? formatarTipoSistema(recorde.sistema.tipo)
              : "-"}
          </span>
        </div>

        <div className="card-recorde-info-item">
          <span className="card-recorde-info-label">Data</span>
          <span className="card-recorde-info-value">
            {formatarData(recorde.atualizado_em)}
          </span>
        </div>
      </div>

      <div className="card-recorde-posicao-ranking">
        <span className="card-recorde-tentativas-texto">
          Treinos: {recorde.quantidade || 0}
        </span>
        {posicaoRanking !== null && recorde.operacao && recorde.limite && recorde.sistema && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="card-recorde-posicao-label">Posição global:</span>
            <Link
              to={`/rankings?operacao_id=${recorde.operacao.id}&limite_id=${recorde.limite.id}&sistema_id=${recorde.sistema.id}`}
              className="card-recorde-posicao-valor card-recorde-posicao-link"
            >
              #{posicaoRanking}
            </Link>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default CardRecorde;
