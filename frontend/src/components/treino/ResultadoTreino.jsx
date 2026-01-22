import React from "react";
import "./ResultadoTreino.css";

const ResultadoTreino = ({ resultado, onRecomecar, onNovoTreino }) => {
  const { total, erros, bateuRecorde, recordeAnterior } = resultado || {};

  // Calcular precisão
  const calcularPrecisao = (totalAcertos, totalErros) => {
    if (totalErros === null || totalErros === undefined) {
      return null;
    }
    const totalRespostas = totalAcertos + totalErros;
    if (totalRespostas === 0) {
      return null;
    }
    return (totalAcertos / totalRespostas) * 100;
  };

  // Verificar se bateu recorde com mesma pontuação mas menos erros
  const bateuPorMenosErros = bateuRecorde &&
    recordeAnterior &&
    recordeAnterior.total === total &&
    recordeAnterior.erros !== null &&
    recordeAnterior.erros !== undefined &&
    erros !== null &&
    erros !== undefined &&
    erros < recordeAnterior.erros;

  // Verificar se bateu recorde com mesma pontuação mas recorde anterior tinha erros NULL
  const bateuComErrosNullAnterior = bateuRecorde &&
    recordeAnterior &&
    recordeAnterior.total === total &&
    (recordeAnterior.erros === null || recordeAnterior.erros === undefined) &&
    erros !== null &&
    erros !== undefined;

  // Calcular precisões para exibição
  const precisaoAnterior = (bateuPorMenosErros || bateuComErrosNullAnterior)
    ? calcularPrecisao(recordeAnterior.total, recordeAnterior.erros)
    : null;
  const precisaoAtual = (bateuPorMenosErros || bateuComErrosNullAnterior)
    ? calcularPrecisao(total, erros)
    : null;

  // Montar mensagem de recorde
  const getMensagemRecorde = () => {
    if (recordeAnterior === null ||
        recordeAnterior === undefined ||
        recordeAnterior?.total === 0 ||
        recordeAnterior?.total === null ||
        recordeAnterior?.total === undefined) {
      return "Parabéns! Você estabeleceu seu primeiro recorde!";
    }

    if (bateuPorMenosErros || bateuComErrosNullAnterior) {
      return (
        <>
          Parabéns! Você bateu seu recorde anterior de {recordeAnterior.total} acertos com menos erros!
          <br />
          <span style={{ fontSize: "0.9em", opacity: 0.9 }}>
            Anterior: {recordeAnterior.erros !== null && recordeAnterior.erros !== undefined ? recordeAnterior.erros : "-"} erros
            {precisaoAnterior !== null ? ` (${precisaoAnterior.toFixed(1).replace(".", ",")}% precisão)` : " (- precisão)"}
            {" | "}
            Atual: {erros} erros
            {precisaoAtual !== null && ` (${precisaoAtual.toFixed(1).replace(".", ",")}% precisão)`}
          </span>
        </>
      );
    }

    return `Parabéns! Você bateu seu recorde anterior de ${recordeAnterior?.total || 0} acertos!`;
  };

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
              <p>{getMensagemRecorde()}</p>
            </div>
          )}

          {!bateuRecorde &&
            recordeAnterior !== null &&
            recordeAnterior !== undefined && (
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
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultadoTreino;
