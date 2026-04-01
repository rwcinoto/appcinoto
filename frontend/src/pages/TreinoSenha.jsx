import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ErrorMessage from "../components/common/ErrorMessage";
import Loading from "../components/common/Loading";
import ContagemRegressiva from "../components/treino/ContagemRegressiva";
import ResultadoTreino from "../components/treino/ResultadoTreino";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { LIMITE_TENTATIVAS } from "../constants/senha";
import { getErrorMessage, logError } from "../utils/errorHandler";
import "./TreinoSenha.css";
const STORAGE_KEY = "treinoSenhaData";

const TreinoSenha = () => {
  useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [config] = useState(() => {
    const fromState = location.state;
    if (fromState?.digitos) return fromState;
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored)?.config : null;
    } catch {
      return null;
    }
  });

  const [fase, setFase] = useState("carregando");
  const [treinoId, setTreinoId] = useState(null);
  const [tentativas, setTentativas] = useState([]);
  const [inputAtual, setInputAtual] = useState([]);
  const [focusIndex, setFocusIndex] = useState(0);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [inicioTreino, setInicioTreino] = useState(null);
  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  const [resultado, setResultado] = useState(null);

  const containerRef = useRef(null);
  const inicializadoRef = useRef(false);
  const intervalRef = useRef(null);
  const tentativasEndRef = useRef(null);

  const tamanho = config?.tamanho || 4;
  const digitos = config?.digitos || 6;
  const repeticao = config?.repeticao ?? 0;

  const salvarSessao = useCallback(
    (dados) => {
      try {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ config, ...dados })
        );
      } catch {}
    },
    [config]
  );

  useEffect(() => {
    if (!config) {
      navigate("/senha");
      return;
    }

    if (inicializadoRef.current) return;
    inicializadoRef.current = true;

    const iniciar = async () => {
      try {
        const res = await api.post("/senha/treinos/iniciar", {
          digitos: config.digitos,
          tamanho: config.tamanho,
          repeticao: config.repeticao,
        });
        setTreinoId(res.data.treino_id);
        setInputAtual(Array(config.tamanho).fill(""));
        setFase("contagem");
        salvarSessao({ treinoId: res.data.treino_id });
      } catch (error) {
        logError("TreinoSenha - iniciar", error);
        setErro(getErrorMessage(error));
        setFase("erro");
      }
    };

    iniciar();
  }, [config, navigate, salvarSessao]);

  const handleContagemTerminou = useCallback(async () => {
    if (!treinoId) return;
    try {
      await api.post("/senha/treinos/confirmar-inicio", {
        treino_id: treinoId,
      });
      setInicioTreino(Date.now());
      setFase("jogando");
      setTimeout(() => containerRef.current?.focus(), 100);
    } catch (error) {
      logError("TreinoSenha - confirmarInicio", error);
      setErro(getErrorMessage(error));
    }
  }, [treinoId]);

  useEffect(() => {
    if (fase !== "jogando" || !inicioTreino) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTempoDecorrido(Date.now() - inicioTreino);
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fase, inicioTreino]);

  useEffect(() => {
    if (tentativasEndRef.current) {
      tentativasEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [tentativas]);

  const formatarTempo = (ms) => {
    if (!ms && ms !== 0) return "-";
    const totalSeg = Math.floor(ms / 1000);
    const min = Math.floor(totalSeg / 60);
    const seg = totalSeg % 60;
    const cent = Math.floor((ms % 1000) / 10);
    return `${min.toString().padStart(2, "0")}:${seg.toString().padStart(2, "0")}.${cent.toString().padStart(2, "0")}`;
  };

  const digitoValido = (key) => {
    if (!/^[0-9]$/.test(key)) return false;
    const n = parseInt(key);
    if (digitos === 10) return n >= 0 && n <= 9;
    return n >= 1 && n <= digitos;
  };

  const processarTecla = useCallback((key) => {
    if (key === "Backspace") {
      setInputAtual((prev) => {
        const novo = [...prev];
        if (novo[focusIndex] !== "") {
          novo[focusIndex] = "";
        } else if (focusIndex > 0) {
          novo[focusIndex - 1] = "";
        }
        return novo;
      });
      if (inputAtual[focusIndex] === "" && focusIndex > 0) {
        setFocusIndex((f) => f - 1);
      }
      return;
    }

    if (key === "ArrowLeft") {
      setFocusIndex((f) => Math.max(0, f - 1));
      return;
    }

    if (key === "ArrowRight") {
      setFocusIndex((f) => Math.min(tamanho - 1, f + 1));
      return;
    }

    if (digitoValido(key)) {
      setInputAtual((prev) => {
        const novo = [...prev];
        novo[focusIndex] = key;
        return novo;
      });
      setFocusIndex((f) => Math.min(f + 1, tamanho - 1));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tamanho, digitos, focusIndex, inputAtual]);

  const handleKeyDown = (e) => {
    if (fase !== "jogando") return;
    e.preventDefault();
    if (e.key === "Enter") {
      handleEnviarTentativa();
      return;
    }
    processarTecla(e.key);
  };

  const handleTeclaVirtual = (valor) => {
    processarTecla(valor);
    containerRef.current?.focus();
  };

  const todosPreenchidos = inputAtual.every((v) => v !== "");

  const handleEnviarTentativa = async () => {
    if (!todosPreenchidos || enviando) return;

    setEnviando(true);
    setErro("");

    try {
      const tentativaNum = inputAtual.map((v) => parseInt(v));
      const res = await api.post("/senha/treinos/tentativa", {
        treino_id: treinoId,
        tentativa: tentativaNum,
      });

      const novaTentativa = {
        tentativa: tentativaNum,
        corretos: res.data.corretos,
        parciais: res.data.parciais,
      };

      const novasTentativas = [...tentativas, novaTentativa];
      setTentativas(novasTentativas);
      setInputAtual(Array(tamanho).fill(""));

      if (res.data.acertou) {
        await finalizarTreino(novasTentativas);
      } else if (res.data.tentativasRestantes <= 0) {
        await finalizarTreino(novasTentativas);
      } else {
        setFocusIndex(0);
        setTimeout(() => containerRef.current?.focus(), 50);
      }
    } catch (error) {
      logError("TreinoSenha - tentativa", error);
      setErro(getErrorMessage(error));
    } finally {
      setEnviando(false);
    }
  };

  const finalizarTreino = async (tentativasFinais) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    try {
      const res = await api.post("/senha/treinos/finalizar", {
        treino_id: treinoId,
      });

      setResultado(res.data);
      setFase("resultado");

      salvarSessao({
        treinoId,
        tentativas: tentativasFinais,
        resultado: res.data,
      });
    } catch (error) {
      logError("TreinoSenha - finalizar", error);
      setErro(getErrorMessage(error));
    }
  };

  const handleRecomecar = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    inicializadoRef.current = false;
    setTreinoId(null);
    setTentativas([]);
    setInputAtual(Array(tamanho).fill(""));
    setErro("");
    setInicioTreino(null);
    setTempoDecorrido(0);
    setResultado(null);
    setFase("carregando");

    const iniciar = async () => {
      try {
        const res = await api.post("/senha/treinos/iniciar", {
          digitos: config.digitos,
          tamanho: config.tamanho,
          repeticao: config.repeticao,
        });
        setTreinoId(res.data.treino_id);
        setInputAtual(Array(config.tamanho).fill(""));
        setFase("contagem");
        salvarSessao({ treinoId: res.data.treino_id });
      } catch (error) {
        logError("TreinoSenha - recomeçar", error);
        setErro(getErrorMessage(error));
        setFase("erro");
      }
    };

    iniciar();
  };

  const handleGabarito = () => {
    navigate("/senha/gabarito", {
      state: {
        tentativas: resultado?.tentativas || tentativas,
        senhaSecreta: resultado?.senhaSecreta,
        acertou: resultado?.acertou,
        digitos,
        tamanho,
        repeticao,
      },
    });
  };

  const handleVoltar = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    const params = new URLSearchParams();
    if (config?.digitos != null) params.set("digitos", String(config.digitos));
    if (config?.tamanho != null) params.set("tamanho", String(config.tamanho));
    if (config?.repeticao != null) params.set("repeticao", String(config.repeticao));
    navigate(params.toString() ? `/senha?${params.toString()}` : "/senha");
  };

  if (!config) {
    return null;
  }

  if (fase === "carregando") {
    return (
      <div className="treino-senha-container">
        <Loading text="Preparando treino..." />
      </div>
    );
  }

  if (fase === "erro") {
    return (
      <div className="treino-senha-container">
        <ErrorMessage message={erro} type="error" />
        <button className="btn-voltar-senha" onClick={handleVoltar}>
          Voltar ao ranking
        </button>
      </div>
    );
  }

  if (fase === "contagem") {
    return (
      <div className="treino-senha-container">
        <ContagemRegressiva onTerminar={handleContagemTerminou} />
      </div>
    );
  }

  if (fase === "resultado") {
    return (
      <ResultadoTreino
        resultado={resultado}
        tipo="senha"
        onGabarito={handleGabarito}
        onRecomecar={handleRecomecar}
        onNovoTreino={handleVoltar}
      />
    );
  }

  const teclasVirtuais = (() => {
    const teclas = [];
    const inicio = digitos === 10 ? 0 : 1;
    const fim = digitos === 10 ? 9 : digitos;
    for (let i = inicio; i <= fim; i++) teclas.push(String(i));
    return teclas;
  })();

  const teclasLinhas = [];
  for (let i = 0; i < teclasVirtuais.length; i += 3) {
    teclasLinhas.push(teclasVirtuais.slice(i, i + 3));
  }

  return (
    <div
      className="treino-senha-container"
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="treino-senha-header">
        <div className="treino-senha-info">
          <span className="treino-senha-titulo">
            {digitos} dígitos · Tamanho {tamanho}
            {repeticao ? " · Com repetição" : ""}
          </span>
          <span className="treino-senha-tentativas">
            Tentativa {tentativas.length + 1} de {LIMITE_TENTATIVAS}
          </span>
        </div>
        <div className="treino-senha-cronometro">{formatarTempo(tempoDecorrido)}</div>
      </div>

      {erro && (
        <ErrorMessage
          message={erro}
          type="error"
          dismissible
          onDismiss={() => setErro("")}
        />
      )}

      <div className="treino-senha-lista">
        {tentativas.map((t, index) => (
          <div key={index} className="tentativa-linha">
            <span className="tentativa-numero">{index + 1}.</span>
            <div className="tentativa-digitos">
              {t.tentativa.map((d, i) => (
                <span key={i} className="tentativa-digito">
                  {d}
                </span>
              ))}
            </div>
            <div className="tentativa-feedback">
              {Array(t.corretos)
                .fill(null)
                .map((_, i) => (
                  <span key={`c${i}`} className="feedback-correto" title="Posição correta">
                    ●
                  </span>
                ))}
              {Array(t.parciais)
                .fill(null)
                .map((_, i) => (
                  <span key={`p${i}`} className="feedback-parcial" title="Dígito certo, posição errada">
                    ○
                  </span>
                ))}
            </div>
          </div>
        ))}

        <div key="input-row" className="tentativa-linha tentativa-input-linha">
          <span className="tentativa-numero">{tentativas.length + 1}.</span>
          <div className="treino-senha-celulas">
            {inputAtual.map((valor, index) => (
              <div
                key={`cel-${index}`}
                className={`treino-senha-celula${index === focusIndex ? " celula-ativa" : ""}`}
                onClick={() => setFocusIndex(index)}
              >
                {valor}
              </div>
            ))}
          </div>
          <button
            className="btn-confirmar-tentativa"
            onClick={handleEnviarTentativa}
            disabled={!todosPreenchidos || enviando}
          >
            {enviando ? "..." : "OK"}
          </button>
        </div>
        <div key="scroll-end" ref={tentativasEndRef} />
      </div>

      <div className="teclado-senha-container">
        <div className="teclado-senha">
          {teclasLinhas.map((linha, li) => (
            <div key={li} className="teclado-senha-linha">
              {linha.map((tecla) => (
                <button
                  key={tecla}
                  className="tecla-senha"
                  onClick={() => handleTeclaVirtual(tecla)}
                  disabled={enviando}
                  type="button"
                >
                  {tecla}
                </button>
              ))}
              {li === teclasLinhas.length - 1 && linha.length < 3 && (
                <button
                  className="tecla-senha tecla-senha-backspace"
                  onClick={() => handleTeclaVirtual("Backspace")}
                  disabled={enviando}
                  type="button"
                  aria-label="Apagar"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                    <line x1="18" y1="9" x2="12" y2="15" />
                    <line x1="12" y1="9" x2="18" y2="15" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          {teclasLinhas[teclasLinhas.length - 1]?.length === 3 && (
            <div className="teclado-senha-linha teclado-senha-linha-backspace">
              <button
                className="tecla-senha tecla-senha-backspace"
                onClick={() => handleTeclaVirtual("Backspace")}
                disabled={enviando}
                type="button"
                aria-label="Apagar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                  <line x1="18" y1="9" x2="12" y2="15" />
                  <line x1="12" y1="9" x2="18" y2="15" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TreinoSenha;
