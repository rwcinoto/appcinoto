import React from "react";
import "./Loading.css";

/**
 * Componente de Loading reutilizável
 * 
 * @param {string} text - Texto opcional a ser exibido abaixo do spinner
 * @param {string} size - Tamanho do spinner: "small", "medium" ou "large" (padrão: "medium")
 * @param {boolean} fullScreen - Se true, ocupa toda a tela com overlay (padrão: false)
 * @param {string} className - Classes CSS adicionais
 */
const Loading = ({ text, size = "medium", fullScreen = false, className = "" }) => {
  const sizeClass = `loading-${size}`;
  const fullScreenClass = fullScreen ? "loading-fullscreen" : "";

  return (
    <div className={`loading-container ${fullScreenClass} ${className}`}>
      <div className={`loading-spinner ${sizeClass}`}>
        <div className="spinner-ring"></div>
      </div>
      {text && <p className={`loading-text ${sizeClass}`}>{text}</p>}
    </div>
  );
};

export default Loading;

