import React from "react";
import CardRecorde from "./CardRecorde";
import Loading from "../common/Loading";
import "./ListaRecordes.css";

const ListaRecordes = ({ recordes, loading, usuarioIdVisualizado = null }) => {
  if (loading) {
    return <Loading text="Carregando recordes..." />;
  }

  if (!recordes || recordes.length === 0) {
    return (
      <div className="lista-recordes-vazia">
        <p>Nenhum recorde encontrado</p>
        <span className="lista-recordes-vazia-descricao">
          Complete treinos para começar a registrar seus recordes!
        </span>
      </div>
    );
  }

  // Ordenar recordes: primeiro por operação (ordem), depois por limite, depois por sistema
  const recordesOrdenados = [...recordes].sort((a, b) => {
    // Ordenar por operação (usando campo ordem)
    const ordemA = a.operacao?.ordem ?? 999999;
    const ordemB = b.operacao?.ordem ?? 999999;
    if (ordemA !== ordemB) {
      return ordemA - ordemB;
    }

    // Se mesma operação, ordenar por limite (tempo)
    const tempoA = a.limite?.tempo || 0;
    const tempoB = b.limite?.tempo || 0;
    if (tempoA !== tempoB) {
      return tempoA - tempoB;
    }

    // Se mesmo limite, ordenar por sistema (tipo)
    const sistemaA = a.sistema?.tipo || "";
    const sistemaB = b.sistema?.tipo || "";
    return sistemaA.localeCompare(sistemaB, "pt-BR");
  });

  return (
    <div className="cards-recordes">
      {recordesOrdenados.map((recorde) => (
        <CardRecorde 
          key={recorde.id} 
          recorde={recorde} 
          usuarioIdVisualizado={usuarioIdVisualizado}
        />
      ))}
    </div>
  );
};

export default ListaRecordes;
