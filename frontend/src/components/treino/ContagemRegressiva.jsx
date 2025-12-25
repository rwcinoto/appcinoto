import React, { useEffect, useState } from "react";
import "./ContagemRegressiva.css";

const ContagemRegressiva = ({ onTerminar }) => {
  const [numero, setNumero] = useState(3);
  const [visivel, setVisivel] = useState(true);

  useEffect(() => {
    if (numero <= 0) {
      // Aguardar um pouco antes de chamar o callback e desaparecer
      const timer = setTimeout(() => {
        setVisivel(false);
        if (onTerminar) {
          onTerminar();
        }
      }, 300);
      return () => clearTimeout(timer);
    }

    // Atualizar número a cada segundo
    const timer = setTimeout(() => {
      setNumero((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [numero, onTerminar]);

  if (!visivel) {
    return null;
  }

  return (
    <div className="contagem-regressiva-overlay">
      <div className="contagem-regressiva-container">
        <div className={`contagem-regressiva-numero numero-${numero}`}>
          {numero > 0 ? numero : "Começar!"}
        </div>
      </div>
    </div>
  );
};

export default ContagemRegressiva;
