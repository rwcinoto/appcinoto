import React from "react";
import "./TecladoVirtual.css";

/**
 * Teclado virtual específico para treinos de calendário.
 *
 * - tipoResposta = "numeros": teclas 0–7 e sinal de menos
 * - tipoResposta = "texto": teclas seg, ter, qua, qui, sex, sáb, dom
 *
 * O componente envia eventos sintéticos no formato { key, isTrusted: true }
 * para ser tratado pelo mesmo handler usado em TecladoVirtual (handleTecladoVirtualKeyPress).
 */
const TecladoCalendario = ({
  tipoResposta = "numeros", // "numeros" | "texto"
  onKeyPress,
  disabled = false,
}) => {
  const getTeclas = () => {
    if (tipoResposta === "texto") {
      // Ordem dos dias: seg, ter, qua, qui, sex, sáb, dom
      return ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];
    }

    // Modo numérico (0–7 + sinal de menos)
    // 1=domingo, 2=segunda, …, 0 ou 7=sábado
    return ["1", "2", "3", "4", "5", "6", "7", "0", "-"];
  };

  const handleKeyClick = (valor) => {
    if (disabled) return;

    const evento = {
      key: valor,
      isTrusted: true,
    };

    if (onKeyPress) {
      onKeyPress(evento);
    }
  };

  const handleBackspace = () => {
    if (disabled) return;

    const evento = {
      key: "Backspace",
      isTrusted: true,
    };

    if (onKeyPress) {
      onKeyPress(evento);
    }
  };

  const teclas = getTeclas();

  if (tipoResposta === "texto") {
    // Layout em duas linhas para dias da semana
    const linha1 = teclas.slice(0, 4); // seg, ter, qua, qui
    const linha2 = teclas.slice(4); // sex, sáb, dom

    return (
      <div className="teclado-virtual-container">
        <div className="teclado-virtual">
          <div className="teclado-linha">
            {linha1.map((tecla) => (
              <button
                key={tecla}
                className="tecla-virtual"
                onClick={() => handleKeyClick(tecla)}
                disabled={disabled}
                type="button"
              >
                {tecla}
              </button>
            ))}
          </div>
          <div className="teclado-linha">
            {linha2.map((tecla) => (
              <button
                key={tecla}
                className="tecla-virtual"
                onClick={() => handleKeyClick(tecla)}
                disabled={disabled}
                type="button"
              >
                {tecla}
              </button>
            ))}
            <button
              className="tecla-virtual tecla-backspace"
              onClick={handleBackspace}
              disabled={disabled}
              type="button"
              aria-label="Apagar"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                <line x1="18" y1="9" x2="12" y2="15"></line>
                <line x1="12" y1="9" x2="18" y2="15"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Layout numérico simples para 0–7 e sinal de menos
  const linha1 = ["1", "2", "3"];
  const linha2 = ["4", "5", "6"];
  const linha3 = ["7", "0", "-"];

  return (
    <div className="teclado-virtual-container">
      <div className="teclado-virtual">
        <div className="teclado-linha">
          {linha1.map((tecla) => (
            <button
              key={tecla}
              className="tecla-virtual"
              onClick={() => handleKeyClick(tecla)}
              disabled={disabled}
              type="button"
            >
              {tecla}
            </button>
          ))}
        </div>
        <div className="teclado-linha">
          {linha2.map((tecla) => (
            <button
              key={tecla}
              className="tecla-virtual"
              onClick={() => handleKeyClick(tecla)}
              disabled={disabled}
              type="button"
            >
              {tecla}
            </button>
          ))}
          <button
            className="tecla-virtual tecla-backspace"
            onClick={handleBackspace}
            disabled={disabled}
            type="button"
            aria-label="Apagar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
              <line x1="18" y1="9" x2="12" y2="15"></line>
              <line x1="12" y1="9" x2="18" y2="15"></line>
            </svg>
          </button>
        </div>
        <div className="teclado-linha">
          {linha3.map((tecla) => (
            <button
              key={tecla}
              className="tecla-virtual"
              onClick={() => handleKeyClick(tecla)}
              disabled={disabled}
              type="button"
            >
              {tecla}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TecladoCalendario;

