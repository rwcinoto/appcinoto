import React, { useEffect, useState } from "react";
import "./FormUsuario.css";

const FormUsuario = ({ usuario, planos, onSalvar, onCancelar, disabled = false, tipoUsuarioLogado }) => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    tipo: "comum",
    id_plano: "",
    data_vencimento_plano: "",
    ativo: true,
  });
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (usuario) {
      // Formatar data de vencimento para input date (YYYY-MM-DD)
      // Usar apenas a parte da data para evitar problemas de timezone
      let dataVencimentoFormatada = "";
      if (usuario.data_vencimento_plano) {
        // Se a data vier como string, extrair apenas YYYY-MM-DD
        const dataStr = usuario.data_vencimento_plano.toString();
        if (dataStr.includes("T")) {
          dataVencimentoFormatada = dataStr.split("T")[0];
        } else {
          // Se já vier só a data, usar diretamente
          dataVencimentoFormatada = dataStr.substring(0, 10);
        }
      }

      setFormData({
        nome: usuario.nome || "",
        email: usuario.email || "",
        senha: "",
        tipo: usuario.tipo || "comum",
        id_plano: tipoUsuarioLogado === "profe" ? "2" : (usuario.id_plano?.toString() || ""),
        data_vencimento_plano: dataVencimentoFormatada,
        ativo: usuario.ativo !== undefined ? usuario.ativo : true,
      });
    } else if (planos.length > 0) {
      // Se for criação e há planos
      // Se for profe, sempre usar tipo "comum" e plano id=2
      setFormData((prev) => ({
        ...prev,
        tipo: tipoUsuarioLogado === "profe" ? "comum" : prev.tipo,
        id_plano: tipoUsuarioLogado === "profe" ? "2" : planos[0].id.toString(),
      }));
    }
  }, [usuario, planos, tipoUsuarioLogado]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErro("");
  };

  const validarFormulario = () => {
    if (!formData.nome || formData.nome.trim().length < 3) {
      setErro("Nome deve ter no mínimo 3 caracteres");
      return false;
    }

    if (!formData.email || !formData.email.includes("@")) {
      setErro("Email inválido");
      return false;
    }

    if (!usuario && !formData.senha) {
      setErro("Senha é obrigatória para novos usuários");
      return false;
    }

    if (formData.senha && formData.senha.length < 6) {
      setErro("Senha deve ter no mínimo 6 caracteres");
      return false;
    }

    if (!formData.id_plano) {
      setErro("Plano é obrigatório");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validarFormulario()) {
      return;
    }

    const dados = {
      nome: formData.nome.trim(),
      email: formData.email.trim(),
      tipo: tipoUsuarioLogado === "profe" ? "comum" : formData.tipo,
      id_plano: tipoUsuarioLogado === "profe" ? 2 : parseInt(formData.id_plano),
      ativo: formData.ativo,
    };

    if (formData.senha) {
      dados.senha = formData.senha;
    }

    // Adicionar data_vencimento_plano apenas se for admin
    if (tipoUsuarioLogado === "admin") {
      // Se estiver editando e o campo estiver vazio, enviar null para limpar
      // Se estiver criando e o campo estiver vazio, não enviar nada
      if (usuario) {
        // Editando: sempre enviar (null se vazio, ou a data se preenchida)
        dados.data_vencimento_plano = formData.data_vencimento_plano || null;
      } else if (formData.data_vencimento_plano) {
        // Criando: só enviar se tiver valor
        dados.data_vencimento_plano = formData.data_vencimento_plano;
      }
    }

    onSalvar(dados);
  };

  return (
    <form onSubmit={handleSubmit} className="form-usuario">
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
        />
      </div>

      <div className="form-group">
        <label htmlFor="senha">
          Senha {usuario ? "(opcional)" : ""}
        </label>
        <input
          type="password"
          id="senha"
          name="senha"
          value={formData.senha}
          onChange={handleChange}
          minLength={6}
          placeholder={usuario ? "Deixe em branco para manter" : ""}
        />
      </div>

      {tipoUsuarioLogado !== "profe" && (
        <div className="form-group">
          <label htmlFor="tipo">Tipo</label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            required
          >
            <option value="comum">Comum</option>
            <option value="profe">Professor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      )}

      {tipoUsuarioLogado !== "profe" && (
        <div className="form-group">
          <label htmlFor="id_plano">Plano</label>
          <select
            id="id_plano"
            name="id_plano"
            value={formData.id_plano}
            onChange={handleChange}
            required
          >
            <option value="">Selecione um plano</option>
            {planos.map((plano) => (
              <option key={plano.id} value={plano.id}>
                {plano.nome}
              </option>
            ))}
          </select>
        </div>
      )}

      {tipoUsuarioLogado === "admin" && (
        <div className="form-group">
          <label htmlFor="data_vencimento_plano">Data de vencimento do plano</label>
          <input
            type="date"
            id="data_vencimento_plano"
            name="data_vencimento_plano"
            value={formData.data_vencimento_plano}
            onChange={handleChange}
            placeholder="Deixe em branco se o plano não vence"
          />
          <small style={{ display: "block", marginTop: "5px", color: "#666" }}>
            Deixe em branco se o plano não vence. Se preenchido e a data passar, o usuário será automaticamente rebaixado para o plano natural.
          </small>
        </div>
      )}

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="ativo"
            checked={formData.ativo}
            onChange={handleChange}
          />
          Usuário ativo
        </label>
      </div>

      {erro && <div className="erro">{erro}</div>}

      <div className="form-actions">
        <button type="button" onClick={onCancelar} className="btn-cancelar" disabled={disabled}>
          Cancelar
        </button>
        <button type="submit" className="btn-salvar" disabled={disabled}>
          {usuario ? "Atualizar" : "Criar"}
        </button>
      </div>
    </form>
  );
};

export default FormUsuario;

