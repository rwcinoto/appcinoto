import React, { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import ListaUsuarios from "../components/usuarios/ListaUsuarios";
import ModalUsuario from "../components/usuarios/ModalUsuario";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Usuarios.css";

const Usuarios = () => {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    tipo: "",
    ativo: "",
    id_plano: "",
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

  const carregarPlanos = useCallback(async () => {
    try {
      const response = await api.get("/planos");
      setPlanos(response.data);
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
    }
  }, []);

  const carregarUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: paginacao.pagina.toString(),
        limit: paginacao.limite.toString(),
      });

      if (filtros.tipo) params.append("tipo", filtros.tipo);
      if (filtros.ativo !== "") params.append("ativo", filtros.ativo);
      if (filtros.id_plano) params.append("id_plano", filtros.id_plano);
      if (filtros.busca) params.append("busca", filtros.busca);

      const response = await api.get(`/usuarios?${params.toString()}`);
      setUsuarios(response.data.usuarios);
      setPaginacao((prev) => ({
        ...prev,
        total: response.data.paginacao.total,
        totalPaginas: response.data.paginacao.totalPaginas,
      }));
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  }, [paginacao.pagina, paginacao.limite, filtros]);

  useEffect(() => {
    if (usuario && usuario.tipo === "admin") {
      carregarPlanos();
      carregarUsuarios();
    }
  }, [usuario, carregarPlanos, carregarUsuarios]);

  // Redirecionar se não for admin
  if (!usuario || usuario.tipo !== "admin") {
    return <Navigate to="/novo-treino" />;
  }

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
    setPaginacao((prev) => ({ ...prev, pagina: 1 }));
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

        <div className="filtro-group">
          <label>Tipo</label>
          <select
            value={filtros.tipo}
            onChange={(e) => handleFiltroChange("tipo", e.target.value)}
          >
            <option value="">Todos</option>
            <option value="admin">Admin</option>
            <option value="comum">Comum</option>
          </select>
        </div>

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
          <label>Plano</label>
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
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <>
          <ListaUsuarios
            usuarios={usuarios}
            onEditar={handleEditarUsuario}
            onDesativar={handleDesativarUsuario}
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
        />
      )}
    </div>
  );
};

export default Usuarios;
