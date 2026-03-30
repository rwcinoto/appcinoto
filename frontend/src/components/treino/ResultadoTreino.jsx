import React from "react";
import { formatarTempoSenha } from "../../constants/senha";
import "./ResultadoTreino.css";

const ResultadoTreino = ({
  resultado,
  onGabarito,
  onRecomecar,
  onNovoTreino,
  tipo = "operacoes",
}) => {
  const { total, erros, bateuRecorde, recordeAnterior } = resultado || {};

  const calcularPrecisao = (totalAcertos, totalErros) => {
    if (totalErros === null || totalErros === undefined) return null;
    const totalRespostas = totalAcertos + totalErros;
    if (totalRespostas === 0) return null;
    return (totalAcertos / totalRespostas) * 100;
  };

  const bateuPorMenosErros = bateuRecorde &&
    recordeAnterior &&
    recordeAnterior.total === total &&
    recordeAnterior.erros !== null &&
    recordeAnterior.erros !== undefined &&
    erros !== null &&
    erros !== undefined &&
    erros < recordeAnterior.erros;

  const bateuComErrosNullAnterior = bateuRecorde &&
    recordeAnterior &&
    recordeAnterior.total === total &&
    (recordeAnterior.erros === null || recordeAnterior.erros === undefined) &&
    erros !== null &&
    erros !== undefined;

  const precisaoAnterior = (bateuPorMenosErros || bateuComErrosNullAnterior)
    ? calcularPrecisao(recordeAnterior.total, recordeAnterior.erros)
    : null;
  const precisaoAtual = (bateuPorMenosErros || bateuComErrosNullAnterior)
    ? calcularPrecisao(total, erros)
    : null;

  const getMensagemRecorde = () => {
    if (recordeAnterior === null ||
        recordeAnterior === undefined ||
        recordeAnterior?.total === 0 ||
        recordeAnterior?.total === null ||
        recordeAnterior?.total === undefined) {
      return "Parabéns! Você estabeleceu seu primeiro recorde!";
    }

    if (tipo === "senha") {
      if (recordeAnterior.total > resultado.totalTentativas) {
        return `Parabéns! Você bateu seu recorde anterior de ${recordeAnterior.total} tentativas!`;
      }
      return (
        <>
          Mesmo número de tentativas, mas mais rápido!
          <br />
          <span style={{ fontSize: "0.9em", opacity: 0.9 }}>
            Anterior: {formatarTempoSenha(recordeAnterior.tempo)}
            {" | "}
            Atual: {formatarTempoSenha(resultado.tempo)}
          </span>
        </>
      );
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

  const isSenha = tipo === "senha";
  const acertouSenha = isSenha && resultado?.acertou;
  const naoAcertouSenha = isSenha && !resultado?.acertou;

  const tituloHeader = naoAcertouSenha ? "Treino finalizado" : "Treino finalizado!";
  const labelPrincipal = isSenha ? "Tentativas" : "Total de acertos";
  const valorPrincipal = isSenha ? (resultado?.totalTentativas || 0) : (total || 0);

  return (
    <div className="resultado-treino-overlay">
      <div className="resultado-treino-container">
        <div className="resultado-treino-header">
          <h2>{tituloHeader}</h2>
        </div>

        <div className="resultado-treino-body">
          {naoAcertouSenha ? (
            <div className="resultado-senha-nao-acertou">
              <div className="resultado-pontos">
                <div className="resultado-pontos-label">Não descobriu a senha</div>
                <div className="resultado-pontos-valor" style={{ color: "#999", fontSize: "48px" }}>
                  😔
                </div>
              </div>
              <div className="resultado-senha-revelada">
                <span className="resultado-senha-revelada-label">A senha era:</span>
                <div className="resultado-senha-revelada-digitos">
                  {resultado?.senhaSecreta?.map((d, i) => (
                    <span key={i} className="resultado-senha-revelada-digito">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="resultado-pontos">
                <div className="resultado-pontos-label">{labelPrincipal}</div>
                <div className="resultado-pontos-valor">{valorPrincipal}</div>
                {acertouSenha && resultado?.tempo != null && (
                  <div className="resultado-tempo-detalhe">
                    {formatarTempoSenha(resultado.tempo)}
                  </div>
                )}
              </div>

              {bateuRecorde && (
                <div className="resultado-recorde-destaque">
                  <span className="recorde-badge">🎉 Novo recorde!</span>
                  <p>{getMensagemRecorde()}</p>
                </div>
              )}

              {!bateuRecorde &&
                recordeAnterior !== null &&
                recordeAnterior !== undefined &&
                recordeAnterior?.total > 0 && (
                  <div className="resultado-recorde-anterior">
                    <div className="recorde-anterior-label">
                      {isSenha ? "Seu recorde" : "Recorde anterior"}
                    </div>
                    <div className="recorde-anterior-valor">
                      {recordeAnterior?.total || 0}
                      {isSenha && recordeAnterior?.tempo != null && (
                        <span className="recorde-anterior-tempo">
                          {" "}({formatarTempoSenha(recordeAnterior.tempo)})
                        </span>
                      )}
                    </div>
                  </div>
                )}
            </>
          )}
        </div>

        <div className="resultado-treino-actions">
          {onGabarito && (
            <button
              type="button"
              className="btn-gabarito"
              onClick={onGabarito}
            >
              Gabarito
            </button>
          )}
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
