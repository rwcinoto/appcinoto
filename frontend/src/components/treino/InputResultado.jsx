import React, { useEffect, useRef, useState } from "react";
import { formatarNumero } from "../../utils/conversaoNumerica";
import "./InputResultado.css";

const InputResultado = ({
  conta,
  sistema,
  onAcerto,
  onErro,
  disabled = false,
}) => {
  const [valor, setValor] = useState("");
  const [estadoValidacao, setEstadoValidacao] = useState(null); // null, 'correto', 'errado'
  const inputRef = useRef(null);

  // Usar uma chave única baseada no conteúdo da conta para detectar mudanças
  const contaKey = conta
    ? `${conta.parcela1}-${conta.parcela2}-${conta.parcela3}-${conta.resultado}-${conta.tipo}`
    : null;

  // Foco automático quando o componente é montado ou quando a conta muda
  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [contaKey, disabled]);

  // Limpar campo quando a conta muda
  useEffect(() => {
    if (contaKey) {
      setValor("");
      setEstadoValidacao(null);
    }
  }, [contaKey]);

  // Validar resposta em tempo real
  const validarResposta = (respostaDigitada) => {
    if (!conta || !respostaDigitada) {
      setEstadoValidacao(null);
      return false;
    }

    const resultadoEsperado = conta.resultado;
    let respostaEsperadaFormatada;
    let tamanhoEsperado = null;

    try {
      // Formatar resultado esperado conforme sistema
      if (sistema === "arabico") {
        respostaEsperadaFormatada = resultadoEsperado.toString();
        tamanhoEsperado = respostaEsperadaFormatada.length;
      } else if (sistema === "romano") {
        respostaEsperadaFormatada = formatarNumero(resultadoEsperado, "romano");
        tamanhoEsperado = respostaEsperadaFormatada.length;
      } else if (sistema === "binario") {
        respostaEsperadaFormatada = formatarNumero(
          resultadoEsperado,
          "binario"
        );
        tamanhoEsperado = respostaEsperadaFormatada.length;
      } else {
        setEstadoValidacao(null);
        return false;
      }

      // Para números com múltiplos dígitos, validar apenas quando estiver completo
      const respostaNormalizada = respostaDigitada.trim();

      if (sistema === "arabico") {
        // Para arábico: validar apenas quando o tamanho for igual
        if (respostaNormalizada.length < tamanhoEsperado) {
          // Ainda está digitando, não validar ainda
          setEstadoValidacao(null);
          return false;
        }

        // Se chegou aqui, o tamanho é igual ou maior
        const respostaNumero = parseInt(respostaNormalizada, 10);
        if (!isNaN(respostaNumero)) {
          const correto = respostaNumero === resultadoEsperado;

          // Mostrar estado apenas se estiver completo
          if (respostaNormalizada.length === tamanhoEsperado) {
            setEstadoValidacao(correto ? "correto" : "errado");

            if (correto) {
              return true;
            }
          } else {
            // Tamanho maior que esperado, já está errado
            setEstadoValidacao("errado");
          }
        } else {
          setEstadoValidacao(null);
        }
      } else if (sistema === "romano") {
        // Para romano: validar apenas quando o tamanho for igual
        if (respostaNormalizada.length < tamanhoEsperado) {
          // Ainda está digitando
          setEstadoValidacao(null);
          return false;
        }

        const respostaUpper = respostaNormalizada.toUpperCase();
        const esperadoUpper = respostaEsperadaFormatada.toUpperCase();
        const correto = respostaUpper === esperadoUpper;

        setEstadoValidacao(correto ? "correto" : "errado");

        if (correto) {
          return true;
        }
      } else if (sistema === "binario") {
        // Para binário: validar apenas quando o tamanho for igual
        if (respostaNormalizada.length < tamanhoEsperado) {
          // Ainda está digitando
          setEstadoValidacao(null);
          return false;
        }

        // Validar formato binário
        if (!/^[01]+$/.test(respostaNormalizada)) {
          setEstadoValidacao("errado");
          return false;
        }

        const correto = respostaNormalizada === respostaEsperadaFormatada;
        setEstadoValidacao(correto ? "correto" : "errado");

        if (correto) {
          return true;
        }
      }
    } catch (error) {
      console.error("Erro ao validar resposta:", error);
      setEstadoValidacao(null);
    }

    return false;
  };

  const handleChange = (e) => {
    const novoValor = e.target.value;

    // Filtrar entrada conforme o sistema
    let valorFiltrado = novoValor;

    if (sistema === "arabico") {
      // Apenas números (sem negativo, pois resultados de operações básicas são positivos)
      valorFiltrado = novoValor.replace(/[^0-9]/g, "");
    } else if (sistema === "romano") {
      // Apenas letras romanas (I, V, X, L, C, D, M)
      valorFiltrado = novoValor.toUpperCase().replace(/[^IVXLCDM]/g, "");
    } else if (sistema === "binario") {
      // Apenas 0s e 1s
      valorFiltrado = novoValor.replace(/[^01]/g, "");
    }

    setValor(valorFiltrado);

    // Validar em tempo real
    const correto = validarResposta(valorFiltrado);

    if (correto) {
      // Aguardar um pouco antes de chamar o callback (para mostrar feedback visual)
      setTimeout(() => {
        if (onAcerto) {
          onAcerto(valorFiltrado);
        }
        // Limpar campo após acertar
        setValor("");
        setEstadoValidacao(null);
      }, 300);
    }
  };

  const handleKeyDown = (e) => {
    // Prevenir Enter de submeter o formulário (se estiver dentro de um form)
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const classNameInput = `input-resultado ${estadoValidacao || ""}`;

  return (
    <div className="input-resultado-container">
      <input
        ref={inputRef}
        type="text"
        value={valor}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={classNameInput}
        disabled={disabled}
        placeholder="Digite a resposta..."
        autoComplete="off"
        autoFocus
        aria-label="Digite o resultado da conta"
      />
    </div>
  );
};

export default InputResultado;
