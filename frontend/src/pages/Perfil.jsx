import React, { useEffect, useState } from "react";
import ErrorMessage from "../components/common/ErrorMessage";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage, logError } from "../utils/errorHandler";
import api from "../services/api";
import "./Perfil.css";

const Perfil = () => {
  const { usuario, atualizarUsuario } = useAuth();
  const { showSuccess } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    nome: "",
    senha: "",
  });
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (usuario) {
      setFormData({
        email: usuario.email || "",
        nome: usuario.nome || "",
        senha: "",
      });
    }
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpar mensagens ao digitar
    setErro("");
  };

  const validarFormulario = () => {
    if (!formData.email || !formData.email.includes("@")) {
      setErro("Email inválido");
      return false;
    }

    if (!formData.nome || formData.nome.trim().length < 3) {
      setErro("Nome deve ter no mínimo 3 caracteres");
      return false;
    }

    if (formData.senha && formData.senha.length < 6) {
      setErro("Senha deve ter no mínimo 6 caracteres");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    if (!validarFormulario()) {
      setCarregando(false);
      return;
    }

    try {
      const dadosAtualizacao = {
        email: formData.email.trim(),
        nome: formData.nome.trim(),
      };

      // Só enviar senha se foi preenchida
      if (formData.senha) {
        dadosAtualizacao.senha = formData.senha;
      }

      await api.put(`/usuarios/${usuario.id}`, dadosAtualizacao);

      // Recarregar dados do usuário para atualizar o contexto
      await atualizarUsuario();

      showSuccess("Perfil atualizado com sucesso!");
      // Limpar campo de senha após sucesso
      setFormData((prev) => ({ ...prev, senha: "" }));
    } catch (error) {
      logError("Perfil - handleSubmit", error);
      setErro(getErrorMessage(error));
    } finally {
      setCarregando(false);
    }
  };

  if (!usuario) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="perfil-container">
      <div className="perfil-card">
        <h1>Meu perfil</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome">Nome</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              minLength={3}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">
              Nova senha <span className="opcional">(opcional)</span>
            </label>
            <input
              type="password"
              id="senha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              minLength={6}
              autoComplete="new-password"
              placeholder="Deixe em branco para manter a senha atual"
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

          <button type="submit" disabled={carregando} className="btn-salvar">
            {carregando ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Perfil;
