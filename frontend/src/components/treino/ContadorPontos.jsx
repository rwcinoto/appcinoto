import React, { useEffect, useRef, useState } from "react";
import "./ContadorPontos.css";

const ContadorPontos = ({ totalAcertos = 0 }) => {
  const [pontos, setPontos] = useState(totalAcertos);
  const [animar, setAnimar] = useState(false);
  const prevPontosRef = useRef(totalAcertos);

  useEffect(() => {
    // Sempre atualizar pontos quando totalAcertos mudar
    // Se aumentou, animar
    const aumentou = totalAcertos > prevPontosRef.current;

    setPontos(totalAcertos);
    prevPontosRef.current = totalAcertos;

    if (aumentou) {
      setAnimar(true);
      // Remover classe de animação após animação completar
      const timer = setTimeout(() => {
        setAnimar(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [totalAcertos]);

  return (
    <div className="contador-pontos-container">
      <div className="contador-pontos-label">Acertos</div>
      <div className={`contador-pontos-valor ${animar ? "animar" : ""}`}>
        {pontos}
      </div>
    </div>
  );
};

export default ContadorPontos;
