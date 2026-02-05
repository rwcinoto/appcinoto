import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./ListaUsuarios.css";

const formatarDataUltimoTreino = (valor) => {
  if (!valor) return "-";
  const s = String(valor).split("T")[0];
  const [y, m, d] = s.split("-");
  return y && m && d ? `${d}/${m}/${y}` : "-";
};

const ListaUsuarios = ({
  usuarios,
  onEditar,
  onDesativar,
  tipoUsuarioLogado,
}) => {
  const { usuario: usuarioLogado } = useAuth();

  if (usuarios.length === 0) {
    return <div className="sem-usuarios">Nenhum usuário encontrado</div>;
  }

  const renderUsuarioCard = (usuario) => {
    const eUsuarioLogado =
      usuarioLogado && usuario.id === usuarioLogado.id;

    return (
      <div key={usuario.id} className="usuario-card">
        <div className="usuario-card-header">
          <div className="usuario-card-nome">
            {eUsuarioLogado ? (
              <Link to="/recordes" className="nome-usuario-link">
                {usuario.nome}
              </Link>
            ) : (
              <Link
                to={`/recordes?usuario_id=${usuario.id}`}
                className="nome-usuario-link"
              >
                {usuario.nome}
              </Link>
            )}
          </div>
          <div className="usuario-card-acoes">
            <button
              className="btn-editar"
              onClick={() => onEditar(usuario)}
              title="Editar"
            >
              ✏️ Editar
            </button>
            {usuario.ativo ? (
              <button
                className="btn-desativar"
                onClick={() => onDesativar(usuario.id)}
                title="Desativar"
              >
                🚫 Desativar
              </button>
            ) : (
              <span className="texto-inativo">Desativado</span>
            )}
          </div>
        </div>
        <div className="usuario-card-body">
          <div className="usuario-card-item">
            <span className="usuario-card-label">Email</span>
            <span className="usuario-card-valor">{usuario.email}</span>
          </div>
          {tipoUsuarioLogado === "admin" && (
            <div className="usuario-card-item">
              <span className="usuario-card-label">Tipo</span>
              <span className={`badge badge-${usuario.tipo}`}>
                {usuario.tipo === "admin"
                  ? "Admin"
                  : usuario.tipo === "profe"
                    ? "Professor"
                    : "Comum"}
              </span>
            </div>
          )}
          {tipoUsuarioLogado === "admin" && (
            <div className="usuario-card-item">
              <span className="usuario-card-label">Criado por</span>
              <span className="usuario-card-valor">{usuario.criador?.nome || "-"}</span>
            </div>
          )}
          <div className="usuario-card-item">
            <span className="usuario-card-label">Nível</span>
            <span className="usuario-card-valor">{usuario.plano?.nome || "-"}</span>
          </div>
          <div className="usuario-card-item">
            <span className="usuario-card-label">Último treino</span>
            <span className="usuario-card-valor">{formatarDataUltimoTreino(usuario.data_ultimo_treino)}</span>
          </div>
          <div className="usuario-card-item">
            <span className="usuario-card-label">Status</span>
            <span
              className={`status status-${
                usuario.ativo ? "ativo" : "inativo"
              }`}
            >
              {usuario.ativo ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="lista-usuarios">
      <div className="lista-usuarios-table">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th className="col-email">Email</th>
              {tipoUsuarioLogado === "admin" && <th>Tipo</th>}
              {tipoUsuarioLogado === "admin" && <th>Criado por</th>}
              <th>Nível</th>
              <th>Último treino</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => {
              const eUsuarioLogado =
                usuarioLogado && usuario.id === usuarioLogado.id;

              return (
                <tr key={usuario.id}>
                  <td>
                    {eUsuarioLogado ? (
                      <Link to="/recordes" className="nome-usuario-link">
                        {usuario.nome}
                      </Link>
                    ) : (
                      <Link
                        to={`/recordes?usuario_id=${usuario.id}`}
                        className="nome-usuario-link"
                      >
                        {usuario.nome}
                      </Link>
                    )}
                  </td>
                  <td className="col-email">{usuario.email}</td>
                  {tipoUsuarioLogado === "admin" && (
                    <td>
                      <span className={`badge badge-${usuario.tipo}`}>
                        {usuario.tipo === "admin"
                          ? "Admin"
                          : usuario.tipo === "profe"
                            ? "Professor"
                            : "Comum"}
                      </span>
                    </td>
                  )}
                  {tipoUsuarioLogado === "admin" && (
                    <td>{usuario.criador?.nome || "-"}</td>
                  )}
                  <td>{usuario.plano?.nome || "-"}</td>
                  <td>{formatarDataUltimoTreino(usuario.data_ultimo_treino)}</td>
                  <td>
                    <span
                      className={`status status-${
                        usuario.ativo ? "ativo" : "inativo"
                      }`}
                    >
                      {usuario.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td>
                    <div className="acoes">
                      <button
                        className="btn-editar"
                        onClick={() => onEditar(usuario)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      {usuario.ativo ? (
                        <button
                          className="btn-desativar"
                          onClick={() => onDesativar(usuario.id)}
                          title="Desativar"
                        >
                          🚫
                        </button>
                      ) : (
                        <span className="texto-inativo">Desativado</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="lista-usuarios-cards">
        {usuarios.map(renderUsuarioCard)}
      </div>
    </div>
  );
};

export default ListaUsuarios;
