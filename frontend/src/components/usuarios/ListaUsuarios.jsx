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

const ListaUsuarios = ({ usuarios, onEditar, onDesativar, tipoUsuarioLogado }) => {
  const { usuario: usuarioLogado } = useAuth();

  if (usuarios.length === 0) {
    return <div className="sem-usuarios">Nenhum usuário encontrado</div>;
  }

  return (
    <div className="lista-usuarios">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            {tipoUsuarioLogado !== "profe" && <th>Tipo</th>}
            <th>Nível</th>
            <th>Último treino</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => {
            const eUsuarioLogado = usuarioLogado && usuario.id === usuarioLogado.id;

            return (
            <tr key={usuario.id}>
              <td>
                {eUsuarioLogado ? (
                  <Link
                    to="/recordes"
                    className="nome-usuario-link"
                  >
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
              <td>{usuario.email}</td>
              {tipoUsuarioLogado !== "profe" && (
                <td>
                  <span className={`badge badge-${usuario.tipo}`}>
                    {usuario.tipo === "admin" ? "Admin" : usuario.tipo === "profe" ? "Professor" : "Comum"}
                  </span>
                </td>
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
  );
};

export default ListaUsuarios;
