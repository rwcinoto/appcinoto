import React, { useEffect, useState } from "react";
import "./TecladoVirtual.css";

const TecladoVirtual = ({ sistema, onNumeroPress, disabled = false }) => {
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se está em mobile
  useEffect(() => {
    const checkMobile = () => {
      // Considerar mobile se largura <= 768px
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleNumeroPress = (numero) => {
    if (!disabled && onNumeroPress) {
      onNumeroPress(numero);
    }
  };

  // Determinar quais números mostrar conforme o sistema
  const numeros =
    sistema === "binario" ? [0, 1] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Se não for mobile, não mostrar o teclado
  if (!isMobile) {
    return null;
  }

  // Para sistema romano, o teclado numérico não é útil
  // (usuário precisa digitar letras), então não mostrar
  if (sistema === "romano") {
    return null;
  }

  const isBinario = sistema === "binario";

  return (
    <div className="teclado-virtual-container">
      <div className={`teclado-virtual ${isBinario ? "teclado-binario" : ""}`}>
        {numeros.map((numero) => (
          <button
            key={numero}
            className="tecla-numero"
            onClick={() => handleNumeroPress(numero.toString())}
            disabled={disabled}
            type="button"
            aria-label={`Número ${numero}`}
          >
            {numero}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TecladoVirtual;
