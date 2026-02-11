import React, { useState } from "react";
import "./ModalEscolhaFormatoResposta.css";

const ModalOpcoesCalendario = ({
  mostrar,
  mostrarOpcoesResposta,
  onConfirmar,
  onCancelar,
  visualizacaoInicial = "texto",
  respostaInicial = "numeros",
}) => {
  const [visualizacao, setVisualizacao] = useState(visualizacaoInicial);
  const [resposta, setResposta] = useState(respostaInicial);

  if (!mostrar) {
    return null;
  }

  const handleConfirmar = () => {
    if (onConfirmar) {
      onConfirmar({
        visualizacao,
        resposta: mostrarOpcoesResposta ? resposta : null,
      });
    }
  };

  const handleCancelar = () => {
    if (onCancelar) {
      onCancelar();
    }
  };

  return (
    <div className="modal-escolha-formato-overlay">
      <div className="modal-escolha-formato-content">
        <div className="modal-escolha-formato-header">
          <h2>Opções do treino de calendário</h2>
        </div>
        <div className="modal-escolha-formato-body">
          <div className="modal-escolha-formato-opcoes">
            <div className="opcao-titulo" style={{ marginBottom: 8 }}>
              Como quer ver a data?
            </div>
            <button
              className={`modal-escolha-formato-opcao ${
                visualizacao === "texto" ? "selecionado" : ""
              }`}
              onClick={() => setVisualizacao("texto")}
            >
              <div className="opcao-titulo">
                Texto (12 de abril de 1976)
              </div>
            </button>
            <button
              className={`modal-escolha-formato-opcao ${
                visualizacao === "numeros" ? "selecionado" : ""
              }`}
              onClick={() => setVisualizacao("numeros")}
            >
              <div className="opcao-titulo">Números (12/04/1976)</div>
            </button>
          </div>

          {mostrarOpcoesResposta && (
            <div className="modal-escolha-formato-opcoes" style={{ marginTop: 16 }}>
              <div className="opcao-titulo" style={{ marginBottom: 8 }}>
                Como quer digitar a resposta?
              </div>
              <button
                className={`modal-escolha-formato-opcao ${
                  resposta === "numeros" ? "selecionado" : ""
                }`}
                onClick={() => setResposta("numeros")}
              >
                <div className="opcao-titulo">Números (0 a 7)</div>
              </button>
              <button
                className={`modal-escolha-formato-opcao ${
                  resposta === "nomeDia" ? "selecionado" : ""
                }`}
                onClick={() => setResposta("nomeDia")}
              >
                <div className="opcao-titulo">
                  Nome do dia (seg, ter, qua, qui, sex, sáb, dom)
                </div>
              </button>
            </div>
          )}

          <div className="modal-escolha-formato-acoes">
            <button className="btn-cancelar" onClick={handleCancelar}>
              Cancelar
            </button>
            <button
              className="btn-confirmar"
              onClick={handleConfirmar}
              disabled={!visualizacao}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalOpcoesCalendario;

