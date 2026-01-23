import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../components/common/ErrorMessage";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import { getErrorMessage, logError } from "../utils/errorHandler";
import "./EsqueciSenha.css";

const EsqueciSenha = () => {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await api.post("/auth/solicitar-reset-senha", { email });
      setEnviado(true);
      showSuccess("Email enviado com sucesso!");
    } catch (error) {
      logError("EsqueciSenha - handleSubmit", error);
      setErro(getErrorMessage(error));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <img src="/logo-numix.svg" alt="numix" />
        </div>
        {!enviado ? (
          <>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
              Esqueci minha senha
            </h2>
            <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
              Digite seu email e enviaremos um link para redefinir sua senha.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={carregando}
                />
              </div>
              {erro && (
                <ErrorMessage
                  message={erro}
                  type="error"
                  dismissible
                  onDismiss={() => setErro("")}
                />
              )}
              <button type="submit" disabled={carregando}>
                {carregando ? "Enviando..." : "Enviar link"}
              </button>
            </form>
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button
                type="button"
                onClick={() => navigate("/login")}
                style={{
                  background: "transparent",
                  color: "#667eea",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "14px",
                }}
              >
                Voltar para login
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: "20px" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ margin: "0 auto" }}
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 style={{ marginBottom: "15px" }}>Email enviado!</h2>
            <p style={{ color: "#666", marginBottom: "25px" }}>
              Se o email existir em nosso sistema, você receberá um link para redefinir sua senha.
              Verifique sua caixa de entrada e spam.
            </p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{
                width: "100%",
                padding: "12px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Voltar para login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EsqueciSenha;
