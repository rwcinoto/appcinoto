import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ErrorMessage from "../components/common/ErrorMessage";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import { getErrorMessage, logError } from "../utils/errorHandler";
import "./ResetarSenha.css";

const ResetarSenha = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setErro("Token inválido ou ausente");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!token) {
      setErro("Token inválido ou ausente");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setCarregando(true);

    try {
      await api.post("/auth/resetar-senha", { token, senha });
      setSucesso(true);
      showSuccess("Senha redefinida com sucesso!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      logError("ResetarSenha - handleSubmit", error);
      setErro(getErrorMessage(error));
    } finally {
      setCarregando(false);
    }
  };

  if (!token) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-logo">
            <img src="/logo-numix.svg" alt="numix" />
          </div>
          <ErrorMessage message="Token inválido ou ausente" type="error" />
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
              marginTop: "20px",
            }}
          >
            Voltar para login
          </button>
        </div>
      </div>
    );
  }

  if (sucesso) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-logo">
            <img src="/logo-numix.svg" alt="numix" />
          </div>
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
            <h2 style={{ marginBottom: "15px" }}>Senha redefinida!</h2>
            <p style={{ color: "#666" }}>
              Sua senha foi redefinida com sucesso. Redirecionando para o login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <img src="/logo-numix.svg" alt="numix" />
        </div>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Redefinir senha
        </h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
          Digite sua nova senha abaixo.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="senha">Nova senha</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              disabled={carregando}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirmar nova senha</label>
            <input
              type="password"
              id="confirmarSenha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
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
            {carregando ? "Redefinindo..." : "Redefinir senha"}
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
      </div>
    </div>
  );
};

export default ResetarSenha;
