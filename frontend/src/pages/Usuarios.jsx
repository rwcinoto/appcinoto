import React, { useCallback, useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import Loading from "../components/common/Loading";
import ListaUsuarios from "../components/usuarios/ListaUsuarios";
import ModalUsuario from "../components/usuarios/ModalUsuario";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { debounce } from "../utils/debounce";
import { logError } from "../utils/errorHandler";
import "./Usuarios.css";

const Usuarios = () => {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    tipo: "",
    ativo: "",
    id_plano: "",
    criado_por: "",
    busca: "",
  });
  const [filtrosDebounced, setFiltrosDebounced] = useState({
    tipo: "",
    ativo: "",
    id_plano: "",
    criado_por: "",
    busca: "",
  });
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    limite: 10,
    total: 0,
    totalPaginas: 0,
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [planos, setPlanos] = useState([]);
  const [criadores, setCriadores] = useState([]);

  // Debounce para busca
  const debouncedBusca = useRef(
    debounce((valor) => {
      setFiltrosDebounced((prev) => ({ ...prev, busca: valor }));
      setPaginacao((prev) => ({ ...prev, pagina: 1 }));
    }, 300),
  ).current;

  const carregarPlanos = useCallback(async () => {
    try {
      const response = await api.get("/planos");
      setPlanos(response.data);
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
    }
  }, []);

  const carregarCriadores = useCallback(async () => {
    if (usuario?.tipo !== "admin") return;

    try {
      const response = await api.get("/usuarios/criadores");
      setCriadores(response.data);
    } catch (error) {
      console.error("Erro ao carregar criadores:", error);
    }
  }, [usuario]);

  const carregarUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: paginacao.pagina.toString(),
        limit: paginacao.limite.toString(),
      });

      if (filtrosDebounced.tipo) params.append("tipo", filtrosDebounced.tipo);
      if (filtrosDebounced.ativo !== "")
        params.append("ativo", filtrosDebounced.ativo);
      if (filtrosDebounced.id_plano)
        params.append("id_plano", filtrosDebounced.id_plano);
      if (filtrosDebounced.criado_por)
        params.append("criado_por", filtrosDebounced.criado_por);
      if (filtrosDebounced.busca)
        params.append("busca", filtrosDebounced.busca);

      const response = await api.get(`/usuarios?${params.toString()}`);
      setUsuarios(response.data.usuarios);
      setPaginacao((prev) => ({
        ...prev,
        total: response.data.paginacao.total,
        totalPaginas: response.data.paginacao.totalPaginas,
      }));
    } catch (error) {
      logError("Usuarios - carregarUsuarios", error);
    } finally {
      setLoading(false);
    }
  }, [paginacao.pagina, paginacao.limite, filtrosDebounced]);

  useEffect(() => {
    if (usuario && (usuario.tipo === "admin" || usuario.tipo === "profe")) {
      carregarPlanos();
      carregarCriadores();
      carregarUsuarios();
    }
  }, [usuario, carregarPlanos, carregarCriadores, carregarUsuarios]);

  // Redirecionar se não for admin ou profe
  if (!usuario || (usuario.tipo !== "admin" && usuario.tipo !== "profe")) {
    return <Navigate to="/novo-treino" />;
  }

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));

    // Para busca, usar debounce; para outros filtros, aplicar imediatamente
    if (campo === "busca") {
      debouncedBusca(valor);
    } else {
      setFiltrosDebounced((prev) => ({ ...prev, [campo]: valor }));
      setPaginacao((prev) => ({ ...prev, pagina: 1 }));
    }
  };

  const handlePageChange = (novaPagina) => {
    setPaginacao((prev) => ({ ...prev, pagina: novaPagina }));
  };

  const handleCriarUsuario = () => {
    setUsuarioEditando(null);
    setModalAberto(true);
  };

  const handleEditarUsuario = (usuario) => {
    setUsuarioEditando(usuario);
    setModalAberto(true);
  };

  const handleDesativarUsuario = async (usuarioId) => {
    if (!window.confirm("Deseja realmente desativar este usuário?")) {
      return;
    }

    try {
      await api.delete(`/usuarios/${usuarioId}`);
      carregarUsuarios();
    } catch (error) {
      console.error("Erro ao desativar usuário:", error);
      alert("Erro ao desativar usuário");
    }
  };

  const handleModalFechar = () => {
    setModalAberto(false);
    setUsuarioEditando(null);
  };

  const handleUsuarioSalvo = () => {
    handleModalFechar();
    carregarUsuarios();
  };

  return (
    <div className="usuarios-container">
      <div className="usuarios-header">
        <h1>Usuários</h1>
        <button className="btn-criar" onClick={handleCriarUsuario}>
          + Criar usuário
        </button>
      </div>

      <div className="usuarios-filtros">
        <div className="filtro-group">
          <label>Busca</label>
          <input
            type="text"
            placeholder="Nome ou email..."
            value={filtros.busca}
            onChange={(e) => handleFiltroChange("busca", e.target.value)}
          />
        </div>

        {usuario.tipo === "admin" && (
          <div className="filtro-group">
            <label>Tipo</label>
            <select
              value={filtros.tipo}
              onChange={(e) => handleFiltroChange("tipo", e.target.value)}
            >
              <option value="">Todos</option>
              <option value="admin">Admin</option>
              <option value="profe">Professor</option>
              <option value="comum">Comum</option>
            </select>
          </div>
        )}

        <div className="filtro-group">
          <label>Status</label>
          <select
            value={filtros.ativo}
            onChange={(e) => handleFiltroChange("ativo", e.target.value)}
          >
            <option value="">Todos</option>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>

        <div className="filtro-group">
          <label>Nível</label>
          <select
            value={filtros.id_plano}
            onChange={(e) => handleFiltroChange("id_plano", e.target.value)}
          >
            <option value="">Todos</option>
            {planos.map((plano) => (
              <option key={plano.id} value={plano.id}>
                {plano.nome}
              </option>
            ))}
          </select>
        </div>

        {usuario.tipo === "admin" && (
          <div className="filtro-group">
            <label>Criado por</label>
            <select
              value={filtros.criado_por}
              onChange={(e) => handleFiltroChange("criado_por", e.target.value)}
            >
              <option value="">Todos</option>
              {criadores.map((criador) => (
                <option key={criador.id} value={criador.id}>
                  {criador.nome}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <Loading text="Carregando usuários..." />
      ) : (
        <>
          <ListaUsuarios
            usuarios={usuarios}
            onEditar={handleEditarUsuario}
            onDesativar={handleDesativarUsuario}
            tipoUsuarioLogado={usuario.tipo}
          />

          {paginacao.totalPaginas > 1 && (
            <div className="paginacao">
              <button
                disabled={paginacao.pagina === 1}
                onClick={() => handlePageChange(paginacao.pagina - 1)}
              >
                Anterior
              </button>
              <span>
                Página {paginacao.pagina} de {paginacao.totalPaginas}
              </span>
              <button
                disabled={paginacao.pagina === paginacao.totalPaginas}
                onClick={() => handlePageChange(paginacao.pagina + 1)}
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}

      {modalAberto && (
        <ModalUsuario
          usuario={usuarioEditando}
          planos={planos}
          onFechar={handleModalFechar}
          onSalvo={handleUsuarioSalvo}
          tipoUsuarioLogado={usuario.tipo}
        />
      )}
    </div>
  );
};

export default Usuarios;
