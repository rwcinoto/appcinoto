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
      if (sistema === "natural" || sistema === "inteiro") {
        respostaEsperadaFormatada = resultadoEsperado.toString();
        tamanhoEsperado = respostaEsperadaFormatada.length;
      } else if (sistema === "decimal") {
        respostaEsperadaFormatada = formatarNumero(resultadoEsperado, "decimal");
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
      } else if (sistema === "hexadecimal") {
        respostaEsperadaFormatada = formatarNumero(
          resultadoEsperado,
          "hexadecimal"
        );
        tamanhoEsperado = respostaEsperadaFormatada.length;
      } else {
        setEstadoValidacao(null);
        return false;
      }

      // Para números com múltiplos dígitos, validar apenas quando estiver completo
      const respostaNormalizada = respostaDigitada.trim();

      if (sistema === "natural" || sistema === "inteiro") {
        // Para natural e inteiro: validar quando o tamanho do valor absoluto for igual
        // Calcular tamanho do valor absoluto (sem contar o sinal de menos)
        const tamanhoAbsolutoEsperado = Math.abs(resultadoEsperado).toString().length;
        const respostaNumero = parseInt(respostaNormalizada, 10);
        
        if (!isNaN(respostaNumero)) {
          const tamanhoAbsolutoResposta = Math.abs(respostaNumero).toString().length;
          
          // Validar quando o tamanho do valor absoluto for igual ao esperado
          if (tamanhoAbsolutoResposta === tamanhoAbsolutoEsperado) {
            const correto = respostaNumero === resultadoEsperado;
            setEstadoValidacao(correto ? "correto" : "errado");

            if (correto) {
              return true;
            }
          } else if (tamanhoAbsolutoResposta < tamanhoAbsolutoEsperado) {
            // Ainda está digitando, não validar ainda
            setEstadoValidacao(null);
            return false;
          } else {
            // Tamanho maior que esperado, já está errado
            setEstadoValidacao("errado");
          }
        } else {
          // Resposta inválida, não validar ainda
          setEstadoValidacao(null);
          return false;
        }
      } else if (sistema === "decimal") {
        // Para decimal: validar quando o tamanho for igual (considerando ponto decimal)
        if (respostaNormalizada.length < tamanhoEsperado) {
          // Ainda está digitando
          setEstadoValidacao(null);
          return false;
        }

        // Converter vírgula para ponto
        const respostaComPonto = respostaNormalizada.replace(",", ".");
        const respostaNumero = parseFloat(respostaComPonto);
        
        if (!isNaN(respostaNumero)) {
          // Comparar com tolerância para erros de ponto flutuante
          const diferenca = Math.abs(respostaNumero - resultadoEsperado);
          const correto = diferenca < 0.001; // Tolerância de 0.001
          setEstadoValidacao(correto ? "correto" : "errado");
          
          if (correto) {
            return true;
          }
        } else {
          setEstadoValidacao("errado");
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
      } else if (sistema === "hexadecimal") {
        // Para hexadecimal: validar apenas quando o tamanho for igual
        if (respostaNormalizada.length < tamanhoEsperado) {
          // Ainda está digitando
          setEstadoValidacao(null);
          return false;
        }

        // Validar formato hexadecimal (0-9 e A-F, case insensitive)
        const respostaUpper = respostaNormalizada.toUpperCase();
        if (!/^[0-9A-F]+$/.test(respostaUpper)) {
          setEstadoValidacao("errado");
          return false;
        }

        const correto = respostaUpper === respostaEsperadaFormatada.toUpperCase();
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
    // Validar que o evento é confiável (não foi disparado por script)
    if (!e.isTrusted) {
      return;
    }

    const novoValor = e.target.value;

    // Filtrar entrada conforme o sistema
    let valorFiltrado = novoValor;

    if (sistema === "natural") {
      // Apenas números (sem negativo, pois resultados de operações básicas são positivos)
      valorFiltrado = novoValor.replace(/[^0-9]/g, "");
    } else if (sistema === "inteiro") {
      // Números com sinal de menos permitido (apenas no início)
      // Permitir: - no início, seguido de números
      if (novoValor === "-") {
        valorFiltrado = "-";
      } else if (novoValor.startsWith("-")) {
        valorFiltrado = "-" + novoValor.slice(1).replace(/[^0-9]/g, "");
      } else {
        valorFiltrado = novoValor.replace(/[^0-9]/g, "");
      }
    } else if (sistema === "decimal") {
      // Números decimais: permitir números, ponto ou vírgula (apenas um)
      // Converter vírgula para ponto para facilitar validação
      let temp = novoValor.replace(",", ".");
      // Permitir apenas números e um ponto decimal
      const partes = temp.split(".");
      if (partes.length > 2) {
        // Mais de um ponto, manter apenas o primeiro
        temp = partes[0] + "." + partes.slice(1).join("");
      }
      // Remover caracteres inválidos (manter apenas números e ponto)
      temp = temp.replace(/[^0-9.]/g, "");
      valorFiltrado = temp;
    } else if (sistema === "romano") {
      // Apenas letras romanas (I, V, X, L, C, D, M)
      valorFiltrado = novoValor.toUpperCase().replace(/[^IVXLCDM]/g, "");
    } else if (sistema === "binario") {
      // Apenas 0s e 1s
      valorFiltrado = novoValor.replace(/[^01]/g, "");
    } else if (sistema === "hexadecimal") {
      // Apenas dígitos 0-9 e letras A-F (case insensitive)
      valorFiltrado = novoValor.toUpperCase().replace(/[^0-9A-F]/g, "");
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
    // Validar que o evento é confiável (não foi disparado por script)
    if (!e.isTrusted) {
      return;
    }

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
        inputMode={sistema === "romano" || sistema === "hexadecimal" ? "text" : "numeric"}
        pattern={sistema === "natural" ? "[0-9]*" : sistema === "inteiro" ? "-?[0-9]*" : sistema === "decimal" ? "[0-9]*[.,]?[0-9]*" : sistema === "binario" ? "[01]*" : sistema === "hexadecimal" ? "[0-9A-Fa-f]*" : undefined}
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
