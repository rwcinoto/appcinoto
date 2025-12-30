import React from "react";
import "./ErrorMessage.css";

/**
 * Componente de ErrorMessage reutilizável
 * 
 * @param {string} message - Mensagem de erro/aviso/info a ser exibida
 * @param {string} type - Tipo de mensagem: "error", "warning" ou "info" (padrão: "error")
 * @param {boolean} dismissible - Se true, mostra botão para fechar (padrão: false)
 * @param {function} onDismiss - Callback chamado ao fechar a mensagem
 * @param {string} className - Classes CSS adicionais
 */
const ErrorMessage = ({ 
  message, 
  type = "error", 
  dismissible = false, 
  onDismiss,
  className = "" 
}) => {
  if (!message) return null;

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  const roleMap = {
    error: "alert",
    warning: "alert",
    info: "status",
  };

  return (
    <div 
      className={`error-message error-message-${type} ${className}`}
      role={roleMap[type] || "alert"}
      aria-live={type === "error" || type === "warning" ? "assertive" : "polite"}
    >
      <div className="error-message-icon" aria-hidden="true">
        {type === "error" && <span className="icon-error">⚠</span>}
        {type === "warning" && <span className="icon-warning">⚠</span>}
        {type === "info" && <span className="icon-info">ℹ</span>}
      </div>
      <div className="error-message-content">
        <p>{message}</p>
      </div>
      {dismissible && (
        <button 
          className="error-message-close" 
          onClick={handleDismiss}
          aria-label="Fechar mensagem"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;

