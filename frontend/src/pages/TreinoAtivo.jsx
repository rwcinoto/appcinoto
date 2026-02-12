import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ErrorMessage from "../components/common/ErrorMessage";
import Loading from "../components/common/Loading";
import ContadorPontos from "../components/treino/ContadorPontos";
import ContagemRegressiva from "../components/treino/ContagemRegressiva";
import ListaContas from "../components/treino/ListaContas";
import ListaDatas from "../components/treino/ListaDatas";
import ModalEscolhaFormatoResposta from "../components/treino/ModalEscolhaFormatoResposta";
import ModalOpcoesCalendario from "../components/treino/ModalOpcoesCalendario";
import ResultadoTreino from "../components/treino/ResultadoTreino";
import Timer from "../components/treino/Timer";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import { getErrorMessage, logError } from "../utils/errorHandler";
import { verificarESalvarRecordeVisitante } from "../utils/recordesVisitante";
import "./TreinoAtivo.css";

const TreinoAtivo = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess } = useToast();

  // Chave para sessionStorage
  const STORAGE_KEY = "treinoAtivoData";

  // Dados do treino vindos da seleção
  // Salvar em estado local para manter disponível mesmo após recomeçar
  const [treinoData, setTreinoData] = useState(() => {
    // Primeiro tenta do location.state, depois do sessionStorage
    return (
      location.state?.treinoData ||
      (() => {
        try {
          const stored = sessionStorage.getItem(STORAGE_KEY);
          return stored ? JSON.parse(stored)?.treinoData : null;
        } catch {
          return null;
        }
      })()
    );
  });
  const [formatoResposta, setFormatoResposta] = useState(() => {
    // Primeiro tenta do location.state, depois do sessionStorage
    const fromState = location.state?.formatoResposta;
    if (fromState) return fromState;
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored
        ? JSON.parse(stored)?.formatoResposta || "sistema"
        : "sistema";
    } catch {
      return "sistema";
    }
  });
  const inicializadoRef = useRef(false);
  const finalizadoRef = useRef(false);
  const isRefreshRef = useRef(false);
  const calendarioTreinoPendenteRef = useRef(null);
  const recomecarCalendarioDuranteRef = useRef(false);
  const processandoCalendarioRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia?.("(max-width: 768px)");
    if (!mq) return;
    const atualizar = () => setIsMobile(mq.matches);
    atualizar();
    mq.addEventListener("change", atualizar);
    return () => mq.removeEventListener("change", atualizar);
  }, []);

  // Estado do treino
  const [treinoId, setTreinoId] = useState(null);
  const [contas, setContas] = useState([]);
  const [contaAtualIndex, setContaAtualIndex] = useState(0);
  const [totalAcertos, setTotalAcertos] = useState(0);
  const totalAcertosRef = useRef(0); // Ref para rastrear acertos de forma mais confiável
  const totalErrosRef = useRef(0); // Ref para rastrear erros de forma mais confiável
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
  const [mostrarModalOpcoesCalendario, setMostrarModalOpcoesCalendario] =
    useState(false);
  const [treinoFinalizado, setTreinoFinalizado] = useState(false);
  const [inputCalendarioComErro, setInputCalendarioComErro] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= 768,
  );

  const modoCalendario =
    location.state?.modo === "calendario" ||
    (treinoData?.tipo != null && Array.isArray(treinoData?.datas_iniciais));

  // Função para salvar dados do treino no sessionStorage
  const salvarTreinoNoStorage = (
    dadosTreino,
    formato,
    opcoesCalendario = null,
  ) => {
    try {
      const dadosParaSalvar = {
        treinoData: dadosTreino,
        timestamp: Date.now(),
      };
      if (opcoesCalendario) {
        dadosParaSalvar.modo = "calendario";
        dadosParaSalvar.visualizacao = opcoesCalendario.visualizacao || "texto";
        dadosParaSalvar.tipoResposta =
          opcoesCalendario.tipoResposta || "numeros";
        if (opcoesCalendario.chaveSeculo21Base != null) {
          dadosParaSalvar.chaveSeculo21Base =
            opcoesCalendario.chaveSeculo21Base;
        }
        if (opcoesCalendario.chaveJaneiroBase != null) {
          dadosParaSalvar.chaveJaneiroBase = opcoesCalendario.chaveJaneiroBase;
        }
      } else {
        dadosParaSalvar.formatoResposta =
          formato !== undefined ? formato : formatoResposta || "sistema";
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dadosParaSalvar));
    } catch (error) {
      logError("TreinoAtivo - salvarTreinoNoStorage", error);
    }
  };

  // Função para limpar dados do treino do sessionStorage
  const limparTreinoDoStorage = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      logError("TreinoAtivo - limparTreinoDoStorage", error);
    }
  };

  // Função para iniciar treino (reutilizável)
  const iniciarTreino = async (dadosTreino, isRefresh = false) => {
    const dados = dadosTreino || treinoData;

    if (!dados) {
      limparTreinoDoStorage();
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
      totalErrosRef.current = 0;
      setContaAtualIndex(0);
      setInicioTreino(Date.now()); // Registrar início do treino
      setProcessando(false);
      setMostrarResultado(false); // Garantir que o resultado está oculto
      finalizadoRef.current = false; // Resetar flag de finalizado
      setTreinoFinalizado(false); // Resetar flag de treino finalizado

      // Confirmar início: inicia o cronômetro no backend (após contagem ou ao criar)
      // Para refresh: contagem foi mostrada aqui; para fluxo normal: contagem foi em NovoTreino/InfoUsuario
      try {
        await api.post("/treinos/confirmar-inicio", {
          treino_id: treino_id,
        });
      } catch (error) {
        logError("TreinoAtivo - iniciarTreino confirmarInicio", error);
      }

      // Salvar no sessionStorage
      salvarTreinoNoStorage(dados, formatoResposta);

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
    if (inicializadoRef.current) {
      return;
    }

    // Calendário: chegar com seleção (tipo, limiteId) sem treinoData - criar treino e mostrar contagem aqui
    const calendarioSelecao =
      location.state?.modo === "calendario" &&
      location.state?.tipo &&
      location.state?.limiteId;
    if (calendarioSelecao && !location.state?.treinoData) {
      const criarETreino = async () => {
        try {
          const response = await api.post("/calendario/treinos/iniciar", {
            tipo: location.state.tipo,
            limite_id: parseInt(location.state.limiteId, 10),
            // Para treinos de século, enviar a chave base informada pelo usuário
            chaveSeculo21Base:
              location.state.tipo === "seculo"
                ? Number(location.state.chaveSeculo21Base ?? 0)
                : undefined,
            // Para treinos de meses, enviar a chave base de janeiro
            chaveJaneiroBase:
              location.state.tipo === "mes"
                ? Number(location.state.chaveJaneiroBase ?? 0)
                : undefined,
          });
          // confirmar-inicio será chamado quando a contagem terminar (handleContagemTerminar)
          calendarioTreinoPendenteRef.current = {
            treinoData: response.data,
            visualizacao: location.state.visualizacao || "texto",
            tipoResposta: location.state.tipoResposta || "numeros",
            chaveSeculo21Base:
              location.state.tipo === "seculo" &&
              location.state.chaveSeculo21Base != null
                ? Number(location.state.chaveSeculo21Base)
                : undefined,
            chaveJaneiroBase:
              location.state.tipo === "mes" &&
              location.state.chaveJaneiroBase != null
                ? Number(location.state.chaveJaneiroBase)
                : undefined,
          };
          setTreinoData(response.data);
          setMostrarContagem(true);
        } catch (error) {
          logError("TreinoAtivo - calendario iniciar", error);
          setErro(getErrorMessage(error));
          navigate("/calendario");
        } finally {
          setLoading(false);
        }
      };
      criarETreino();
      return;
    }

    const navigationEntry = performance.getEntriesByType("navigation")[0];
    const navigationType = navigationEntry?.type;
    const isPageReload = navigationType === "reload";

    let dadosTreinoParaUsar = location.state?.treinoData;
    let formatoParaUsar = location.state?.formatoResposta;
    let isRefresh = false;

    // Sempre tentar buscar do sessionStorage para verificar se há dados salvos
    let dadosDoStorage = null;
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.treinoData) {
          dadosDoStorage = parsed;
        }
      }
    } catch (error) {
      logError("TreinoAtivo - useEffect ler sessionStorage", error);
    }

    // Se a página foi recarregada E há dados no storage, é refresh
    if (isPageReload && dadosDoStorage) {
      if (dadosDoStorage.modo === "calendario") {
        limparTreinoDoStorage();
        navigate("/calendario");
        return;
      }
      if (!dadosTreinoParaUsar) {
        dadosTreinoParaUsar = dadosDoStorage.treinoData;
        formatoParaUsar = dadosDoStorage.formatoResposta || "sistema";
      }
      isRefresh = true;
    } else if (!dadosTreinoParaUsar && dadosDoStorage) {
      if (dadosDoStorage.modo === "calendario") {
        limparTreinoDoStorage();
        navigate("/calendario");
        return;
      }
      dadosTreinoParaUsar = dadosDoStorage.treinoData;
      formatoParaUsar = dadosDoStorage.formatoResposta || "sistema";
      isRefresh = true;
    }

    // Atualizar ref de refresh
    isRefreshRef.current = isRefresh;

    // Se não tiver dados em lugar nenhum, redirecionar
    if (!dadosTreinoParaUsar) {
      limparTreinoDoStorage();
      navigate("/novo-treino");
      return;
    }

    // Salvar treinoData no estado local
    setTreinoData(dadosTreinoParaUsar);

    // Treino de calendário: já foi iniciado em InfoUsuarioCalendario, apenas configurar estado local
    const ehCalendario =
      location.state?.modo === "calendario" ||
      (dadosTreinoParaUsar?.tipo &&
        Array.isArray(dadosTreinoParaUsar?.datas_iniciais));
    if (ehCalendario) {
      const dt = dadosTreinoParaUsar;
      // Contagem já ocorreu em CardRecordeCalendario/InfoUsuarioCalendario; confirmar início agora
      (async () => {
        try {
          await api.post("/calendario/treinos/confirmar-inicio", {
            treino_id: dt.treino_id,
          });
        } catch (e) {
          logError("TreinoAtivo - calendario confirmar-inicio ao carregar", e);
        }
      })();
      const viz =
        location.state?.visualizacao || dadosDoStorage?.visualizacao || "texto";
      const tipResp =
        location.state?.tipoResposta ||
        dadosDoStorage?.tipoResposta ||
        "numeros";
      setTreinoId(dt.treino_id);
      setContas(dt.datas_iniciais || []);
      setTempoLimite(dt.limite?.tempo || 60);
      setInicioTreino(Date.now());
      setTotalAcertos(0);
      totalAcertosRef.current = 0;
      totalErrosRef.current = 0;
      setContaAtualIndex(0);
      setProcessando(false);
      setMostrarResultado(false);
      finalizadoRef.current = false;
      setTreinoFinalizado(false);
      setInputCalendarioComErro(false);
      inicializadoRef.current = true;
      salvarTreinoNoStorage(dt, null, {
        visualizacao: viz,
        tipoResposta: tipResp,
      });
      setLoading(false);
      return;
    }

    // Salvar formatoResposta se fornecido
    if (formatoParaUsar) {
      setFormatoResposta(formatoParaUsar);
    }

    // IMPORTANTE: Salvar dados no sessionStorage imediatamente para persistir em caso de refresh
    // Isso garante que mesmo se o usuário apertar F5 antes do treino ser iniciado, os dados estarão salvos
    // Também salvar quando for refresh para garantir que os dados estão atualizados
    try {
      salvarTreinoNoStorage(dadosTreinoParaUsar, formatoParaUsar || "sistema");
    } catch (error) {
      logError("TreinoAtivo - useEffect salvarTreinoNoStorage", error);
    }

    // Marcar como inicializado
    inicializadoRef.current = true;

    // Se for refresh, mostrar contagem regressiva sem criar treino ainda
    if (isRefresh) {
      setLoading(false);
      // Definir sistemaTipo no estado para usar depois
      const sistemaTipoDetectado =
        dadosTreinoParaUsar?.sistema?.tipo ||
        dadosTreinoParaUsar?.sistemaTipo ||
        "natural";
      setSistemaTipo(sistemaTipoDetectado);
      // Verificar se o sistema é romano, hexadecimal ou binário para mostrar modal de escolha
      if (
        sistemaTipoDetectado === "romano" ||
        sistemaTipoDetectado === "hexadecimal" ||
        sistemaTipoDetectado === "binario"
      ) {
        // Mostrar modal de escolha de formato
        setMostrarModalFormato(true);
      } else {
        // Sistema não requer escolha, ir direto para contagem
        setFormatoResposta(formatoParaUsar || "sistema");
        setMostrarContagem(true);
      }
    } else {
      // Se não for refresh, iniciar treino normalmente
      iniciarTreino(dadosTreinoParaUsar, false);
    }
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

      // Incrementar contador quando acerta
      // Usar ref + setState para garantir sincronização perfeita
      if (correto) {
        const novoTotal = totalAcertosRef.current + 1;
        totalAcertosRef.current = novoTotal;
        setTotalAcertos(novoTotal);
      }
      // NOTA: Erros são contabilizados em handleErro, chamado pelo ListaContas quando detecta erro

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

  const handleErro = () => {
    // Incrementar contador de erros quando o usuário digita uma resposta errada
    if (!treinoId || treinoFinalizado) return;

    totalErrosRef.current = totalErrosRef.current + 1;
  };

  const handleAcertoCalendario = async (resposta) => {
    const valor = String(resposta || "").trim();
    if (!valor || !treinoId || treinoFinalizado) return;
    if (processandoCalendarioRef.current) return;
    processandoCalendarioRef.current = true;
    setProcessando(true);
    setInputCalendarioComErro(false);

    try {
      const tipoRespostaApi =
        calendarioTreinoPendenteRef.current?.tipoResposta ||
        (() => {
          try {
            const s = sessionStorage.getItem(STORAGE_KEY);
            return s ? JSON.parse(s)?.tipoResposta : null;
          } catch {
            return null;
          }
        })() ||
        location.state?.tipoResposta ||
        "numeros";
      const response = await api.post("/calendario/treinos/validar-resposta", {
        treino_id: treinoId,
        resposta: valor,
        tipo_resposta: tipoRespostaApi,
      });

      const data = response?.data;
      const correto = data?.correto === true;
      const tempoEsgotado = data?.tempoEsgotado === true;
      const proximaData = data?.proximaData;

      if (tempoEsgotado) {
        return;
      }

      if (correto) {
        const novoTotal = totalAcertosRef.current + 1;
        totalAcertosRef.current = novoTotal;
        setTotalAcertos(novoTotal);
        setInputCalendarioComErro(false);
        setContaAtualIndex(0);
        setContas((prev) => {
          const novas = [...prev];
          novas.shift();
          if (proximaData) novas.push(proximaData);
          return novas;
        });
      } else {
        totalErrosRef.current = totalErrosRef.current + 1;
        setInputCalendarioComErro(true);
      }
    } catch (error) {
      logError("TreinoAtivo - handleAcertoCalendario", error);
      setErro(getErrorMessage(error));
    } finally {
      processandoCalendarioRef.current = false;
      setProcessando(false);
    }
  };

  const finalizarTreinoCalendario = async () => {
    if (!treinoId || finalizadoRef.current) return;

    finalizadoRef.current = true;
    setTreinoFinalizado(true);
    setProcessando(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const response = await api.post("/calendario/treinos/finalizar", {
        treino_id: treinoId,
        total: totalAcertosRef.current,
        erros: totalErrosRef.current,
      });

      const resultadoFinal = { ...response.data };

      setResultado(resultadoFinal);
      setMostrarResultado(true);
      setTotalAcertos(response.data.total);
      limparTreinoDoStorage();

      if (resultadoFinal.bateuRecorde) {
        showSuccess("Parabéns! Você bateu um novo recorde!");
      }
    } catch (error) {
      logError("TreinoAtivo - finalizarTreinoCalendario", error);
      setErro(getErrorMessage(error));
      finalizadoRef.current = false;
      setTreinoFinalizado(false);
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
      await new Promise((resolve) => setTimeout(resolve, 100));

      const response = await api.post("/treinos/finalizar", {
        treino_id: treinoId,
        total: totalAcertosRef.current, // Usar ref para garantir valor mais atualizado
        erros: totalErrosRef.current, // Enviar quantidade de erros
      });

      // IMPORTANTE: Usar o valor retornado pelo backend como fonte da verdade
      let resultadoFinal = {
        ...response.data,
        total: response.data.total, // Garantir que usamos o valor do backend
      };

      // Se for visitante, verificar recordes locais no localStorage
      if (usuario?.isVisitante && treinoData) {
        const resultadoRecorde = verificarESalvarRecordeVisitante(
          treinoData.operacao.id,
          treinoData.limite.id,
          treinoData.sistema.id,
          response.data.total,
        );

        // Sobrescrever informações de recorde com dados locais
        resultadoFinal.bateuRecorde = resultadoRecorde.bateuRecorde;
        resultadoFinal.recordeAnterior = resultadoRecorde.recordeAnterior;
      }

      setResultado(resultadoFinal);
      setMostrarResultado(true);

      // Atualizar o estado visual com o valor correto do backend
      setTotalAcertos(response.data.total);

      // Limpar sessionStorage ao finalizar
      limparTreinoDoStorage();

      // Toast será mostrado se houver recorde (tanto para usuários normais quanto visitantes)
      if (resultadoFinal.bateuRecorde) {
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
    if (modoCalendario) {
      finalizarTreinoCalendario();
    } else {
      finalizarTreino();
    }
  };

  const handleRecomecar = () => {
    setMostrarResultado(false);
    setResultado(null);
    setErro(""); // Limpar erros anteriores

    // Verificar se o sistema é romano, hexadecimal ou binário para mostrar modal de escolha
    if (
      sistemaTipo === "romano" ||
      sistemaTipo === "hexadecimal" ||
      sistemaTipo === "binario"
    ) {
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

  const handleEscolherFormato = async (formato) => {
    setFormatoResposta(formato);
    setMostrarModalFormato(false);
    if (isRefreshRef.current && treinoData) {
      salvarTreinoNoStorage(treinoData, formato);
    }
    // confirmar-inicio será chamado em iniciarTreino quando a contagem terminar
    setMostrarContagem(true);
  };

  const handleCancelarFormato = () => {
    setMostrarModalFormato(false);
    if (resultado) {
      setMostrarResultado(true);
    }
  };

  const handleRecomecarCalendario = () => {
    setMostrarResultado(false);
    setErro("");
    setMostrarModalOpcoesCalendario(true);
  };

  const handleRecomecarDuranteTreinoCalendario = async () => {
    if (!treinoId || finalizadoRef.current) return;
    recomecarCalendarioDuranteRef.current = true;
    finalizadoRef.current = true;
    setTreinoFinalizado(true);
    setProcessando(true);
    setErro("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await api.post("/calendario/treinos/finalizar", {
        treino_id: treinoId,
        erros: totalErrosRef.current,
      });
    } catch (error) {
      logError("TreinoAtivo - handleRecomecarDuranteTreinoCalendario", error);
    } finally {
      setProcessando(false);
    }
    setMostrarModalOpcoesCalendario(true);
  };

  const handleConfirmarOpcoesCalendarioRecomecar = async (opcoes) => {
    setMostrarModalOpcoesCalendario(false);
    recomecarCalendarioDuranteRef.current = false;
    setResultado(null);
    if (!treinoData?.tipo || !treinoData?.limite?.id) return;
    try {
      const chaveSeculo21Base =
        treinoData.tipo === "seculo" && opcoes?.chaveSeculo21 != null
          ? Number(opcoes.chaveSeculo21)
          : undefined;
      const chaveJaneiroBase =
        treinoData.tipo === "mes" && opcoes?.chaveJaneiro != null
          ? Number(opcoes.chaveJaneiro)
          : undefined;
      const response = await api.post("/calendario/treinos/iniciar", {
        tipo: treinoData.tipo,
        limite_id: treinoData.limite.id,
        chaveSeculo21Base,
        chaveJaneiroBase,
      });
      // confirmar-inicio será chamado em handleContagemTerminar quando a contagem terminar
      const tipoResposta = opcoes?.resposta === "nomeDia" ? "texto" : "numeros";
      calendarioTreinoPendenteRef.current = {
        treinoData: response.data,
        visualizacao: opcoes?.visualizacao || "texto",
        tipoResposta: opcoes?.resposta != null ? tipoResposta : "numeros",
        chaveSeculo21Base:
          treinoData.tipo === "seculo" && chaveSeculo21Base != null
            ? chaveSeculo21Base
            : undefined,
        chaveJaneiroBase:
          treinoData.tipo === "mes" && chaveJaneiroBase != null
            ? chaveJaneiroBase
            : undefined,
      };
      setTreinoData(response.data);
      setMostrarContagem(true);
    } catch (error) {
      logError("TreinoAtivo - recomeçar calendario", error);
      setErro(getErrorMessage(error));
    }
  };

  const handleCancelarOpcoesCalendario = () => {
    setMostrarModalOpcoesCalendario(false);
    if (recomecarCalendarioDuranteRef.current) {
      recomecarCalendarioDuranteRef.current = false;
      navigate("/calendario");
      return;
    }
    if (resultado) {
      setMostrarResultado(true);
    }
  };

  const handleContagemTerminar = async () => {
    setMostrarContagem(false);

    // Calendário: treino já foi criado no useEffect; confirmar início (inicia o cronômetro no backend) e exibir
    const pendente = calendarioTreinoPendenteRef.current;
    if (pendente?.treinoData) {
      const dt = pendente.treinoData;
      try {
        await api.post("/calendario/treinos/confirmar-inicio", {
          treino_id: dt.treino_id,
        });
      } catch (e) {
        logError(
          "TreinoAtivo - handleContagemTerminar confirmar-inicio calendário",
          e,
        );
      }
      setTreinoId(dt.treino_id);
      setContas(dt.datas_iniciais || []);
      setTempoLimite(dt.limite?.tempo || 60);
      setInicioTreino(Date.now());
      setTotalAcertos(0);
      totalAcertosRef.current = 0;
      totalErrosRef.current = 0;
      setContaAtualIndex(0);
      setProcessando(false);
      setMostrarResultado(false);
      finalizadoRef.current = false;
      setTreinoFinalizado(false);
      setInputCalendarioComErro(false);
      inicializadoRef.current = true;
      salvarTreinoNoStorage(dt, null, {
        visualizacao: pendente.visualizacao || "texto",
        tipoResposta: pendente.tipoResposta || "numeros",
        chaveSeculo21Base: pendente.chaveSeculo21Base,
        chaveJaneiroBase: pendente.chaveJaneiroBase,
      });
      calendarioTreinoPendenteRef.current = null;
      return;
    }

    await iniciarTreino(treinoData, isRefreshRef.current);
    isRefreshRef.current = false;
  };

  const handleRecomecarDuranteTreino = async () => {
    // Finalizar o treino atual sem mostrar resultado
    if (treinoId && !finalizadoRef.current) {
      finalizadoRef.current = true;
      setTreinoFinalizado(true);
      setProcessando(true);

      try {
        // Aguardar um pouco para garantir que qualquer resposta pendente seja processada
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Finalizar treino atual (silenciosamente)
        await api.post("/treinos/finalizar", {
          treino_id: treinoId,
          total: totalAcertosRef.current,
          erros: totalErrosRef.current,
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
    if (
      sistemaTipo === "romano" ||
      sistemaTipo === "hexadecimal" ||
      sistemaTipo === "binario"
    ) {
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
    limparTreinoDoStorage();
    navigate("/novo-treino");
  };

  if (!usuario) {
    return (
      <div className="treino-ativo-container">
        <Loading text="Carregando..." />
      </div>
    );
  }

  if (modoCalendario) {
    // Durante contagem ou antes de ter treinoId, mostrar apenas contagem ou loading
    if (mostrarContagem || !treinoId) {
      return (
        <>
          {mostrarContagem && (
            <ContagemRegressiva onTerminar={handleContagemTerminar} />
          )}
          {!mostrarContagem && <Loading text="Preparando treino..." />}
        </>
      );
    }

    // Preferir ref/sessionStorage sobre location.state para que "Recomeçar" com novas opções seja aplicado
    const storedCalendario = (() => {
      try {
        const s = sessionStorage.getItem(STORAGE_KEY);
        return s ? JSON.parse(s) : null;
      } catch {
        return null;
      }
    })();
    const visualizacaoCalendario =
      calendarioTreinoPendenteRef.current?.visualizacao ||
      storedCalendario?.visualizacao ||
      location.state?.visualizacao ||
      "texto";
    const tipoRespostaCalendario =
      calendarioTreinoPendenteRef.current?.tipoResposta ||
      storedCalendario?.tipoResposta ||
      location.state?.tipoResposta ||
      "numeros";

    const mostrarOpcoesRespostaCalendario =
      isMobile &&
      (treinoData?.tipo === "data_geral" ||
        treinoData?.tipo === "data_21" ||
        treinoData?.tipo === "data_esse_ano");

    return (
      <>
        <ModalOpcoesCalendario
          mostrar={mostrarModalOpcoesCalendario}
          mostrarOpcoesResposta={mostrarOpcoesRespostaCalendario}
          onConfirmar={handleConfirmarOpcoesCalendarioRecomecar}
          onCancelar={handleCancelarOpcoesCalendario}
          visualizacaoInicial={
            location.state?.visualizacao ||
            (() => {
              try {
                const s = sessionStorage.getItem(STORAGE_KEY);
                return s ? JSON.parse(s)?.visualizacao : null;
              } catch {
                return null;
              }
            })() ||
            "texto"
          }
          respostaInicial={(() => {
            const t =
              location.state?.tipoResposta ||
              (() => {
                try {
                  const s = sessionStorage.getItem(STORAGE_KEY);
                  return s ? JSON.parse(s)?.tipoResposta : null;
                } catch {
                  return null;
                }
              })();
            return t === "texto" ? "nomeDia" : "numeros";
          })()}
          mostrarChaveSeculo21={treinoData?.tipo === "seculo"}
          chaveSeculo21Inicial={
            treinoData?.tipo === "seculo"
              ? (() => {
                  if (typeof location.state?.chaveSeculo21Base === "number") {
                    return location.state.chaveSeculo21Base;
                  }
                  if (
                    storedCalendario &&
                    typeof storedCalendario.chaveSeculo21Base === "number"
                  ) {
                    return storedCalendario.chaveSeculo21Base;
                  }
                  return 0;
                })()
              : 0
          }
          mostrarChaveJaneiro={treinoData?.tipo === "mes"}
          chaveJaneiroInicial={
            treinoData?.tipo === "mes"
              ? (() => {
                  if (typeof location.state?.chaveJaneiroBase === "number") {
                    return location.state.chaveJaneiroBase;
                  }
                  if (
                    storedCalendario &&
                    typeof storedCalendario.chaveJaneiroBase === "number"
                  ) {
                    return storedCalendario.chaveJaneiroBase;
                  }
                  return 0;
                })()
              : 0
          }
        />
        {mostrarResultado && resultado && (
          <ResultadoTreino
            resultado={resultado}
            onRecomecar={handleRecomecarCalendario}
            onNovoTreino={() => navigate("/calendario")}
          />
        )}
        <div className="treino-ativo-container">
          <div className="treino-ativo-grid">
            <div className="treino-coluna-esquerda">
              <ListaDatas
                datas={contas}
                formatoVisualizacao={visualizacaoCalendario}
                tipoResposta={tipoRespostaCalendario}
                onAcerto={handleAcertoCalendario}
                onErro={handleErro}
                inputComErro={inputCalendarioComErro}
                disabled={processando || treinoFinalizado}
                tipoTreinoCalendario={treinoData?.tipo}
              />
              {!mostrarResultado && !treinoFinalizado && (
                <button
                  className="btn-recomecar-durante-treino btn-recomecar-mobile"
                  onClick={handleRecomecarDuranteTreinoCalendario}
                >
                  Recomeçar
                </button>
              )}
            </div>
            <div className="treino-coluna-direita">
              <Timer
                tempoLimite={tempoLimite}
                inicioTreino={inicioTreino}
                onTempoEsgotado={handleTempoEsgotado}
                pausado={false}
              />
              <ContadorPontos totalAcertos={totalAcertos} />
              {!mostrarResultado && !treinoFinalizado && (
                <button
                  className="btn-recomecar-durante-treino"
                  onClick={handleRecomecarDuranteTreinoCalendario}
                >
                  Recomeçar
                </button>
              )}
            </div>
          </div>
        </div>
      </>
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
      {mostrarModalFormato &&
        (sistemaTipo === "romano" ||
          sistemaTipo === "hexadecimal" ||
          sistemaTipo === "binario") && (
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
              onErro={handleErro}
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
