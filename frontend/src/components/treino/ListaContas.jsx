import React, { useEffect, useRef } from "react";
import {
  formatarNumero,
  obterSimboloOperacao,
} from "../../utils/conversaoNumerica";
import "./ListaContas.css";

const ListaContas = ({
  contas,
  sistema,
  contaAtualIndex = 0,
  onAcerto,
  disabled = false,
}) => {
  const listaRef = useRef(null);
  const inputRefs = useRef({});
  const contaProcessandoRef = useRef(null); // ID da conta que já foi processada
  const ultimaPrimeiraContaRef = useRef(null); // ID da última primeira conta para detectar mudanças reais
  const estadoValidacaoRef = useRef({}); // Estado de validação visual por input (index -> "errado" | null)

  // Scroll automático e foco na conta atual
  useEffect(() => {
    // Resetar conta processada quando a primeira conta mudar ou quando a lista mudar
    // Isso garante que mesmo se a mesma conta aparecer novamente, a proteção seja resetada
    if (contas.length > 0 && contas[0]) {
      const primeiraContaId = `${contas[0].parcela1}-${contas[0].parcela2}-${
        contas[0].parcela3 || "null"
      }-${contas[0].resultado}-${contas[0].tipo}`;

      // Sempre resetar a proteção quando a primeira conta mudar (mesmo se for a mesma conta)
      // O importante é que a lista mudou (uma conta foi removida e outra adicionada)
      if (ultimaPrimeiraContaRef.current !== primeiraContaId) {
        contaProcessandoRef.current = null;
        ultimaPrimeiraContaRef.current = primeiraContaId;
      } else {
        // Se a conta ID é a mesma mas a lista mudou (por exemplo, mesmo valor mas nova instância),
        // também devemos resetar para permitir resposta novamente
        // Resetar apenas se não estiver processando (para evitar resetar no meio de uma validação)
        if (!disabled) {
          contaProcessandoRef.current = null;
        }
      }
    }

    // Usar setTimeout para garantir que o DOM foi atualizado após mudanças nas contas
    const timer = setTimeout(() => {
      const inputRef = inputRefs.current[contaAtualIndex];
      if (inputRef && !disabled && inputRef.offsetParent !== null) {
        // offsetParent !== null garante que o elemento está visível
        inputRef.focus();
        inputRef.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100); // Aumentar delay para garantir que o DOM foi totalmente atualizado

    return () => clearTimeout(timer);
  }, [contaAtualIndex, disabled, contas]);

  // Função para validar resposta
  const validarResposta = (conta, respostaDigitada) => {
    if (!conta || !respostaDigitada) {
      return false;
    }

    const resultadoEsperado = conta.resultado;
    let respostaEsperadaFormatada;

    try {
      // Formatar resultado esperado conforme sistema
      if (sistema === "natural") {
        respostaEsperadaFormatada = resultadoEsperado.toString();
        const respostaNumero = parseInt(respostaDigitada.trim(), 10);
        if (isNaN(respostaNumero)) return false;
        return respostaNumero === resultadoEsperado;
      } else if (sistema === "romano") {
        respostaEsperadaFormatada = formatarNumero(resultadoEsperado, "romano");
        const respostaUpper = respostaDigitada.trim().toUpperCase();
        const esperadoUpper = respostaEsperadaFormatada.toUpperCase();
        return respostaUpper === esperadoUpper;
      } else if (sistema === "binario") {
        respostaEsperadaFormatada = formatarNumero(
          resultadoEsperado,
          "binario"
        );
        if (!/^[01]+$/.test(respostaDigitada.trim())) return false;
        return respostaDigitada.trim() === respostaEsperadaFormatada;
      }
    } catch (error) {
      console.error("Erro ao validar resposta:", error);
    }

    return false;
  };

  // Handler de mudança no input
  const handleChange = (conta, index, e) => {
    const novoValor = e.target.value;

    // Filtrar entrada conforme o sistema
    let valorFiltrado = novoValor;

    if (sistema === "natural") {
      valorFiltrado = novoValor.replace(/[^0-9]/g, "");
    } else if (sistema === "romano") {
      valorFiltrado = novoValor.toUpperCase().replace(/[^IVXLCDM]/g, "");
    } else if (sistema === "binario") {
      valorFiltrado = novoValor.replace(/[^01]/g, "");
    }

    // Atualizar valor do input
    e.target.value = valorFiltrado;

    // Validar localmente para feedback visual
    const resultadoEsperado = conta.resultado;
    let respostaEsperadaFormatada;

    try {
      if (sistema === "natural") {
        respostaEsperadaFormatada = resultadoEsperado.toString();
        const tamanhoEsperado = respostaEsperadaFormatada.length;
        const respostaNormalizada = valorFiltrado.trim();

        if (respostaNormalizada.length === tamanhoEsperado) {
          const respostaNumero = parseInt(respostaNormalizada, 10);
          if (!isNaN(respostaNumero)) {
            const correto = respostaNumero === resultadoEsperado;
            // Atualizar estado visual
            estadoValidacaoRef.current[index] = correto ? null : "errado";
            // Forçar re-render atualizando classe do input
            const inputEl = e.target;
            if (correto) {
              inputEl.classList.remove("errado");
            } else {
              inputEl.classList.add("errado");
            }
          }
        } else if (respostaNormalizada.length < tamanhoEsperado) {
          // Ainda digitando, remover estado de erro
          estadoValidacaoRef.current[index] = null;
          e.target.classList.remove("errado");
        }
      } else if (sistema === "romano") {
        respostaEsperadaFormatada = formatarNumero(resultadoEsperado, "romano");
        const tamanhoEsperado = respostaEsperadaFormatada.length;
        const respostaNormalizada = valorFiltrado.trim().toUpperCase();

        if (respostaNormalizada.length === tamanhoEsperado) {
          const correto =
            respostaNormalizada === respostaEsperadaFormatada.toUpperCase();
          estadoValidacaoRef.current[index] = correto ? null : "errado";
          const inputEl = e.target;
          if (correto) {
            inputEl.classList.remove("errado");
          } else {
            inputEl.classList.add("errado");
          }
        } else if (respostaNormalizada.length < tamanhoEsperado) {
          estadoValidacaoRef.current[index] = null;
          e.target.classList.remove("errado");
        }
      } else if (sistema === "binario") {
        respostaEsperadaFormatada = formatarNumero(
          resultadoEsperado,
          "binario"
        );
        const tamanhoEsperado = respostaEsperadaFormatada.length;
        const respostaNormalizada = valorFiltrado.trim();

        if (respostaNormalizada.length === tamanhoEsperado) {
          if (/^[01]+$/.test(respostaNormalizada)) {
            const correto = respostaNormalizada === respostaEsperadaFormatada;
            estadoValidacaoRef.current[index] = correto ? null : "errado";
            const inputEl = e.target;
            if (correto) {
              inputEl.classList.remove("errado");
            } else {
              inputEl.classList.add("errado");
            }
          } else {
            estadoValidacaoRef.current[index] = "errado";
            e.target.classList.add("errado");
          }
        } else if (respostaNormalizada.length < tamanhoEsperado) {
          estadoValidacaoRef.current[index] = null;
          e.target.classList.remove("errado");
        }
      }
    } catch (error) {
      // Ignorar erros de formatação
    }

    // Só processar se ainda estamos na conta atual e ela ainda não foi processada
    const contaId = `${conta.parcela1}-${conta.parcela2}-${
      conta.parcela3 || "null"
    }-${conta.resultado}-${conta.tipo}`;

    if (
      valorFiltrado &&
      index === contaAtualIndex &&
      contaProcessandoRef.current !== contaId &&
      validarResposta(conta, valorFiltrado) &&
      !disabled
    ) {
      // Marcar que esta conta está sendo processada ANTES de chamar callback
      contaProcessandoRef.current = contaId;

      // Limpar estado de erro e input
      estadoValidacaoRef.current[index] = null;
      e.target.classList.remove("errado");
      e.target.value = "";

      // Chamar callback - o backend fará a validação final
      // Chamar diretamente (o handleAcerto já tem proteção contra múltiplas chamadas)
      if (onAcerto) {
        onAcerto(valorFiltrado);
      }
    }
  };

  // Handler de tecla pressionada
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  if (!contas || contas.length === 0) {
    return (
      <div className="lista-contas-container">
        <p className="sem-contas">Nenhuma conta disponível</p>
      </div>
    );
  }

  // Limitar a 2 contas para exibição (atual e próxima)
  const contasParaExibir = contas.slice(0, 2);

  return (
    <div className="lista-contas-container" ref={listaRef}>
      <div className="lista-contas">
        {contasParaExibir.map((conta, index) => {
          const isAtual = index === contaAtualIndex;
          const parcela1Formatada = formatarNumero(conta.parcela1, sistema);
          // Na operação de raiz, parcela2 pode ser null
          const parcela2Formatada =
            conta.parcela2 !== null && conta.parcela2 !== undefined
              ? formatarNumero(conta.parcela2, sistema)
              : "";
          const parcela3Formatada =
            conta.parcela3 !== null && conta.parcela3 !== undefined
              ? formatarNumero(conta.parcela3, sistema)
              : null;
          const simbolo = obterSimboloOperacao(conta.tipo);

          // Criar uma chave única baseada no conteúdo da conta para ajudar o React a detectar mudanças
          const contaKey = `${conta.parcela1}-${conta.parcela2}-${
            conta.parcela3 || "null"
          }-${conta.resultado}-${conta.tipo}-${index}`;

          return (
            <React.Fragment key={contaKey}>
              {index === 1 && (
                <div className="lista-contas-divisor">
                  <span className="divisor-texto">Próxima:</span>
                </div>
              )}
              <div
                className={`conta-item ${isAtual ? "atual" : ""} ${
                  index === 0 && contaAtualIndex === 0 ? "" : ""
                }`}
              >
                <div className="conta-expressao">
                  {conta.tipo === "raiz" ? (
                    <span className="expressao-raiz">
                      <span className="simbolo-raiz">{simbolo}</span>
                      <span className="numero-raiz">{parcela1Formatada}</span>
                    </span>
                  ) : (
                    <>
                      <span className="parcela">{parcela1Formatada}</span>
                      <span className="operador">{simbolo}</span>
                      <span className="parcela">{parcela2Formatada}</span>
                      {parcela3Formatada !== null && (
                        <>
                          <span className="operador">{simbolo}</span>
                          <span className="parcela">{parcela3Formatada}</span>
                        </>
                      )}
                    </>
                  )}
                  <span className="igual">=</span>
                  <input
                    key={contaKey}
                    ref={(el) => {
                      if (el) {
                        inputRefs.current[index] = el;
                        // Focar automaticamente se este é o input atual
                        if (index === contaAtualIndex && !disabled) {
                          setTimeout(() => {
                            el.focus();
                          }, 50);
                        }
                      } else {
                        // Limpar ref quando o componente é desmontado
                        delete inputRefs.current[index];
                      }
                    }}
                    autoFocus={index === contaAtualIndex && !disabled}
                    type="text"
                    inputMode={sistema === "romano" ? "text" : "numeric"}
                    pattern={sistema === "natural" ? "[0-9]*" : sistema === "binario" ? "[01]*" : undefined}
                    className="conta-input-resultado"
                    disabled={disabled || index !== contaAtualIndex}
                    onChange={(e) => handleChange(conta, index, e)}
                    onKeyDown={handleKeyDown}
                    placeholder="?"
                    autoComplete="off"
                    defaultValue=""
                    aria-label={`Resultado da conta ${index + 1}`}
                  />
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ListaContas;
