import React from "react";
import "./ResultadoTreino.css";

const ResultadoTreino = ({ resultado, onRecomecar, onNovoTreino }) => {
  const { total, bateuRecorde, recordeAnterior } = resultado || {};

  return (
    <div className="resultado-treino-overlay">
      <div className="resultado-treino-container">
        <div className="resultado-treino-header">
          <h2>Treino Finalizado!</h2>
        </div>

        <div className="resultado-treino-body">
          <div className="resultado-pontos">
            <div className="resultado-pontos-label">Total de Acertos</div>
            <div className="resultado-pontos-valor">{total || 0}</div>
          </div>

          {bateuRecorde && (
            <div className="resultado-recorde-destaque">
              <span className="recorde-badge">🎉 Novo Recorde!</span>
              <p>Parabéns! Você bateu seu recorde anterior!</p>
            </div>
          )}

          {!bateuRecorde && recordeAnterior !== null && (
            <div className="resultado-recorde-anterior">
              <div className="recorde-anterior-label">Recorde Anterior</div>
              <div className="recorde-anterior-valor">
                {recordeAnterior?.total || 0}
              </div>
            </div>
          )}
        </div>

        <div className="resultado-treino-actions">
          <button className="btn-recomecar" onClick={onRecomecar}>
            Recomeçar
          </button>
          <button className="btn-novo-treino" onClick={onNovoTreino}>
            Novo Treino
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultadoTreino;
