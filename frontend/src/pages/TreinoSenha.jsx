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
  const [inputFocado, setInputFocado] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [inicioTreino, setInicioTreino] = useState(null);
  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  const [resultado, setResultado] = useState(null);

  const hiddenInputRef = useRef(null);
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
      setTimeout(() => hiddenInputRef.current?.focus(), 100);
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

  const handleTecla = (e) => {
    if (e.key === "Enter") {
      handleEnviarTentativa();
      return;
    }

    if (e.key === "Backspace") {
      e.preventDefault();
      setInputAtual((prev) => {
        const novo = [...prev];
        if (novo[focusIndex] !== "") {
          novo[focusIndex] = "";
        } else if (focusIndex > 0) {
          novo[focusIndex - 1] = "";
          setFocusIndex((f) => f - 1);
        }
        return novo;
      });
      return;
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setFocusIndex((f) => Math.max(0, f - 1));
      return;
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      setFocusIndex((f) => Math.min(tamanho - 1, f + 1));
      return;
    }

    if (digitoValido(e.key)) {
      e.preventDefault();
      setInputAtual((prev) => {
        const novo = [...prev];
        novo[focusIndex] = e.key;
        return novo;
      });
      setFocusIndex((f) => Math.min(f + 1, tamanho - 1));
    }
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
        setTimeout(() => hiddenInputRef.current?.focus(), 50);
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
    navigate("/senha");
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

  return (
    <div className="treino-senha-container">
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

        <div
          key="input-row"
          className="tentativa-linha tentativa-input-linha"
          onClick={() => hiddenInputRef.current?.focus()}
        >
          <span className="tentativa-numero">{tentativas.length + 1}.</span>
          <div className="treino-senha-celulas">
            {inputAtual.map((valor, index) => (
              <div
                key={`cel-${index}`}
                className={`treino-senha-celula${index === focusIndex && inputFocado ? " celula-ativa" : ""}`}
                onClick={(e) => { e.stopPropagation(); setFocusIndex(index); hiddenInputRef.current?.focus(); }}
              >
                {valor}
              </div>
            ))}
          </div>
          <input
            ref={hiddenInputRef}
            type="text"
            className="treino-senha-input-oculto"
            value=""
            onChange={() => {}}
            onKeyDown={handleTecla}
            onFocus={() => setInputFocado(true)}
            onBlur={() => setInputFocado(false)}
            readOnly={false}
            aria-hidden="true"
          />
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
    </div>
  );
};

export default TreinoSenha;
