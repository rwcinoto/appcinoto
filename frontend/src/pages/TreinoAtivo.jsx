import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ContadorPontos from "../components/treino/ContadorPontos";
import ContagemRegressiva from "../components/treino/ContagemRegressiva";
import ModalEscolhaFormatoResposta from "../components/treino/ModalEscolhaFormatoResposta";
import ListaContas from "../components/treino/ListaContas";
import ResultadoTreino from "../components/treino/ResultadoTreino";
import Timer from "../components/treino/Timer";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage, logError } from "../utils/errorHandler";
import api from "../services/api";
import "./TreinoAtivo.css";

const TreinoAtivo = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess } = useToast();

  // Dados do treino vindos da seleção
  // Salvar em estado local para manter disponível mesmo após recomeçar
  const [treinoData, setTreinoData] = useState(
    () => location.state?.treinoData
  );
  const [formatoResposta, setFormatoResposta] = useState(
    () => location.state?.formatoResposta || "sistema"
  );
  const inicializadoRef = useRef(false); // Ref para controlar se já foi inicializado
  const finalizadoRef = useRef(false); // Ref para controlar se o treino já foi finalizado

  // Estado do treino
  const [treinoId, setTreinoId] = useState(null);
  const [contas, setContas] = useState([]);
  const [contaAtualIndex, setContaAtualIndex] = useState(0);
  const [totalAcertos, setTotalAcertos] = useState(0);
  const totalAcertosRef = useRef(0); // Ref para rastrear acertos de forma mais confiável
  const [tempoLimite, setTempoLimite] = useState(0);
  const [inicioTreino, setInicioTreino] = useState(null); // Timestamp do início do treino
  const [sistemaTipo, setSistemaTipo] = useState("natural");
  const [processando, setProcessando] = useState(false); // Flag para prevenir múltiplas chamadas simultâneas
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [mostrarContagem, setMostrarContagem] = useState(false);
  const [mostrarModalFormato, setMostrarModalFormato] = useState(false);
  const [treinoFinalizado, setTreinoFinalizado] = useState(false);

  // Função para iniciar treino (reutilizável)
  const iniciarTreino = async (dadosTreino) => {
    const dados = dadosTreino || treinoData;

    if (!dados) {
      navigate("/novo-treino");
      return null;
    }

    try {
      setLoading(true);
      setErro(""); // Limpar erros anteriores
      const response = await api.post("/treinos/iniciar", {
        operacao_id: dados.operacao.id,
        limite_id: dados.limite.id,
        sistema_id: dados.sistema.id,
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
      setMostrarResultado(false); // Garantir que o resultado está oculto
      finalizadoRef.current = false; // Resetar flag de finalizado
      setTreinoFinalizado(false); // Resetar flag de treino finalizado

      // Retornar treino_id para usar na confirmação
      return treino_id;
    } catch (error) {
      logError("TreinoAtivo - iniciarTreino", error);
      setErro(getErrorMessage(error));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Inicializar treino apenas na primeira montagem
  useEffect(() => {
    // Evitar múltiplas inicializações
    if (inicializadoRef.current) {
      return;
    }

    // Se não tiver dados do location.state, redirecionar
    if (!location.state?.treinoData) {
      navigate("/novo-treino");
      return;
    }

    // Salvar treinoData no estado local
    setTreinoData(location.state.treinoData);
    
    // Salvar formatoResposta se fornecido
    if (location.state?.formatoResposta) {
      setFormatoResposta(location.state.formatoResposta);
    }

    // Marcar como inicializado e iniciar treino
    inicializadoRef.current = true;
    iniciarTreino(location.state.treinoData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executar apenas uma vez na montagem

  const handleAcerto = async (resposta) => {
    if (!resposta || resposta.trim() === "") return;
    if (!treinoId || processando || treinoFinalizado) {
      return;
    }

    // Prevenir múltiplas chamadas simultâneas
    setProcessando(true);

    try {
      const response = await api.post("/treinos/validar-resposta", {
        treino_id: treinoId,
        resposta: resposta,
        formato_resposta: formatoResposta || "sistema",
      });

      const { correto, proximaConta, tempoEsgotado } = response.data;

      // Se o tempo esgotou, não processar a resposta
      if (tempoEsgotado) {
        setProcessando(false);
        return;
      }

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
      logError("TreinoAtivo - handleAcerto", error);
      setErro(getErrorMessage(error));
      // Reabilitar mesmo em caso de erro
      setProcessando(false);
    }
  };

  const finalizarTreino = async () => {
    // Prevenir múltiplas finalizações
    if (!treinoId || finalizadoRef.current) return;

    // Marcar como finalizado imediatamente para bloquear novas respostas
    finalizadoRef.current = true;
    setTreinoFinalizado(true);
    setProcessando(true); // Bloquear processamento de novas respostas

    try {
      // Aguardar um pouco para garantir que qualquer resposta pendente seja processada
      // Mas não esperar muito para não atrasar a finalização
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await api.post("/treinos/finalizar", {
        treino_id: treinoId,
        total: totalAcertosRef.current, // Usar ref para garantir valor mais atualizado
      });

      // IMPORTANTE: Usar o valor retornado pelo backend como fonte da verdade
      setResultado({
        ...response.data,
        total: response.data.total, // Garantir que usamos o valor do backend
      });
      setMostrarResultado(true);
      
      // Atualizar o estado visual com o valor correto do backend
      setTotalAcertos(response.data.total);
      
      // Toast será mostrado se houver recorde
      if (response.data.bateuRecorde) {
        showSuccess("Parabéns! Você bateu um novo recorde!");
      }
    } catch (error) {
      logError("TreinoAtivo - finalizarTreino", error);
      setErro(getErrorMessage(error));
      // Em caso de erro, permitir tentar novamente
      finalizadoRef.current = false;
      setTreinoFinalizado(false);
      setProcessando(false);
    }
  };

  const handleTempoEsgotado = () => {
    finalizarTreino();
  };

  const handleRecomecar = () => {
    setMostrarResultado(false);
    setResultado(null);
    setErro(""); // Limpar erros anteriores

    // Verificar se o sistema é romano, hexadecimal ou binário para mostrar modal de escolha
    if (sistemaTipo === "romano" || sistemaTipo === "hexadecimal" || sistemaTipo === "binario") {
      // Mostrar modal de escolha de formato
      setMostrarModalFormato(true);
    } else {
      // Sistema não requer escolha, ir direto para contagem
      setFormatoResposta("sistema"); // Padrão: usar o sistema escolhido
      // O treino será criado quando a contagem terminar (handleContagemTerminar -> iniciarTreino)
      // A confirmação será feita no handleContagemTerminar após criar o treino
      setMostrarContagem(true);
    }
  };

  const confirmarInicioTreino = async (treinoIdParaConfirmar) => {
    if (!treinoIdParaConfirmar) {
      return;
    }

    try {
      await api.post("/treinos/confirmar-inicio", {
        treino_id: treinoIdParaConfirmar,
      });
    } catch (error) {
      // Não bloquear a contagem regressiva se houver erro
      logError("TreinoAtivo - confirmarInicioTreino", error);
    }
  };

  const handleEscolherFormato = async (formato) => {
    setFormatoResposta(formato);
    setMostrarModalFormato(false);
    // Confirmar início do treino (incrementar quantidade) antes de mostrar contagem
    // Buscar treino_id do treino atual ou do estado
    if (treinoId) {
      await confirmarInicioTreino(treinoId);
    }
    // Após escolher formato, mostrar contagem regressiva
    setMostrarContagem(true);
  };

  const handleCancelarFormato = () => {
    setMostrarModalFormato(false);
    // Se estava mostrando resultado, voltar para ele
    // Caso contrário, apenas fechar o modal e continuar o treino atual
    if (resultado) {
      setMostrarResultado(true);
    }
  };

  const handleContagemTerminar = async () => {
    setMostrarContagem(false);
    // Reiniciar treino com os mesmos dados usando a função compartilhada
    const novoTreinoId = await iniciarTreino(treinoData);
    // Confirmar início do treino (incrementar quantidade) após criar novo treino
    if (novoTreinoId) {
      try {
        await api.post("/treinos/confirmar-inicio", {
          treino_id: novoTreinoId,
        });
      } catch (error) {
        // Não bloquear se houver erro
        logError("TreinoAtivo - handleContagemTerminar confirmarInicio", error);
      }
    }
  };

  const handleRecomecarDuranteTreino = async () => {
    // Finalizar o treino atual sem mostrar resultado
    if (treinoId && !finalizadoRef.current) {
      finalizadoRef.current = true;
      setTreinoFinalizado(true);
      setProcessando(true);

      try {
        // Aguardar um pouco para garantir que qualquer resposta pendente seja processada
        await new Promise(resolve => setTimeout(resolve, 100));

        // Finalizar treino atual (silenciosamente)
        await api.post("/treinos/finalizar", {
          treino_id: treinoId,
          total: totalAcertosRef.current,
        });
      } catch (error) {
        logError("TreinoAtivo - handleRecomecarDuranteTreino", error);
        // Continuar mesmo se houver erro ao finalizar
      }
    }

    // Limpar estados
    setErro("");
    setProcessando(false);

    // Verificar se o sistema é romano, hexadecimal ou binário para mostrar modal de escolha
    if (sistemaTipo === "romano" || sistemaTipo === "hexadecimal" || sistemaTipo === "binario") {
      // Mostrar modal de escolha de formato
      setMostrarModalFormato(true);
    } else {
      // Sistema não requer escolha, ir direto para contagem
      setFormatoResposta("sistema"); // Padrão: usar o sistema escolhido
      // O treino será criado quando a contagem terminar (handleContagemTerminar -> iniciarTreino)
      // A confirmação será feita no handleContagemTerminar após criar o treino
      setMostrarContagem(true);
    }
  };

  const handleNovoTreino = () => {
    navigate("/novo-treino");
  };

  if (!usuario) {
    return (
      <div className="treino-ativo-container">
        <Loading text="Carregando..." />
      </div>
    );
  }

  if (!treinoData) {
    return null; // Será redirecionado
  }

  if (loading) {
    return (
      <div className="treino-ativo-container">
        <Loading text="Carregando treino..." />
      </div>
    );
  }

  if (erro && !mostrarResultado) {
    return (
      <div className="treino-ativo-container">
        <ErrorMessage
          message={erro}
          type="error"
          dismissible
          onDismiss={() => setErro("")}
        />
        <button
          className="btn-primary"
          onClick={() => navigate("/novo-treino")}
          style={{ marginTop: "16px" }}
        >
          Voltar para seleção
        </button>
      </div>
    );
  }

  return (
    <>
      {mostrarModalFormato && (sistemaTipo === "romano" || sistemaTipo === "hexadecimal" || sistemaTipo === "binario") && (
        <ModalEscolhaFormatoResposta
          sistemaTipo={sistemaTipo}
          onEscolher={handleEscolherFormato}
          onCancelar={handleCancelarFormato}
        />
      )}
      {mostrarContagem && (
        <ContagemRegressiva onTerminar={handleContagemTerminar} />
      )}
      {mostrarResultado && resultado && (
        <ResultadoTreino
          resultado={resultado}
          onRecomecar={handleRecomecar}
          onNovoTreino={handleNovoTreino}
        />
      )}
      <div className="treino-ativo-container">
        <div className="treino-ativo-grid">
          {/* Coluna esquerda: Lista de contas (meio no mobile) */}
          <div className="treino-coluna-esquerda">
            <ListaContas
              contas={contas}
              sistema={sistemaTipo}
              formatoResposta={formatoResposta}
              contaAtualIndex={contaAtualIndex}
              onAcerto={handleAcerto}
              disabled={processando || treinoFinalizado}
            />

            {/* Botão Recomeçar - Mobile: abaixo da lista de contas */}
            {!mostrarResultado && !treinoFinalizado && (
              <button
                className="btn-recomecar-durante-treino btn-recomecar-mobile"
                onClick={handleRecomecarDuranteTreino}
              >
                Recomeçar
              </button>
            )}
          </div>

          {/* Coluna direita: Timer, Contador (topo no mobile) */}
          <div className="treino-coluna-direita">
            <Timer
              tempoLimite={tempoLimite}
              inicioTreino={inicioTreino}
              onTempoEsgotado={handleTempoEsgotado}
              pausado={false}
            />

            <ContadorPontos totalAcertos={totalAcertos} />

            {/* Botão Recomeçar - Desktop: abaixo do contador */}
            {!mostrarResultado && !treinoFinalizado && (
              <button
                className="btn-recomecar-durante-treino"
                onClick={handleRecomecarDuranteTreino}
              >
                Recomeçar
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TreinoAtivo;
