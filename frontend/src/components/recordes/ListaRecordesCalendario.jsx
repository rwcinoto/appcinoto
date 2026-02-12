import React from "react";
import Loading from "../common/Loading";
import CardRecordeCalendario from "./CardRecordeCalendario";
import "./ListaRecordes.css";

const ORDEM_TIPOS = [
  "data_geral",
  "dia",
  "mes",
  "ano",
  "seculo",
  "data_esse_ano",
  "data_21",
];

const ListaRecordesCalendario = ({
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
            : "Complete treinos de calendário para começar a registrar seus recordes!"}
        </span>
      </div>
    );
  }

  const recordesOrdenados = [...recordes].sort((a, b) => {
    const indiceTipoA = ORDEM_TIPOS.indexOf(a.tipo);
    const indiceTipoB = ORDEM_TIPOS.indexOf(b.tipo);
    const ordemTipoA = indiceTipoA === -1 ? ORDEM_TIPOS.length : indiceTipoA;
    const ordemTipoB = indiceTipoB === -1 ? ORDEM_TIPOS.length : indiceTipoB;

    if (ordemTipoA !== ordemTipoB) {
      return ordemTipoA - ordemTipoB;
    }

    const tempoA = a.limite?.tempo || 0;
    const tempoB = b.limite?.tempo || 0;
    return tempoA - tempoB;
  });

  return (
    <div className="cards-recordes">
      {recordesOrdenados.map((recorde) => (
        <CardRecordeCalendario
          key={recorde.id}
          recorde={recorde}
          usuarioIdVisualizado={usuarioIdVisualizado}
        />
      ))}
    </div>
  );
};

export default ListaRecordesCalendario;
