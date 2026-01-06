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
  // Função para formatar parcela com parênteses se for negativa (para parcelas 2 e 3)
  const formatarParcelaComParenteses = (valorNumerico, valorFormatado) => {
    if (valorNumerico === null || valorNumerico === undefined) {
      return valorFormatado;
    }
    // Se o valor numérico for negativo, adicionar parênteses
    if (valorNumerico < 0) {
      return `(${valorFormatado})`;
    }
    return valorFormatado;
  };
  const listaRef = useRef(null);
  const inputRefs = useRef({});
  const contaProcessandoRef = useRef(null); // ID da conta que já foi processada
  const ultimaPrimeiraContaRef = useRef(null); // ID da última primeira conta para detectar mudanças reais
  const estadoValidacaoRef = useRef({}); // Estado de validação visual por input (index -> "errado" | null)
  const contaComErroRef = useRef(null); // ID da conta que teve erro (para manter caixa vermelha)

  // Ref para manter o foco ativo durante o treino
  const manterFocoRef = useRef(false);

  // Limpar input quando a conta atual mudar (para input fixo)
  useEffect(() => {
    if (contas.length > 0 && contas[0] && contaAtualIndex === 0) {
      const primeiraContaId = `${contas[0].parcela1}-${contas[0].parcela2}-${
        contas[0].parcela3 || "null"
      }-${contas[0].resultado}-${contas[0].tipo}`;

      // Se a conta mudou, limpar o input (similar ao que fazemos quando há erro)
      if (ultimaPrimeiraContaRef.current !== primeiraContaId && ultimaPrimeiraContaRef.current !== null) {
        const inputRef = inputRefs.current[0];
        if (inputRef && !disabled) {
          // Limpar valor do input e remover classe de erro
          inputRef.value = "";
          inputRef.classList.remove("errado");
        }
      }
    }
  }, [contas, contaAtualIndex, disabled]);

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
        contaComErroRef.current = null; // Limpar estado de erro quando a conta muda
        ultimaPrimeiraContaRef.current = primeiraContaId;
      } else {
        // Se a conta ID é a mesma mas a lista mudou (por exemplo, mesmo valor mas nova instância),
        // também devemos resetar para permitir resposta novamente
        // Resetar apenas se não estiver processando (para evitar resetar no meio de uma validação)
        if (!disabled) {
          contaProcessandoRef.current = null;
          // Não limpar contaComErroRef aqui - manter erro visível até acertar
        }
      }
    }

    // Ativar manutenção de foco quando não estiver desabilitado
    manterFocoRef.current = !disabled;

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
    }, 100);

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
      if (sistema === "natural" || sistema === "inteiro") {
        respostaEsperadaFormatada = resultadoEsperado.toString();
        const respostaNumero = parseInt(respostaDigitada.trim(), 10);
        if (isNaN(respostaNumero)) return false;
        return respostaNumero === resultadoEsperado;
      } else if (sistema === "decimal") {
        respostaEsperadaFormatada = formatarNumero(resultadoEsperado, "decimal");
        const respostaComPonto = respostaDigitada.trim().replace(",", ".");
        const respostaNumero = parseFloat(respostaComPonto);
        if (isNaN(respostaNumero)) return false;
        const diferenca = Math.abs(respostaNumero - resultadoEsperado);
        return diferenca < 0.001; // Tolerância de 0.001
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
      } else if (sistema === "hexadecimal") {
        respostaEsperadaFormatada = formatarNumero(
          resultadoEsperado,
          "hexadecimal"
        );
        const respostaUpper = respostaDigitada.trim().toUpperCase();
        if (!/^[0-9A-F]+$/.test(respostaUpper)) return false;
        return respostaUpper === respostaEsperadaFormatada.toUpperCase();
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
    } else if (sistema === "inteiro") {
      // Números com sinal de menos permitido (apenas no início)
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
      valorFiltrado = novoValor.toUpperCase().replace(/[^IVXLCDM]/g, "");
    } else if (sistema === "binario") {
      valorFiltrado = novoValor.replace(/[^01]/g, "");
    } else if (sistema === "hexadecimal") {
      // Apenas dígitos 0-9 e letras A-F (case insensitive)
      valorFiltrado = novoValor.toUpperCase().replace(/[^0-9A-F]/g, "");
    }

    // Atualizar valor do input
    e.target.value = valorFiltrado;

    // ID da conta atual para rastrear erros
    const contaId = `${conta.parcela1}-${conta.parcela2}-${
      conta.parcela3 || "null"
    }-${conta.resultado}-${conta.tipo}`;

    // Verificar se esta conta já teve erro anteriormente (manter caixa vermelha)
    const contaTeveErro = contaComErroRef.current === contaId;
    if (contaTeveErro && valorFiltrado === "") {
      // Se a conta teve erro e o campo está vazio, manter a caixa vermelha
      e.target.classList.add("errado");
    }

    // Validar localmente para feedback visual
    const resultadoEsperado = conta.resultado;
    let respostaEsperadaFormatada;
    let detectouErro = false;

    try {
      if (sistema === "natural" || sistema === "inteiro") {
        respostaEsperadaFormatada = resultadoEsperado.toString();
        const respostaNormalizada = valorFiltrado.trim();
        const respostaNumero = parseInt(respostaNormalizada, 10);

        if (!isNaN(respostaNumero)) {
          // Calcular tamanho do valor absoluto (sem contar o sinal de menos)
          const tamanhoAbsolutoEsperado = Math.abs(resultadoEsperado).toString().length;
          const tamanhoAbsolutoResposta = Math.abs(respostaNumero).toString().length;

          // Validar quando o tamanho do valor absoluto for igual ao esperado
          if (tamanhoAbsolutoResposta === tamanhoAbsolutoEsperado) {
            const correto = respostaNumero === resultadoEsperado;
            if (!correto) {
              detectouErro = true;
            } else {
              // Atualizar estado visual - acertou
              estadoValidacaoRef.current[index] = null;
              e.target.classList.remove("errado");
              contaComErroRef.current = null; // Limpar estado de erro ao acertar
            }
          } else if (tamanhoAbsolutoResposta < tamanhoAbsolutoEsperado) {
            // Ainda digitando - manter vermelho se já teve erro, senão limpar
            estadoValidacaoRef.current[index] = contaTeveErro ? "errado" : null;
            if (contaTeveErro) {
              e.target.classList.add("errado");
            } else {
              e.target.classList.remove("errado");
            }
          } else {
            // Tamanho maior que esperado, já está errado
            detectouErro = true;
          }
        } else if (valorFiltrado !== "" && valorFiltrado !== "-") {
          // Resposta inválida (não é número), manter estado anterior
          if (contaTeveErro) {
            e.target.classList.add("errado");
          }
        } else {
          // Campo vazio ou apenas "-", manter vermelho se já teve erro
          if (contaTeveErro) {
            e.target.classList.add("errado");
          } else {
            e.target.classList.remove("errado");
          }
        }
      } else if (sistema === "decimal") {
        respostaEsperadaFormatada = formatarNumero(resultadoEsperado, "decimal");
        const respostaNormalizada = valorFiltrado.trim();
        const respostaComPonto = respostaNormalizada.replace(",", ".");
        const respostaNumero = parseFloat(respostaComPonto);

        if (!isNaN(respostaNumero) && respostaNormalizada.length > 0) {
          // Para decimal, validar quando tiver pelo menos o tamanho mínimo esperado
          // Comparar com tolerância para erros de ponto flutuante
          const diferenca = Math.abs(respostaNumero - resultadoEsperado);
          const correto = diferenca < 0.001; // Tolerância de 0.001
          
          // Calcular tamanho esperado (número de dígitos significativos)
          const tamanhoEsperado = respostaEsperadaFormatada.length;
          const tamanhoAtual = respostaNormalizada.length;
          
          // Se já digitou o suficiente para validar (tem pelo menos o tamanho esperado)
          if (tamanhoAtual >= tamanhoEsperado) {
            if (correto) {
              estadoValidacaoRef.current[index] = null;
              e.target.classList.remove("errado");
              contaComErroRef.current = null;
            } else {
              detectouErro = true;
            }
          } else {
            // Ainda está digitando - manter vermelho se já teve erro
            estadoValidacaoRef.current[index] = contaTeveErro ? "errado" : null;
            if (contaTeveErro) {
              e.target.classList.add("errado");
            } else {
              e.target.classList.remove("errado");
            }
          }
        } else if (respostaNormalizada !== "" && respostaNormalizada !== "." && respostaNormalizada !== ",") {
          // Resposta inválida (não é número), manter estado anterior
          if (contaTeveErro) {
            e.target.classList.add("errado");
          }
        } else {
          // Campo vazio ou apenas ponto/vírgula, manter vermelho se já teve erro
          if (contaTeveErro) {
            e.target.classList.add("errado");
          } else {
            e.target.classList.remove("errado");
          }
        }
      } else if (sistema === "romano") {
        respostaEsperadaFormatada = formatarNumero(resultadoEsperado, "romano");
        const tamanhoEsperado = respostaEsperadaFormatada.length;
        const respostaNormalizada = valorFiltrado.trim().toUpperCase();

        if (respostaNormalizada.length === tamanhoEsperado) {
          const correto =
            respostaNormalizada === respostaEsperadaFormatada.toUpperCase();
          if (!correto) {
            detectouErro = true;
          } else {
            estadoValidacaoRef.current[index] = null;
            e.target.classList.remove("errado");
            contaComErroRef.current = null;
          }
        } else if (respostaNormalizada.length < tamanhoEsperado) {
          estadoValidacaoRef.current[index] = contaTeveErro ? "errado" : null;
          if (contaTeveErro) {
            e.target.classList.add("errado");
          } else {
            e.target.classList.remove("errado");
          }
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
            if (!correto) {
              detectouErro = true;
            } else {
              estadoValidacaoRef.current[index] = null;
              e.target.classList.remove("errado");
              contaComErroRef.current = null;
            }
          } else {
            detectouErro = true;
          }
        } else if (respostaNormalizada.length < tamanhoEsperado) {
          estadoValidacaoRef.current[index] = contaTeveErro ? "errado" : null;
          if (contaTeveErro) {
            e.target.classList.add("errado");
          } else {
            e.target.classList.remove("errado");
          }
        }
      } else if (sistema === "hexadecimal") {
        respostaEsperadaFormatada = formatarNumero(
          resultadoEsperado,
          "hexadecimal"
        );
        const tamanhoEsperado = respostaEsperadaFormatada.length;
        const respostaNormalizada = valorFiltrado.trim().toUpperCase();

        if (respostaNormalizada.length === tamanhoEsperado) {
          if (/^[0-9A-F]+$/.test(respostaNormalizada)) {
            const correto = respostaNormalizada === respostaEsperadaFormatada.toUpperCase();
            if (!correto) {
              detectouErro = true;
            } else {
              estadoValidacaoRef.current[index] = null;
              e.target.classList.remove("errado");
              contaComErroRef.current = null;
            }
          } else {
            detectouErro = true;
          }
        } else if (respostaNormalizada.length < tamanhoEsperado) {
          estadoValidacaoRef.current[index] = contaTeveErro ? "errado" : null;
          if (contaTeveErro) {
            e.target.classList.add("errado");
          } else {
            e.target.classList.remove("errado");
          }
        }
      }

      // Se detectou erro, limpar o campo e marcar que a conta teve erro
      if (detectouErro) {
        estadoValidacaoRef.current[index] = "errado";
        contaComErroRef.current = contaId;
        
        // Limpar o campo mas manter a caixa vermelha
        e.target.value = "";
        e.target.classList.add("errado");
        
        // Manter o foco no input
        const inputElement = e.target;
        requestAnimationFrame(() => {
          if (inputElement && manterFocoRef.current && !disabled) {
            inputElement.focus();
          }
        });
        
        return; // Não processar mais, aguardar nova tentativa
      }
    } catch (error) {
      // Ignorar erros de formatação
    }

    // Só processar se ainda estamos na conta atual e ela ainda não foi processada
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
      contaComErroRef.current = null; // Limpar estado de erro ao acertar
      e.target.classList.remove("errado");
      
      // Manter o foco antes de limpar o input
      const inputElement = e.target;
      
      // Limpar input mas manter foco imediatamente
      inputElement.value = "";
      
      // Chamar callback - o backend fará a validação final
      // Chamar diretamente (o handleAcerto já tem proteção contra múltiplas chamadas)
      if (onAcerto) {
        onAcerto(valorFiltrado);
      }

      // Restaurar foco após limpar
      if (inputElement && manterFocoRef.current && !disabled) {
        setTimeout(() => {
          if (inputElement && manterFocoRef.current && !disabled) {
            inputElement.focus();
          }
        }, 50);
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
          // Para divisão com sistema decimal, divisores (parcela2 e parcela3) devem aparecer como inteiros
          const formatarParcelaDivisao = (valor, sistema, tipo) => {
            if (tipo === "divisao" && sistema === "decimal" && Number.isInteger(valor)) {
              return valor.toString();
            }
            return formatarNumero(valor, sistema);
          };
          const parcela2Formatada =
            conta.parcela2 !== null && conta.parcela2 !== undefined
              ? formatarParcelaComParenteses(
                  conta.parcela2,
                  formatarParcelaDivisao(conta.parcela2, sistema, conta.tipo)
                )
              : "";
          const parcela3Formatada =
            conta.parcela3 !== null && conta.parcela3 !== undefined
              ? formatarParcelaComParenteses(
                  conta.parcela3,
                  formatarParcelaDivisao(conta.parcela3, sistema, conta.tipo)
                )
              : null;
          const simbolo = obterSimboloOperacao(conta.tipo);

          // Criar uma chave única baseada no conteúdo da conta para ajudar o React a detectar mudanças
          // Para a conta atual (index 0), usar key fixa para evitar remontagem do input
          const contaKey = index === contaAtualIndex 
            ? "conta-atual-fixa"
            : `${conta.parcela1}-${conta.parcela2}-${
                conta.parcela3 || "null"
              }-${conta.resultado}-${conta.tipo}-${index}`;

          // Verificar se esta conta teve erro (para manter caixa vermelha)
          const contaIdRender = `${conta.parcela1}-${conta.parcela2}-${
            conta.parcela3 || "null"
          }-${conta.resultado}-${conta.tipo}`;
          const contaTeveErroRender = contaComErroRef.current === contaIdRender && index === contaAtualIndex;

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
                    key={index === contaAtualIndex ? "input-atual-fixo" : contaKey}
                    ref={(el) => {
                      if (el) {
                        inputRefs.current[index] = el;
                        // Focar automaticamente se este é o input atual
                        if (index === contaAtualIndex && !disabled) {
                          setTimeout(() => {
                            el.focus();
                          }, 50);
                        }
                        // Adicionar classe errado se a conta teve erro
                        if (contaTeveErroRender) {
                          el.classList.add("errado");
                        }
                      } else {
                        // Limpar ref quando o componente é desmontado
                        delete inputRefs.current[index];
                      }
                    }}
                    autoFocus={index === contaAtualIndex && !disabled}
                    type="text"
                    inputMode={sistema === "romano" || sistema === "hexadecimal" ? "text" : "numeric"}
                    pattern={sistema === "natural" ? "[0-9]*" : sistema === "inteiro" ? "-?[0-9]*" : sistema === "decimal" ? "[0-9]*[.,]?[0-9]*" : sistema === "binario" ? "[01]*" : sistema === "hexadecimal" ? "[0-9A-Fa-f]*" : undefined}
                    className={`conta-input-resultado${contaTeveErroRender ? " errado" : ""}`}
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
