import React, { useEffect, useState } from "react";
import "./ModalEscolhaFormatoResposta.css";

const ModalOpcoesCalendario = ({
  mostrar,
  mostrarOpcoesResposta,
  onConfirmar,
  onCancelar,
  visualizacaoInicial = "numeros",
  respostaInicial = "numeros",
  mostrarChaveSeculo21 = false,
  chaveSeculo21Inicial = 0,
  mostrarChaveJaneiro = false,
  chaveJaneiroInicial = 0,
}) => {
  const [visualizacao, setVisualizacao] = useState(visualizacaoInicial);
  const [resposta, setResposta] = useState(respostaInicial);
  const [chaveSeculo21, setChaveSeculo21] = useState(chaveSeculo21Inicial);
  const [chaveJaneiro, setChaveJaneiro] = useState(chaveJaneiroInicial);

  // Ao abrir o modal, usar os valores passados (ex.: escolha do treino anterior ao recomeçar)
  useEffect(() => {
    if (mostrar) {
      setVisualizacao(visualizacaoInicial);
      setResposta(respostaInicial);
      setChaveSeculo21(chaveSeculo21Inicial);
      setChaveJaneiro(chaveJaneiroInicial);
    }
  }, [
    mostrar,
    visualizacaoInicial,
    respostaInicial,
    chaveSeculo21Inicial,
    chaveJaneiroInicial,
  ]);

  if (!mostrar) {
    return null;
  }

  const handleConfirmar = () => {
    if (onConfirmar) {
      onConfirmar({
        visualizacao,
        resposta: mostrarOpcoesResposta ? resposta : null,
        chaveSeculo21:
          mostrarChaveSeculo21 && chaveSeculo21 !== ""
            ? Number(chaveSeculo21)
            : null,
        chaveJaneiro:
          mostrarChaveJaneiro && chaveJaneiro !== ""
            ? Number(chaveJaneiro)
            : null,
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
              <div className="opcao-titulo">Texto (12 de abril de 1976)</div>
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
            <div
              className="modal-escolha-formato-opcoes"
              style={{ marginTop: 16 }}
            >
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

          {mostrarChaveSeculo21 && (
            <div
              className="modal-escolha-formato-opcoes"
              style={{ marginTop: 16 }}
            >
              <div className="opcao-titulo" style={{ marginBottom: 8 }}>
                Qual chave quer usar para o século xxi?
              </div>
              <input
                type="number"
                className="input-chaves-calendario"
                min={-7}
                max={7}
                step={1}
                value={chaveSeculo21}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || v === "-" || v === "+") {
                    setChaveSeculo21(v);
                    return;
                  }
                  const num = Number(v);
                  if (!Number.isNaN(num)) {
                    if (num < -7 || num > 7) return;
                    setChaveSeculo21(num);
                  }
                }}
              />
            </div>
          )}

          {mostrarChaveJaneiro && (
            <div
              className="modal-escolha-formato-opcoes"
              style={{ marginTop: 16 }}
            >
              <div className="opcao-titulo" style={{ marginBottom: 8 }}>
                Qual chave quer usar para janeiro?
              </div>
              <input
                type="number"
                className="input-chaves-calendario"
                min={-7}
                max={7}
                step={1}
                value={chaveJaneiro}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || v === "-" || v === "+") {
                    setChaveJaneiro(v);
                    return;
                  }
                  const num = Number(v);
                  if (!Number.isNaN(num)) {
                    if (num < -7 || num > 7) return;
                    setChaveJaneiro(num);
                  }
                }}
              />
            </div>
          )}

          <div className="modal-escolha-formato-acoes">
            <button className="btn-cancelar" onClick={handleCancelar}>
              Cancelar
            </button>
            <button
              className="btn-confirmar"
              onClick={handleConfirmar}
              disabled={
                !visualizacao ||
                (mostrarChaveSeculo21 && chaveSeculo21 === "") ||
                (mostrarChaveJaneiro && chaveJaneiro === "")
              }
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
