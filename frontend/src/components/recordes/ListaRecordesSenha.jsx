import React from "react";
import Loading from "../common/Loading";
import CardRecordeSenha from "./CardRecordeSenha";
import "./ListaRecordes.css";

const ListaRecordesSenha = ({
  recordes,
  loading,
  usuarioIdVisualizado = null,
  isVisitante = false,
}) => {
  if (loading) {
    return <Loading text="Carregando recordes..." />;
  }

  if (!recordes || recordes.length === 0) {
    return (
      <div className="lista-recordes-vazia">
        <p>Nenhum recorde encontrado</p>
        <span className="lista-recordes-vazia-descricao">
          {isVisitante
            ? "Visitantes não têm recordes salvos. Faça login para salvar seus recordes permanentemente!"
            : "Complete treinos de senha para começar a registrar seus recordes!"}
        </span>
      </div>
    );
  }

  const recordesOrdenados = [...recordes].sort((a, b) => {
    if (a.digitos !== b.digitos) return a.digitos - b.digitos;
    if (a.tamanho !== b.tamanho) return a.tamanho - b.tamanho;
    return a.repeticao - b.repeticao;
  });

  return (
    <div className="cards-recordes">
      {recordesOrdenados.map((recorde) => (
        <CardRecordeSenha
          key={recorde.id}
          recorde={recorde}
          usuarioIdVisualizado={usuarioIdVisualizado}
        />
      ))}
    </div>
  );
};

export default ListaRecordesSenha;
