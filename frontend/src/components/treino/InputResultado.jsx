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

  // Validar resposta em tempo real, caractere por caractere
  const validarResposta = (respostaDigitada) => {
    if (!conta) {
      setEstadoValidacao(null);
      return false;
    }

    // Se resposta digitada está vazia, ainda não validar
    if (!respostaDigitada || respostaDigitada.length === 0) {
      setEstadoValidacao(null);
      return false;
    }

    const resultadoEsperado = Number(conta.resultado);
    let respostaEsperadaFormatada;

    try {
      // Formatar resultado esperado conforme sistema
      if (sistema === "natural" || sistema === "inteiro") {
        respostaEsperadaFormatada = String(resultadoEsperado);
      } else if (sistema === "decimal") {
        respostaEsperadaFormatada = formatarNumero(
          resultadoEsperado,
          "decimal",
        );
      } else if (sistema === "romano") {
        respostaEsperadaFormatada = formatarNumero(resultadoEsperado, "romano");
      } else if (sistema === "binario") {
        respostaEsperadaFormatada = formatarNumero(
          resultadoEsperado,
          "binario",
        );
      } else if (sistema === "hexadecimal") {
        respostaEsperadaFormatada = formatarNumero(
          resultadoEsperado,
          "hexadecimal",
        );
      } else {
        setEstadoValidacao(null);
        return false;
      }

      const respostaNormalizada = String(respostaDigitada).trim();
      const esperadoUpper = String(respostaEsperadaFormatada).toUpperCase();
      const respostaUpper = respostaNormalizada.toUpperCase();

      // Validar caractere por caractere
      if (sistema === "natural" || sistema === "inteiro") {
        // Para natural e inteiro: comparar caractere por caractere
        const esperado = String(respostaEsperadaFormatada);

        // Verificar se resultado é negativo
        const resultadoNegativo = resultadoEsperado < 0;

        // Se resultado é negativo e usuário não digitou "-" ainda, mas já digitou número, erro
        if (resultadoNegativo) {
          if (
            !respostaNormalizada.startsWith("-") &&
            respostaNormalizada.length > 0
          ) {
            return "erro";
          }
        } else {
          // Se resultado é positivo e usuário digitou "-", erro imediato
          if (respostaNormalizada.startsWith("-")) {
            return "erro";
          }
        }

        // Se a resposta está vazia, ainda não validar
        if (respostaNormalizada.length === 0) {
          return false;
        }

        // Comparar cada caractere digitado com o caractere correspondente da resposta esperada
        // Exemplo: se resposta esperada é "17" e usuário digitou "2", comparamos "2" com "1" → erro imediato
        // Exemplo: se resposta esperada é "17" e usuário digitou "1", comparamos "1" com "1" → OK, continua
        const tamanhoDigitado = respostaNormalizada.length;
        const tamanhoEsperado = esperado.length;

        // Se digitou mais caracteres que o esperado, erro
        if (tamanhoDigitado > tamanhoEsperado) {
          return "erro";
        }

        // Comparar caractere por caractere - qualquer diferença é erro imediato
        for (let i = 0; i < tamanhoDigitado; i++) {
          const charDigitado = respostaNormalizada.charAt(i);
          const charEsperado = esperado.charAt(i);
          if (charDigitado !== charEsperado) {
            return "erro";
          }
        }

        // Se chegou aqui, todos os caracteres digitados estão corretos
        // Se o tamanho é igual, está completo e correto
        if (tamanhoDigitado === tamanhoEsperado) {
          return true;
        }

        // Ainda está digitando e tudo certo até agora
        return false;
      } else if (sistema === "decimal") {
        // Para decimal: usar vírgula como padrão (padrão brasileiro)
        // respostaEsperadaFormatada já vem com vírgula da função formatarNumero

        // Se está vazio, ainda não validar
        if (respostaNormalizada.length === 0) {
          return false;
        }

        // Se usuário digitou apenas vírgula
        if (respostaNormalizada === ",") {
          // Se a resposta esperada não começa com vírgula (começa com número), erro imediato
          // respostaEsperadaFormatada sempre começa com número (ex: "5,34"), nunca com vírgula
          if (!respostaEsperadaFormatada.startsWith(",")) {
            return "erro";
          } else {
            // Caso raro: resposta esperada começa com vírgula (permitir)
            return false;
          }
        }

        // Comparar cada caractere digitado com o caractere correspondente
        for (let i = 0; i < respostaNormalizada.length; i++) {
          if (
            i >= respostaEsperadaFormatada.length ||
            respostaNormalizada[i] !== respostaEsperadaFormatada[i]
          ) {
            return "erro";
          }
        }

        // Se chegou aqui, todos os caracteres digitados estão corretos
        // Se o tamanho é igual, validar o valor numérico para confirmar
        if (respostaNormalizada.length === respostaEsperadaFormatada.length) {
          // Converter vírgula para ponto para parseFloat
          const respostaComPonto = respostaNormalizada.replace(",", ".");
          const respostaNumero = parseFloat(respostaComPonto);
          if (!isNaN(respostaNumero)) {
            const diferenca = Math.abs(respostaNumero - resultadoEsperado);
            const correto = diferenca < 0.001;
            return correto;
          }
          return "erro";
        }

        // Ainda está digitando e tudo certo até agora
        return false;
      } else if (sistema === "romano") {
        // Para romano: comparar caractere por caractere (case insensitive)
        for (let i = 0; i < respostaUpper.length; i++) {
          if (
            i >= esperadoUpper.length ||
            respostaUpper[i] !== esperadoUpper[i]
          ) {
            return "erro";
          }
        }

        // Se chegou aqui e o tamanho é igual, está correto
        if (respostaUpper.length === esperadoUpper.length) {
          return true;
        }

        return false;
      } else if (sistema === "binario") {
        // Para binário: comparar caractere por caractere
        for (let i = 0; i < respostaNormalizada.length; i++) {
          if (
            i >= respostaEsperadaFormatada.length ||
            respostaNormalizada[i] !== respostaEsperadaFormatada[i]
          ) {
            return "erro";
          }
        }

        // Se chegou aqui e o tamanho é igual, está correto
        if (respostaNormalizada.length === respostaEsperadaFormatada.length) {
          return true;
        }

        return false;
      } else if (sistema === "hexadecimal") {
        // Para hexadecimal: comparar caractere por caractere (case insensitive)
        for (let i = 0; i < respostaUpper.length; i++) {
          if (
            i >= esperadoUpper.length ||
            respostaUpper[i] !== esperadoUpper[i]
          ) {
            return "erro";
          }
        }

        // Se chegou aqui e o tamanho é igual, está correto
        if (respostaUpper.length === esperadoUpper.length) {
          return true;
        }

        return false;
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
      // Converter ponto para vírgula (padrão brasileiro) - aceitar ambos na entrada
      let temp = novoValor.replace(".", ",");
      // Se houver mais de uma vírgula, manter apenas a primeira
      const partes = temp.split(",");
      if (partes.length > 2) {
        temp = partes[0] + "," + partes.slice(1).join("");
      }
      // Remover caracteres inválidos (manter apenas números e vírgula)
      temp = temp.replace(/[^0-9,]/g, "");
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

    // Validar em tempo real antes de atualizar o valor
    const resultadoValidacao = validarResposta(valorFiltrado);

    if (resultadoValidacao === "erro") {
      // Erro detectado: marcar como erro e limpar campo
      setEstadoValidacao("errado");
      setValor("");

      // Garantir que o input está limpo no DOM também
      if (inputRef.current) {
        inputRef.current.value = "";
      }

      // Chamar callback de erro se fornecido
      if (onErro) {
        onErro();
      }

      // Resetar estado após um breve delay para mostrar feedback visual
      setTimeout(() => {
        setEstadoValidacao(null);
        // Garantir foco após limpar
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);

      // Prevenir que o valor seja atualizado no input
      return;
    } else if (resultadoValidacao === true) {
      // Resposta correta completa: atualizar valor e marcar como correto
      setValor(valorFiltrado);
      setEstadoValidacao("correto");

      // Aguardar um pouco antes de chamar o callback (para mostrar feedback visual)
      setTimeout(() => {
        if (onAcerto) {
          onAcerto(valorFiltrado);
        }
        // Limpar campo após acertar
        setValor("");
        setEstadoValidacao(null);
      }, 300);
    } else {
      // Ainda digitando e tudo certo até agora: atualizar valor normalmente
      setValor(valorFiltrado);
      setEstadoValidacao(null);
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
        inputMode={
          sistema === "romano" || sistema === "hexadecimal" ? "text" : "numeric"
        }
        pattern={
          sistema === "natural"
            ? "[0-9]*"
            : sistema === "inteiro"
              ? "-?[0-9]*"
              : sistema === "decimal"
                ? "[0-9]*[.,]?[0-9]*"
                : sistema === "binario"
                  ? "[01]*"
                  : sistema === "hexadecimal"
                    ? "[0-9A-Fa-f]*"
                    : undefined
        }
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
