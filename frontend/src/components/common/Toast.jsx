import React, { useEffect } from "react";
import "./Toast.css";

/**
 * Componente de Toast reutilizável
 * 
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo de toast: "success", "error" ou "info" (padrão: "info")
 * @param {number} duration - Duração em milissegundos antes de fechar (padrão: 5000)
 * @param {function} onClose - Callback chamado ao fechar o toast
 * @param {boolean} visible - Se o toast está visível
 */
const Toast = ({ message, type = "info", duration = 5000, onClose, visible = true }) => {
  useEffect(() => {
    if (!visible || !onClose) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration, onClose]);

  if (!visible || !message) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const roleMap = {
    success: "status",
    error: "alert",
    info: "status",
  };

  return (
    <div 
      className={`toast toast-${type}`} 
      onClick={handleClose}
      role={roleMap[type] || "status"}
      aria-live="polite"
    >
      <div className="toast-icon" aria-hidden="true">
        {type === "success" && <span className="icon-success">✓</span>}
        {type === "error" && <span className="icon-error">✕</span>}
        {type === "info" && <span className="icon-info">ℹ</span>}
      </div>
      <div className="toast-content">
        <p>{message}</p>
      </div>
      <button
        className="toast-close"
        onClick={handleClose}
        aria-label="Fechar notificação"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;

