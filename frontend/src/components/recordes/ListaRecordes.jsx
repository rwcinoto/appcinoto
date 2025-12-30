import React from "react";
import CardRecorde from "./CardRecorde";
import Loading from "../common/Loading";
import "./ListaRecordes.css";

const ListaRecordes = ({ recordes, loading }) => {
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

  // Ordenar recordes: primeiro por operação, depois por limite, depois por sistema
  const recordesOrdenados = [...recordes].sort((a, b) => {
    // Ordenar por operação
    const nomeA = a.operacao?.nome || "";
    const nomeB = b.operacao?.nome || "";
    if (nomeA !== nomeB) {
      return nomeA.localeCompare(nomeB, "pt-BR");
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
        <CardRecorde key={recorde.id} recorde={recorde} />
      ))}
    </div>
  );
};

export default ListaRecordes;
