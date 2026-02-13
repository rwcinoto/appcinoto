import React, { useEffect, useState } from "react";
import "./ModalEscolhaFormatoResposta.css";

const ModalEscolhaFormatoResposta = ({
  sistemaTipo,
  onEscolher,
  onCancelar,
  formatoInicial = "natural",
}) => {
  const [formatoEscolhido, setFormatoEscolhido] = useState(
    formatoInicial === "sistema" || formatoInicial === "natural"
      ? formatoInicial
      : "natural",
  );

  // Ao abrir o modal, usar o valor passado (ex.: escolha do treino anterior ao recomeçar)
  useEffect(() => {
    const valor =
      formatoInicial === "sistema" || formatoInicial === "natural"
        ? formatoInicial
        : "natural";
    setFormatoEscolhido(valor);
  }, [formatoInicial]);

  const handleConfirmar = () => {
    if (formatoEscolhido) {
      onEscolher(formatoEscolhido);
    }
  };

  const handleCancelar = () => {
    if (onCancelar) {
      onCancelar();
    }
  };

  const getNomeSistema = () => {
    const nomes = {
      romano: "romano",
      hexadecimal: "hexadecimal",
      binario: "binário",
    };
    return nomes[sistemaTipo] || sistemaTipo;
  };

  return (
    <div className="modal-escolha-formato-overlay">
      <div className="modal-escolha-formato-content">
        <div className="modal-escolha-formato-header">
          <h2>Como quer digitar as respostas?</h2>
        </div>
        <div className="modal-escolha-formato-body">
          <div className="modal-escolha-formato-opcoes">
            <button
              className={`modal-escolha-formato-opcao ${
                formatoEscolhido === "sistema" ? "selecionado" : ""
              }`}
              onClick={() => setFormatoEscolhido("sistema")}
            >
              <div className="opcao-titulo">No sistema {getNomeSistema()}</div>
            </button>
            <button
              className={`modal-escolha-formato-opcao ${
                formatoEscolhido === "natural" ? "selecionado" : ""
              }`}
              onClick={() => setFormatoEscolhido("natural")}
            >
              <div className="opcao-titulo">Em números naturais (0 a 9)</div>
            </button>
          </div>
          <div className="modal-escolha-formato-acoes">
            <button
              className="btn-cancelar"
              onClick={handleCancelar}
            >
              Cancelar
            </button>
            <button
              className="btn-confirmar"
              onClick={handleConfirmar}
              disabled={!formatoEscolhido}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalEscolhaFormatoResposta;
