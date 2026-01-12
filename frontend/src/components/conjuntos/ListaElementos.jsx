import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./ListaElementos.css";

const ListaElementos = ({
  elementos,
  meuTipo,
  onTornarAdmin,
  onRemover,
  onReenviarConvite,
  loading = false,
}) => {
  const { usuario } = useAuth();
  if (loading) {
    return <div className="loading">Carregando elementos...</div>;
  }

  if (elementos.length === 0) {
    return (
      <div className="sem-elementos">
        <p>Nenhum elemento encontrado neste conjunto.</p>
      </div>
    );
  }

  const podeGerenciar = meuTipo === "dono" || meuTipo === "admin";
  const mostrarStatus = meuTipo !== "comum"; // Não mostrar status para usuários comuns

  return (
    <div className="lista-elementos">
      {/* Versão desktop (tabela) */}
      <div className="lista-elementos-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Nível</th>
              <th>Tipo</th>
              {mostrarStatus && <th>Status</th>}
              {podeGerenciar && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {elementos.map((elemento) => {
              const eUsuarioLogado = usuario && elemento.id === usuario.id;
              return (
              <tr key={elemento.id}>
                <td>
                  {eUsuarioLogado ? (
                    <Link 
                      to="/recordes"
                      className="nome-elemento-link"
                    >
                      {elemento.nome}
                    </Link>
                  ) : (
                    <Link 
                      to={`/recordes?usuario_id=${elemento.id}`}
                      className="nome-elemento-link"
                    >
                      {elemento.nome}
                    </Link>
                  )}
                </td>
                <td>{elemento.plano?.nome || "-"}</td>
                <td>
                  {elemento.tipo === "dono" && (
                    <span className="badge badge-dono">Dono</span>
                  )}
                  {elemento.tipo === "admin" && (
                    <span className="badge badge-admin">Admin</span>
                  )}
                  {elemento.tipo === "comum" && (
                    <span className="badge badge-comum">Comum</span>
                  )}
                </td>
                {mostrarStatus && (
                  <td>
                    {elemento.status === "aceito" && (
                      <span className="status status-aceito">Aceito</span>
                    )}
                    {elemento.status === "pendente" && (
                      <span className="status status-pendente">Pendente</span>
                    )}
                    {elemento.status === "rejeitado" && (
                      <span className="status status-rejeitado">Rejeitado</span>
                    )}
                    {!elemento.status && (
                      <span className="status status-desconhecido">-</span>
                    )}
                  </td>
                )}
                {podeGerenciar && (
                  <td>
                    <div className="acoes-elemento">
                      {meuTipo === "dono" &&
                        elemento.tipo === "comum" &&
                        elemento.status === "aceito" && (
                          <button
                            className="btn-tornar-admin"
                            onClick={() => onTornarAdmin(elemento.id)}
                            title="Tornar admin"
                          >
                            Tornar admin
                          </button>
                        )}
                      {elemento.status === "rejeitado" && (
                        <button
                          className="btn-reenviar"
                          onClick={() => onReenviarConvite(elemento.id)}
                          title="Reenviar convite"
                        >
                          Reenviar convite
                        </button>
                      )}
                      {elemento.tipo !== "dono" && elemento.status === "aceito" && (
                        <button
                          className="btn-remover"
                          onClick={() => onRemover(elemento.id)}
                          title="Remover elemento"
                        >
                          Remover
                        </button>
                      )}
                      {elemento.tipo === "dono" && (
                        <span className="texto-info">Dono do conjunto</span>
                      )}
                    </div>
                  </td>
                )}
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Versão mobile (cards) */}
      <div className="lista-elementos-mobile">
        {elementos.map((elemento) => {
          const eUsuarioLogado = usuario && elemento.id === usuario.id;
          return (
            <div key={elemento.id} className="card-elemento-mobile">
              <div className="card-elemento-header-mobile">
                <div className="card-elemento-nome-mobile">
                  {eUsuarioLogado ? (
                    <Link 
                      to="/recordes"
                      className="nome-elemento-link-mobile"
                    >
                      {elemento.nome}
                    </Link>
                  ) : (
                    <Link 
                      to={`/recordes?usuario_id=${elemento.id}`}
                      className="nome-elemento-link-mobile"
                    >
                      {elemento.nome}
                    </Link>
                  )}
                </div>
                <div className="card-elemento-badges-mobile">
                  {elemento.tipo === "dono" && (
                    <span className="badge badge-dono">Dono</span>
                  )}
                  {elemento.tipo === "admin" && (
                    <span className="badge badge-admin">Admin</span>
                  )}
                  {elemento.tipo === "comum" && (
                    <span className="badge badge-comum">Comum</span>
                  )}
                  {mostrarStatus && elemento.status === "aceito" && (
                    <span className="status status-aceito">Aceito</span>
                  )}
                  {mostrarStatus && elemento.status === "pendente" && (
                    <span className="status status-pendente">Pendente</span>
                  )}
                  {mostrarStatus && elemento.status === "rejeitado" && (
                    <span className="status status-rejeitado">Rejeitado</span>
                  )}
                </div>
              </div>
              <div className="card-elemento-email-mobile">
                {elemento.plano?.nome || "-"}
              </div>
              {podeGerenciar && (
                <div className="card-elemento-acoes-mobile">
                  {meuTipo === "dono" &&
                    elemento.tipo === "comum" &&
                    elemento.status === "aceito" && (
                      <button
                        className="btn-tornar-admin btn-tornar-admin-mobile"
                        onClick={() => onTornarAdmin(elemento.id)}
                        title="Tornar admin"
                      >
                        Tornar admin
                      </button>
                    )}
                  {elemento.status === "rejeitado" && (
                    <button
                      className="btn-reenviar btn-reenviar-mobile"
                      onClick={() => onReenviarConvite(elemento.id)}
                      title="Reenviar convite"
                    >
                      Reenviar convite
                    </button>
                  )}
                  {elemento.tipo !== "dono" && elemento.status === "aceito" && (
                    <button
                      className="btn-remover btn-remover-mobile"
                      onClick={() => onRemover(elemento.id)}
                      title="Remover elemento"
                    >
                      Remover
                    </button>
                  )}
                  {elemento.tipo === "dono" && (
                    <span className="texto-info texto-info-mobile">Dono do conjunto</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListaElementos;

