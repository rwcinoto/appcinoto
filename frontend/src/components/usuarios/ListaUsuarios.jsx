import React from "react";
import "./ListaUsuarios.css";

const ListaUsuarios = ({ usuarios, onEditar, onDesativar }) => {
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
            <th>Tipo</th>
            <th>Plano</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.nome}</td>
              <td>{usuario.email}</td>
              <td>
                <span className={`badge badge-${usuario.tipo}`}>
                  {usuario.tipo === "admin" ? "Admin" : "Comum"}
                </span>
              </td>
              <td>{usuario.plano?.nome || "-"}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaUsuarios;
