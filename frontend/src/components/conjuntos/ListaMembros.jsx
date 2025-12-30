import React from "react";
import "./ListaMembros.css";

const ListaMembros = ({
  membros,
  meuTipo,
  onTornarAdmin,
  onRemover,
  onReenviarConvite,
  loading = false,
}) => {
  if (loading) {
    return <div className="loading">Carregando elementos...</div>;
  }

  if (membros.length === 0) {
    return (
      <div className="sem-membros">
        <p>Nenhum elemento encontrado neste conjunto.</p>
      </div>
    );
  }

  const podeGerenciar = meuTipo === "dono" || meuTipo === "admin";
  const mostrarStatus = meuTipo !== "comum"; // Não mostrar status para usuários comuns

  return (
    <div className="lista-membros">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Tipo</th>
            {mostrarStatus && <th>Status</th>}
            {podeGerenciar && <th>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {membros.map((membro) => (
            <tr key={membro.id}>
              <td>{membro.nome}</td>
              <td>{membro.email}</td>
              <td>
                {membro.tipo === "dono" && (
                  <span className="badge badge-dono">Dono</span>
                )}
                {membro.tipo === "admin" && (
                  <span className="badge badge-admin">Admin</span>
                )}
                {membro.tipo === "comum" && (
                  <span className="badge badge-comum">Comum</span>
                )}
              </td>
              {mostrarStatus && (
                <td>
                  {membro.status === "aceito" && (
                    <span className="status status-aceito">Aceito</span>
                  )}
                  {membro.status === "pendente" && (
                    <span className="status status-pendente">Pendente</span>
                  )}
                  {membro.status === "rejeitado" && (
                    <span className="status status-rejeitado">Rejeitado</span>
                  )}
                  {!membro.status && (
                    <span className="status status-desconhecido">-</span>
                  )}
                </td>
              )}
              {podeGerenciar && (
                <td>
                  <div className="acoes-membro">
                    {meuTipo === "dono" &&
                      membro.tipo === "comum" &&
                      membro.status === "aceito" && (
                        <button
                          className="btn-tornar-admin"
                          onClick={() => onTornarAdmin(membro.id)}
                          title="Tornar admin"
                        >
                          Tornar admin
                        </button>
                      )}
                    {membro.status === "rejeitado" && (
                      <button
                        className="btn-reenviar"
                        onClick={() => onReenviarConvite(membro.id)}
                        title="Reenviar convite"
                      >
                        Reenviar convite
                      </button>
                    )}
                    {membro.tipo !== "dono" && membro.status === "aceito" && (
                      <button
                        className="btn-remover"
                        onClick={() => onRemover(membro.id)}
                        title="Remover elemento"
                      >
                        Remover
                      </button>
                    )}
                    {membro.tipo === "dono" && (
                      <span className="texto-info">Dono do conjunto</span>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaMembros;

