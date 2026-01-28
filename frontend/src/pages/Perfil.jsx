import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../components/common/ErrorMessage";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import { getErrorMessage, logError } from "../utils/errorHandler";
import "./Perfil.css";

const Perfil = () => {
  const { usuario, atualizarUsuario } = useAuth();
  const navigate = useNavigate();
  const { showSuccess } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    nome: "",
    senha: "",
    operacao_id: "",
    limite_id: "",
    sistema_id: "",
    ranking_global: true,
  });
  const [operacoes, setOperacoes] = useState([]);
  const [limites, setLimites] = useState([]);
  const [sistemas, setSistemas] = useState([]);
  const [carregandoDados, setCarregandoDados] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (usuario) {
      setFormData({
        email: usuario.email || "",
        nome: usuario.nome || "",
        senha: "",
        operacao_id: usuario.operacao_id || "",
        limite_id: usuario.limite_id || "",
        sistema_id: usuario.sistema_id || "",
        ranking_global: usuario.ranking_global !== undefined ? usuario.ranking_global : true,
      });
    }
  }, [usuario]);

  useEffect(() => {
    const carregarOpcoes = async () => {
      if (!usuario || usuario.isVisitante) return;

      setCarregandoDados(true);
      try {
        const [operacoesRes, limitesRes, sistemasRes] = await Promise.all([
          api.get("/operacoes"),
          api.get("/limites"),
          api.get("/sistemas"),
        ]);

        setOperacoes(operacoesRes.data);
        setLimites(limitesRes.data);
        setSistemas(sistemasRes.data);
      } catch (error) {
        logError("Perfil - carregarOpcoes", error);
        setErro("Erro ao carregar opções");
      } finally {
        setCarregandoDados(false);
      }
    };

    carregarOpcoes();
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
        operacao_id: formData.operacao_id ? parseInt(formData.operacao_id) : null,
        limite_id: formData.limite_id ? parseInt(formData.limite_id) : null,
        sistema_id: formData.sistema_id ? parseInt(formData.sistema_id) : null,
        ranking_global: formData.ranking_global,
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

  const isVisitante = usuario?.isVisitante;

  return (
    <div className="perfil-container">
      <div className="perfil-card">
        <div className="titulo-com-ajuda">
          <h1>Meu perfil</h1>
          <button
            className="btn-ajuda"
            onClick={() => navigate("/instrucoes/perfil")}
            title="Ver instruções sobre perfil"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
        </div>

        {isVisitante && (
          <div className="mensagem-visitante">
            <p>Visitantes não podem editar o perfil. Faça login para personalizar suas informações.</p>
          </div>
        )}

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
              disabled={isVisitante}
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
              disabled={isVisitante}
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
              disabled={isVisitante}
            />
          </div>

          <div className="form-group">
            <label htmlFor="operacao_id">Operação favorita</label>
            <select
              id="operacao_id"
              name="operacao_id"
              value={formData.operacao_id}
              onChange={handleChange}
              disabled={isVisitante || carregandoDados}
            >
              <option value="">Nenhuma</option>
              {operacoes.map((operacao) => (
                <option key={operacao.id} value={operacao.id}>
                  {operacao.tipo}: {operacao.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="limite_id">Limite favorito</label>
            <select
              id="limite_id"
              name="limite_id"
              value={formData.limite_id}
              onChange={handleChange}
              disabled={isVisitante || carregandoDados}
            >
              <option value="">Nenhum</option>
              {limites.map((limite) => (
                <option key={limite.id} value={limite.id}>
                  {limite.descricao}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sistema_id">Sistema favorito</label>
            <select
              id="sistema_id"
              name="sistema_id"
              value={formData.sistema_id}
              onChange={handleChange}
              disabled={isVisitante || carregandoDados}
            >
              <option value="">Nenhum</option>
              {sistemas.map((sistema) => (
                <option key={sistema.id} value={sistema.id}>
                  {sistema.descricao || sistema.tipo}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="ranking_global" className="checkbox-label">
              <input
                type="checkbox"
                id="ranking_global"
                name="ranking_global"
                checked={formData.ranking_global}
                onChange={handleChange}
                disabled={isVisitante}
              />
              <span>Mostrar meu nome nos rankings globais</span>
            </label>
          </div>

          {erro && (
            <ErrorMessage
              message={erro}
              type="error"
              dismissible
              onDismiss={() => setErro("")}
            />
          )}

          <button
            type="submit"
            disabled={carregando || isVisitante}
            className="btn-salvar"
          >
            {carregando ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Perfil;
