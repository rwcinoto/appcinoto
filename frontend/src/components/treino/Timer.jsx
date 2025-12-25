import React, { useEffect, useRef, useState } from "react";
import "./Timer.css";

const Timer = ({
  tempoLimite,
  inicioTreino,
  onTempoEsgotado,
  pausado = false,
}) => {
  const [tempoRestante, setTempoRestante] = useState(tempoLimite);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!inicioTreino || pausado) {
      // Se não houver início ou estiver pausado, apenas limpar o intervalo
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Calcular tempo restante baseado no tempo real decorrido
    const calcularTempoRestante = () => {
      const agora = Date.now();
      const tempoDecorrido = Math.floor((agora - inicioTreino) / 1000); // em segundos
      const restante = Math.max(0, tempoLimite - tempoDecorrido);

      if (restante <= 0) {
        // Tempo esgotado
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (onTempoEsgotado) {
          onTempoEsgotado();
        }
        return 0;
      }

      return restante;
    };

    // Atualizar imediatamente
    setTempoRestante(calcularTempoRestante());

    // Atualizar a cada segundo
    intervalRef.current = setInterval(() => {
      setTempoRestante(calcularTempoRestante());
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [tempoLimite, inicioTreino, pausado, onTempoEsgotado]);

  // Formatar tempo em MM:SS
  const formatarTempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos.toString().padStart(2, "0")}:${segundosRestantes
      .toString()
      .padStart(2, "0")}`;
  };

  // Calcular percentual do tempo restante
  const percentualRestante =
    tempoLimite > 0 ? (tempoRestante / tempoLimite) * 100 : 0;

  // Determinar classe CSS baseada no tempo restante
  const getClasseTempo = () => {
    const percentual = percentualRestante;
    if (percentual <= 10) return "tempo-critico";
    if (percentual <= 25) return "tempo-aviso";
    return "tempo-normal";
  };

  return (
    <div className={`timer-container ${getClasseTempo()}`}>
      <div className="timer-display">
        <div className="timer-tempo">{formatarTempo(tempoRestante)}</div>
        {pausado && <div className="timer-pausado">Pausado</div>}
      </div>
      <div className="timer-barra-progresso">
        <div
          className="timer-barra-preenchimento"
          style={{ width: `${percentualRestante}%` }}
        />
      </div>
    </div>
  );
};

export default Timer;
