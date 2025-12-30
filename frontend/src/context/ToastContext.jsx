import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/common/Toast";
import "./ToastContext.css";

const ToastContext = createContext({});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  /**
   * Remove um toast
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Adiciona um novo toast
   * @param {string} message - Mensagem a ser exibida
   * @param {string} type - Tipo: "success", "error" ou "info"
   * @param {number} duration - Duração em ms (padrão: 5000)
   */
  const showToast = useCallback((message, type = "info", duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration, visible: true };

    setToasts((prev) => [...prev, newToast]);

    // Retornar função para fechar manualmente
    return () => {
      removeToast(id);
    };
  }, [removeToast]);

  /**
   * Atalhos para diferentes tipos de toast
   */
  const showSuccess = useCallback((message, duration) => {
    return showToast(message, "success", duration);
  }, [showToast]);

  const showError = useCallback((message, duration) => {
    return showToast(message, "error", duration);
  }, [showToast]);

  const showInfo = useCallback((message, duration) => {
    return showToast(message, "info", duration);
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showInfo,
      }}
    >
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            visible={toast.visible}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de ToastProvider");
  }
  return context;
};

