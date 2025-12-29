import React, { useEffect } from "react";
import { useNotifications } from "../../context/NotificationContext";
import "./ConvitesPendentes.css";

const ConvitesPendentes = ({ onConviteAceito }) => {
  const {
    convitesPendentes,
    loading,
    erro,
    aceitarConvite,
    rejeitarConvite,
    carregarConvitesPendentes,
  } = useNotifications();


  const handleAceitar = async (convite) => {
    try {
      await aceitarConvite(convite.id_conjunto, convite.id_usuario);
      if (onConviteAceito) {
        onConviteAceito();
      }
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao aceitar convite";
      alert(mensagemErro);
    }
  };

  const handleRejeitar = async (convite) => {
    try {
      await rejeitarConvite(convite.id_conjunto, convite.id_usuario);
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao rejeitar convite";
      alert(mensagemErro);
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return "-";
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
    } catch (error) {
      return dataString;
    }
  };

  if (loading) {
    return <div className="loading">Carregando convites pendentes...</div>;
  }

  // Se houver erro, mostrar mensagem de erro
  if (erro) {
    return <div className="mensagem-erro">{erro}</div>;
  }

  // Se não há convites, não mostrar nada (nem erro, nem mensagem)
  if (convitesPendentes.length === 0) {
    return null;
  }

  return (
    <>
      <div className="convites-header-interno">
        <span className="badge-contador">
          {convitesPendentes.length} convite
          {convitesPendentes.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="lista-convites">
        {convitesPendentes.map((convite) => (
          <div key={`${convite.id_conjunto}-${convite.id_usuario}`} className="convite-card">
            <div className="convite-info">
              <div className="convite-nome-conjunto">
                <span className="label-conjunto">Conjunto: </span>
                <span className="nome-conjunto">{convite.conjunto?.nome || "Conjunto"}</span>
              </div>
              {convite.quem_convidou && (
                <div className="convite-detalhe-item">
                  <span className="label">Convidado por: </span>
                  <span className="valor">
                    {convite.quem_convidou.nome || convite.quem_convidou.email || "Usuário"}
                  </span>
                </div>
              )}
              {convite.criado_em && (
                <div className="convite-detalhe-item">
                  <span className="label">Data: </span>
                  <span className="valor">{formatarData(convite.criado_em)}</span>
                </div>
              )}
            </div>
            <div className="convite-acoes">
              <button
                className="btn-aceitar"
                onClick={() => handleAceitar(convite)}
                title="Aceitar convite"
              >
                Aceitar
              </button>
              <button
                className="btn-rejeitar"
                onClick={() => handleRejeitar(convite)}
                title="Rejeitar convite"
              >
                Rejeitar
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ConvitesPendentes;

