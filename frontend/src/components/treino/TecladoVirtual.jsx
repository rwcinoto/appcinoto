import React from "react";
import "./TecladoVirtual.css";

const TecladoVirtual = ({
  sistema,
  formatoResposta,
  onKeyPress,
  disabled = false,
}) => {
  // Determinar sistema de entrada baseado no formato escolhido
  const sistemaEntrada = formatoResposta === "natural" ? "natural" : sistema;

  // Função para determinar quais teclas mostrar
  const getTeclas = () => {
    if (sistemaEntrada === "romano") {
      // Números romanos: I, V, X, L, C, D, M
      return ["I", "V", "X", "L", "C", "D", "M"];
    } else if (sistemaEntrada === "binario") {
      // Binário: apenas 0 e 1
      return ["0", "1"];
    } else if (sistemaEntrada === "hexadecimal") {
      // Hexadecimal: 0-9 e A-F
      return [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
      ];
    } else if (sistemaEntrada === "decimal") {
      // Decimal: números 0-9, vírgula e menos
      return ["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "."];
    } else if (sistemaEntrada === "inteiro") {
      // Inteiro: números 0-9 e menos
      return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "0"];
    } else {
      // Natural: apenas números 0-9
      return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
    }
  };

  const handleKeyClick = (valor) => {
    if (disabled) return;

    // Criar evento sintético que simula digitação
    const evento = {
      key: valor,
      isTrusted: true, // Importante para passar validação de isTrusted
    };

    if (onKeyPress) {
      onKeyPress(evento);
    }
  };

  const handleBackspace = () => {
    if (disabled) return;

    // Criar evento de backspace
    const evento = {
      key: "Backspace",
      isTrusted: true,
    };

    if (onKeyPress) {
      onKeyPress(evento);
    }
  };

  const teclas = getTeclas();

  // Layout especial para binário (apenas 2 teclas)
  if (sistemaEntrada === "binario") {
    return (
      <div className="teclado-virtual-container">
        <div className="teclado-virtual">
          <div className="teclado-linha">
            {teclas.map((tecla) => (
              <button
                key={tecla}
                className="tecla-virtual"
                onClick={() => handleKeyClick(tecla)}
                disabled={disabled}
                type="button"
              >
                {tecla}
              </button>
            ))}
            <button
              className="tecla-virtual tecla-backspace"
              onClick={handleBackspace}
              disabled={disabled}
              type="button"
              aria-label="Apagar"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                <line x1="18" y1="9" x2="12" y2="15"></line>
                <line x1="12" y1="9" x2="18" y2="15"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Layout especial para romano (7 letras)
  if (sistemaEntrada === "romano") {
    // Linha 1: I, V, X
    const romanoLinha1 = ["I", "V", "X"];
    // Linha 2: L, C, D
    const romanoLinha2 = ["L", "C", "D"];
    // Linha 3: M na segunda coluna (abaixo do C)

    return (
      <div className="teclado-virtual-container">
        <div className="teclado-virtual">
          {/* Linha 1: I, V, X, vazio */}
          <div className="teclado-linha">
            {romanoLinha1.map((tecla) => (
              <button
                key={tecla}
                className="tecla-virtual"
                onClick={() => handleKeyClick(tecla)}
                disabled={disabled}
                type="button"
              >
                {tecla}
              </button>
            ))}
            <div className="tecla-virtual tecla-vazia"></div>
          </div>

          {/* Linha 2: L, C, D, backspace */}
          <div className="teclado-linha">
            {romanoLinha2.map((tecla) => (
              <button
                key={tecla}
                className="tecla-virtual"
                onClick={() => handleKeyClick(tecla)}
                disabled={disabled}
                type="button"
              >
                {tecla}
              </button>
            ))}
            <button
              className="tecla-virtual tecla-backspace"
              onClick={handleBackspace}
              disabled={disabled}
              type="button"
              aria-label="Apagar"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                <line x1="18" y1="9" x2="12" y2="15"></line>
                <line x1="12" y1="9" x2="18" y2="15"></line>
              </svg>
            </button>
          </div>

          {/* Linha 3: vazio, M, vazio, vazio */}
          <div className="teclado-linha">
            <div className="tecla-virtual tecla-vazia"></div>
            <button
              className="tecla-virtual"
              onClick={() => handleKeyClick("M")}
              disabled={disabled}
              type="button"
            >
              M
            </button>
            <div className="tecla-virtual tecla-vazia"></div>
            <div className="tecla-virtual tecla-vazia"></div>
          </div>
        </div>
      </div>
    );
  }

  // Layout padrão para números (decimal, inteiro, natural, hexadecimal)
  // Layout tipo telefone: 3x3 + linha inferior com vírgula, zero, ponto e menos
  const numerosLinha1 = ["1", "2", "3"];
  const numerosLinha2 = ["4", "5", "6"];
  const numerosLinha3 = ["7", "8", "9"];

  // Teclas especiais na linha inferior (sempre 4 colunas)
  const teclasEspeciais = [];
  if (sistemaEntrada === "decimal") {
    teclasEspeciais.push({ valor: ",", label: "," });
    teclasEspeciais.push({ valor: "0", label: "0" });
    teclasEspeciais.push({ valor: ".", label: "." });
    teclasEspeciais.push({ valor: "", label: "" }); // Espaço vazio para completar 4 colunas
  } else if (sistemaEntrada === "inteiro") {
    teclasEspeciais.push({ valor: "-", label: "-" });
    teclasEspeciais.push({ valor: "0", label: "0" });
    teclasEspeciais.push({ valor: "", label: "" }); // Espaço vazio
    teclasEspeciais.push({ valor: "", label: "" }); // Espaço vazio para completar 4 colunas
  } else if (sistemaEntrada === "hexadecimal") {
    // Hexadecimal: mostrar números em grid 4x4 + backspace
    const hexLinha1 = ["1", "2", "3", "A"];
    const hexLinha2 = ["4", "5", "6", "B"];
    const hexLinha3 = ["7", "8", "9", "C"];
    const hexLinha4 = ["0", "D", "E", "F"];

    return (
      <div className="teclado-virtual-container">
        <div className="teclado-virtual teclado-hexadecimal">
          <div className="teclado-linha">
            {hexLinha1.map((tecla) => (
              <button
                key={tecla}
                className="tecla-virtual"
                onClick={() => handleKeyClick(tecla)}
                disabled={disabled}
                type="button"
              >
                {tecla}
              </button>
            ))}
          </div>
          <div className="teclado-linha">
            {hexLinha2.map((tecla) => (
              <button
                key={tecla}
                className="tecla-virtual"
                onClick={() => handleKeyClick(tecla)}
                disabled={disabled}
                type="button"
              >
                {tecla}
              </button>
            ))}
          </div>
          <div className="teclado-linha">
            {hexLinha3.map((tecla) => (
              <button
                key={tecla}
                className="tecla-virtual"
                onClick={() => handleKeyClick(tecla)}
                disabled={disabled}
                type="button"
              >
                {tecla}
              </button>
            ))}
          </div>
          <div className="teclado-linha">
            {hexLinha4.map((tecla) => (
              <button
                key={tecla}
                className="tecla-virtual"
                onClick={() => handleKeyClick(tecla)}
                disabled={disabled}
                type="button"
              >
                {tecla}
              </button>
            ))}
          </div>
          <div className="teclado-linha teclado-linha-backspace">
            <button
              className="tecla-virtual tecla-backspace"
              onClick={handleBackspace}
              disabled={disabled}
              type="button"
              aria-label="Apagar"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                <line x1="18" y1="9" x2="12" y2="15"></line>
                <line x1="12" y1="9" x2="18" y2="15"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    // Natural: apenas números (sempre 4 colunas)
    // Zero deve ficar na segunda coluna (abaixo do 8)
    teclasEspeciais.push({ valor: "", label: "" }); // Espaço vazio na primeira coluna
    teclasEspeciais.push({ valor: "0", label: "0" }); // Zero na segunda coluna (abaixo do 8)
    teclasEspeciais.push({ valor: "", label: "" }); // Espaço vazio na terceira coluna
    teclasEspeciais.push({ valor: "", label: "" }); // Espaço vazio na quarta coluna
  }

  return (
    <div className="teclado-virtual-container">
      <div className="teclado-virtual">
        {/* Linha 1: 1, 2, 3 */}
        <div className="teclado-linha">
          {numerosLinha1.map((tecla) => (
            <button
              key={tecla}
              className="tecla-virtual"
              onClick={() => handleKeyClick(tecla)}
              disabled={disabled}
              type="button"
            >
              {tecla}
            </button>
          ))}
          {/* Sinal de menos à direita da linha 1 (apenas para inteiro) ou espaço vazio (para natural) */}
          {sistemaEntrada === "inteiro" ? (
            <button
              className="tecla-virtual tecla-sinal-menos"
              onClick={() => handleKeyClick("-")}
              disabled={disabled}
              type="button"
            >
              -
            </button>
          ) : (
            <div className="tecla-virtual tecla-vazia"></div>
          )}
        </div>

        {/* Linha 2: 4, 5, 6 */}
        <div className="teclado-linha">
          {numerosLinha2.map((tecla) => (
            <button
              key={tecla}
              className="tecla-virtual"
              onClick={() => handleKeyClick(tecla)}
              disabled={disabled}
              type="button"
            >
              {tecla}
            </button>
          ))}
          {/* Backspace à direita da linha 2 */}
          <button
            className="tecla-virtual tecla-backspace"
            onClick={handleBackspace}
            disabled={disabled}
            type="button"
            aria-label="Apagar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
              <line x1="18" y1="9" x2="12" y2="15"></line>
              <line x1="12" y1="9" x2="18" y2="15"></line>
            </svg>
          </button>
        </div>

        {/* Linha 3: 7, 8, 9 */}
        <div className="teclado-linha">
          {numerosLinha3.map((tecla) => (
            <button
              key={tecla}
              className="tecla-virtual"
              onClick={() => handleKeyClick(tecla)}
              disabled={disabled}
              type="button"
            >
              {tecla}
            </button>
          ))}
          {/* Espaço vazio à direita da linha 3 */}
          <div className="tecla-virtual tecla-vazia"></div>
        </div>

        {/* Linha 4: vírgula, 0, ponto (ou apenas 0 para natural) */}
        <div className="teclado-linha">
          {teclasEspeciais.map((tecla, index) => {
            if (tecla.valor === "") {
              return (
                <div
                  key={`vazio-${index}`}
                  className="tecla-virtual tecla-vazia"
                ></div>
              );
            }
            return (
              <button
                key={tecla.valor}
                className="tecla-virtual"
                onClick={() => handleKeyClick(tecla.valor)}
                disabled={disabled}
                type="button"
              >
                {tecla.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TecladoVirtual;
