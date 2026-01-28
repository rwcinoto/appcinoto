import React, { useEffect, useRef, useState } from "react";
import {
  formatarNumero,
  obterSimboloOperacao,
} from "../../utils/conversaoNumerica";
import "./ListaContas.css";
import TecladoVirtual from "./TecladoVirtual";

const ListaContas = ({
  contas,
  sistema,
  formatoResposta = "sistema",
  contaAtualIndex = 0,
  onAcerto,
  onErro,
  disabled = false,
}) => {
  // Determinar sistema de entrada baseado no formato escolhido
  const sistemaEntrada = formatoResposta === "natural" ? "natural" : sistema;
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

  // Detectar se está em mobile
  const [isMobile, setIsMobile] = useState(() => {
    return window.innerWidth <= 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Limpar input quando a conta atual mudar (para input fixo)
  useEffect(() => {
    if (contas.length > 0 && contas[0] && contaAtualIndex === 0) {
      const primeiraContaId = `${contas[0].parcela1}-${contas[0].parcela2}-${
        contas[0].parcela3 || "null"
      }-${contas[0].resultado}-${contas[0].tipo}`;

      // Se a conta mudou, limpar o input (similar ao que fazemos quando há erro)
      if (
        ultimaPrimeiraContaRef.current !== primeiraContaId &&
        ultimaPrimeiraContaRef.current !== null
      ) {
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
      // Usar sistemaEntrada para validação (pode ser "natural" mesmo se sistema for romano/hex)
      if (sistemaEntrada === "natural" || sistemaEntrada === "inteiro") {
        respostaEsperadaFormatada = resultadoEsperado.toString();
        const respostaNumero = parseInt(respostaDigitada.trim(), 10);
        if (isNaN(respostaNumero)) return false;
        return respostaNumero === resultadoEsperado;
      } else if (sistemaEntrada === "decimal") {
        respostaEsperadaFormatada = formatarNumero(
          resultadoEsperado,
          "decimal",
        );
        const respostaComPonto = respostaDigitada.trim().replace(",", ".");
        const respostaNumero = parseFloat(respostaComPonto);
        if (isNaN(respostaNumero)) return false;
        const diferenca = Math.abs(respostaNumero - resultadoEsperado);
        return diferenca < 0.001; // Tolerância de 0.001
      } else if (sistemaEntrada === "romano") {
        respostaEsperadaFormatada = formatarNumero(resultadoEsperado, "romano");
        const respostaUpper = respostaDigitada.trim().toUpperCase();
        const esperadoUpper = respostaEsperadaFormatada.toUpperCase();
        return respostaUpper === esperadoUpper;
      } else if (sistemaEntrada === "binario") {
        respostaEsperadaFormatada = formatarNumero(
          resultadoEsperado,
          "binario",
        );
        if (!/^[01]+$/.test(respostaDigitada.trim())) return false;
        return respostaDigitada.trim() === respostaEsperadaFormatada;
      } else if (sistemaEntrada === "hexadecimal") {
        respostaEsperadaFormatada = formatarNumero(
          resultadoEsperado,
          "hexadecimal",
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
    // Validar que o evento é confiável (não foi disparado por script)
    if (!e.isTrusted) {
      return;
    }
    const novoValor = e.target.value;

    // Filtrar entrada conforme o sistema de entrada (pode ser natural mesmo se sistema for romano/hex)
    let valorFiltrado = novoValor;

    if (sistemaEntrada === "natural") {
      valorFiltrado = novoValor.replace(/[^0-9]/g, "");
    } else if (sistemaEntrada === "inteiro") {
      // Números com sinal de menos permitido (apenas no início)
      if (novoValor === "-") {
        valorFiltrado = "-";
      } else if (novoValor.startsWith("-")) {
        valorFiltrado = "-" + novoValor.slice(1).replace(/[^0-9]/g, "");
      } else {
        valorFiltrado = novoValor.replace(/[^0-9]/g, "");
      }
    } else if (sistemaEntrada === "decimal") {
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
    } else if (sistemaEntrada === "romano") {
      valorFiltrado = novoValor.toUpperCase().replace(/[^IVXLCDM]/g, "");
    } else if (sistemaEntrada === "binario") {
      valorFiltrado = novoValor.replace(/[^01]/g, "");
    } else if (sistemaEntrada === "hexadecimal") {
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
      if (sistemaEntrada === "natural" || sistemaEntrada === "inteiro") {
        respostaEsperadaFormatada = resultadoEsperado.toString();
        const respostaNormalizada = valorFiltrado.trim();

        // Verificar se resultado é negativo
        const resultadoNegativo = resultadoEsperado < 0;
        const esperado = String(resultadoEsperado);

        // Se campo está vazio
        if (respostaNormalizada === "") {
          if (contaTeveErro) {
            e.target.classList.add("errado");
          } else {
            e.target.classList.remove("errado");
          }
        }
        // Se usuário digitou apenas "-"
        else if (respostaNormalizada === "-") {
          // Se resultado é positivo, erro imediato (digitou "-" quando não deveria)
          if (!resultadoNegativo) {
            detectouErro = true;
          } else {
            // Resultado é negativo, permitir "-" (ainda está digitando)
            if (contaTeveErro) {
              e.target.classList.add("errado");
            } else {
              e.target.classList.remove("errado");
            }
          }
        } else {
          // Validar caractere por caractere - qualquer caractere errado detecta erro imediato
          const tamanhoDigitado = respostaNormalizada.length;
          const tamanhoEsperado = esperado.length;

          // Se resultado é negativo e usuário não digitou "-" no início, erro
          if (resultadoNegativo && !respostaNormalizada.startsWith("-")) {
            detectouErro = true;
          }
          // Se resultado é positivo e usuário digitou "-", erro imediato
          else if (!resultadoNegativo && respostaNormalizada.startsWith("-")) {
            detectouErro = true;
          }
          // Se digitou mais caracteres que o esperado, erro
          else if (tamanhoDigitado > tamanhoEsperado) {
            detectouErro = true;
          } else {
            // Comparar caractere por caractere - qualquer diferença é erro imediato
            let caractereErrado = false;
            for (let i = 0; i < tamanhoDigitado; i++) {
              if (respostaNormalizada.charAt(i) !== esperado.charAt(i)) {
                caractereErrado = true;
                break;
              }
            }

            if (caractereErrado) {
              detectouErro = true;
            } else if (tamanhoDigitado === tamanhoEsperado) {
              // Tamanho igual e todos caracteres corretos = acertou
              estadoValidacaoRef.current[index] = null;
              e.target.classList.remove("errado");
              contaComErroRef.current = null;
            } else {
              // Ainda está digitando e tudo certo até agora
              estadoValidacaoRef.current[index] = contaTeveErro
                ? "errado"
                : null;
              if (contaTeveErro) {
                e.target.classList.add("errado");
              } else {
                e.target.classList.remove("errado");
              }
            }
          }
        }
      } else if (sistemaEntrada === "decimal") {
        respostaEsperadaFormatada = formatarNumero(
          resultadoEsperado,
          "decimal",
        );
        const respostaNormalizada = valorFiltrado.trim();

        // Se campo está vazio, limpar estado
        if (respostaNormalizada === "") {
          if (contaTeveErro) {
            e.target.classList.add("errado");
          } else {
            e.target.classList.remove("errado");
          }
        }
        // Se usuário digitou apenas vírgula
        else if (respostaNormalizada === ",") {
          // Se a resposta esperada não começa com vírgula (começa com número), erro imediato
          // respostaEsperadaFormatada sempre começa com número (ex: "5,34"), nunca com vírgula
          if (!respostaEsperadaFormatada.startsWith(",")) {
            detectouErro = true;
          } else {
            // Caso raro: resposta esperada começa com vírgula (permitir)
            if (contaTeveErro) {
              e.target.classList.add("errado");
            } else {
              e.target.classList.remove("errado");
            }
          }
        } else {
          // Comparar caractere por caractere (usando vírgula como padrão brasileiro)
          // respostaEsperadaFormatada já vem com vírgula da função formatarNumero
          const tamanhoDigitado = respostaNormalizada.length;
          const tamanhoEsperado = respostaEsperadaFormatada.length;

          if (tamanhoDigitado > tamanhoEsperado) {
            detectouErro = true;
          } else {
            let caractereErrado = false;
            for (let i = 0; i < tamanhoDigitado; i++) {
              if (
                respostaNormalizada.charAt(i) !==
                respostaEsperadaFormatada.charAt(i)
              ) {
                caractereErrado = true;
                break;
              }
            }

            if (caractereErrado) {
              detectouErro = true;
            } else if (tamanhoDigitado === tamanhoEsperado) {
              // Validar valor numérico para confirmar (convertendo vírgula para ponto para parseFloat)
              const respostaComPonto = respostaNormalizada.replace(",", ".");
              const respostaNumero = parseFloat(respostaComPonto);
              if (!isNaN(respostaNumero)) {
                const diferenca = Math.abs(respostaNumero - resultadoEsperado);
                if (diferenca < 0.001) {
                  // Acertou
                  estadoValidacaoRef.current[index] = null;
                  e.target.classList.remove("errado");
                  contaComErroRef.current = null;
                } else {
                  detectouErro = true;
                }
              } else {
                detectouErro = true;
              }
            } else {
              // Ainda digitando
              estadoValidacaoRef.current[index] = contaTeveErro
                ? "errado"
                : null;
              if (contaTeveErro) {
                e.target.classList.add("errado");
              } else {
                e.target.classList.remove("errado");
              }
            }
          }
        }
      } else if (sistemaEntrada === "romano") {
        respostaEsperadaFormatada = formatarNumero(resultadoEsperado, "romano");
        const esperadoUpper = respostaEsperadaFormatada.toUpperCase();
        const respostaNormalizada = valorFiltrado.trim().toUpperCase();

        if (respostaNormalizada === "") {
          if (contaTeveErro) {
            e.target.classList.add("errado");
          } else {
            e.target.classList.remove("errado");
          }
        } else {
          // Comparar caractere por caractere
          const tamanhoDigitado = respostaNormalizada.length;
          const tamanhoEsperado = esperadoUpper.length;

          if (tamanhoDigitado > tamanhoEsperado) {
            detectouErro = true;
          } else {
            let caractereErrado = false;
            for (let i = 0; i < tamanhoDigitado; i++) {
              if (respostaNormalizada.charAt(i) !== esperadoUpper.charAt(i)) {
                caractereErrado = true;
                break;
              }
            }

            if (caractereErrado) {
              detectouErro = true;
            } else if (tamanhoDigitado === tamanhoEsperado) {
              // Acertou
              estadoValidacaoRef.current[index] = null;
              e.target.classList.remove("errado");
              contaComErroRef.current = null;
            } else {
              // Ainda digitando
              estadoValidacaoRef.current[index] = contaTeveErro
                ? "errado"
                : null;
              if (contaTeveErro) {
                e.target.classList.add("errado");
              } else {
                e.target.classList.remove("errado");
              }
            }
          }
        }
      } else if (sistemaEntrada === "binario") {
        respostaEsperadaFormatada = formatarNumero(
          resultadoEsperado,
          "binario",
        );
        const respostaNormalizada = valorFiltrado.trim();

        if (respostaNormalizada === "") {
          if (contaTeveErro) {
            e.target.classList.add("errado");
          } else {
            e.target.classList.remove("errado");
          }
        } else {
          // Comparar caractere por caractere
          const tamanhoDigitado = respostaNormalizada.length;
          const tamanhoEsperado = respostaEsperadaFormatada.length;

          if (tamanhoDigitado > tamanhoEsperado) {
            detectouErro = true;
          } else {
            let caractereErrado = false;
            for (let i = 0; i < tamanhoDigitado; i++) {
              if (
                respostaNormalizada.charAt(i) !==
                respostaEsperadaFormatada.charAt(i)
              ) {
                caractereErrado = true;
                break;
              }
            }

            if (caractereErrado) {
              detectouErro = true;
            } else if (tamanhoDigitado === tamanhoEsperado) {
              // Acertou
              estadoValidacaoRef.current[index] = null;
              e.target.classList.remove("errado");
              contaComErroRef.current = null;
            } else {
              // Ainda digitando
              estadoValidacaoRef.current[index] = contaTeveErro
                ? "errado"
                : null;
              if (contaTeveErro) {
                e.target.classList.add("errado");
              } else {
                e.target.classList.remove("errado");
              }
            }
          }
        }
      } else if (sistemaEntrada === "hexadecimal") {
        respostaEsperadaFormatada = formatarNumero(
          resultadoEsperado,
          "hexadecimal",
        );
        const esperadoUpper = respostaEsperadaFormatada.toUpperCase();
        const respostaNormalizada = valorFiltrado.trim().toUpperCase();

        if (respostaNormalizada === "") {
          if (contaTeveErro) {
            e.target.classList.add("errado");
          } else {
            e.target.classList.remove("errado");
          }
        } else {
          // Comparar caractere por caractere
          const tamanhoDigitado = respostaNormalizada.length;
          const tamanhoEsperado = esperadoUpper.length;

          if (tamanhoDigitado > tamanhoEsperado) {
            detectouErro = true;
          } else {
            let caractereErrado = false;
            for (let i = 0; i < tamanhoDigitado; i++) {
              if (respostaNormalizada.charAt(i) !== esperadoUpper.charAt(i)) {
                caractereErrado = true;
                break;
              }
            }

            if (caractereErrado) {
              detectouErro = true;
            } else if (tamanhoDigitado === tamanhoEsperado) {
              // Acertou
              estadoValidacaoRef.current[index] = null;
              e.target.classList.remove("errado");
              contaComErroRef.current = null;
            } else {
              // Ainda digitando
              estadoValidacaoRef.current[index] = contaTeveErro
                ? "errado"
                : null;
              if (contaTeveErro) {
                e.target.classList.add("errado");
              } else {
                e.target.classList.remove("errado");
              }
            }
          }
        }
      }

      // Se detectou erro, limpar o campo e marcar que a conta teve erro
      if (detectouErro) {
        estadoValidacaoRef.current[index] = "errado";
        contaComErroRef.current = contaId;

        // Incrementar contador de erros
        if (onErro) {
          onErro();
        }

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
    // Validar que o evento é confiável (não foi disparado por script)
    if (!e.isTrusted) {
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  // Handler para teclado virtual
  const handleTecladoVirtualKeyPress = (evento) => {
    const inputAtual = inputRefs.current[contaAtualIndex];
    if (!inputAtual || disabled || contaAtualIndex >= contas.length) {
      return;
    }

    const conta = contas[contaAtualIndex];
    if (!conta) return;

    // Simular evento de digitação
    if (evento.key === "Backspace") {
      // Simular backspace: remover último caractere
      const valorAtual = inputAtual.value;
      const novoValor = valorAtual.slice(0, -1);

      // Atualizar valor diretamente no input
      inputAtual.value = novoValor;

      // Criar evento sintético de mudança que será tratado pelo handleChange
      const eventoChange = {
        ...evento,
        target: inputAtual,
        isTrusted: true,
      };

      // Disparar evento de mudança manualmente
      Object.defineProperty(eventoChange, "target", {
        value: inputAtual,
        writable: false,
      });

      handleChange(conta, contaAtualIndex, eventoChange);
    } else {
      // Simular digitação de caractere: adicionar ao valor atual
      const valorAtual = inputAtual.value;
      const novoValor = valorAtual + evento.key;

      // Atualizar valor diretamente no input
      inputAtual.value = novoValor;

      // Criar evento sintético de mudança que será tratado pelo handleChange
      const eventoChange = {
        ...evento,
        target: inputAtual,
        isTrusted: true,
      };

      // Disparar evento de mudança manualmente
      Object.defineProperty(eventoChange, "target", {
        value: inputAtual,
        writable: false,
      });

      handleChange(conta, contaAtualIndex, eventoChange);
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

          // Para conversão, ajustar formato de parcela1 baseado em formatoResposta
          // Se formato_resposta = "natural": mostrar número no sistema escolhido
          // Se formato_resposta = "sistema": mostrar número em natural
          // Para multiplicação com sistema decimal: parcela1 sempre é natural (sem vírgula)
          let parcela1Formatada;
          if (conta.tipo === "conversao") {
            if (formatoResposta === "natural") {
              // Mostrar número no sistema escolhido, usuário responde em natural
              parcela1Formatada = formatarNumero(conta.parcela1, sistema);
            } else {
              // Mostrar número em natural, usuário responde no sistema escolhido
              parcela1Formatada = formatarNumero(conta.parcela1, "natural");
            }
          } else if (conta.tipo === "multiplicacao" && sistema === "decimal") {
            // Para multiplicação com sistema decimal: parcela1 é natural (sem vírgula)
            // O backend já envia a parcela1 como inteira
            parcela1Formatada = conta.parcela1.toString();
          } else {
            parcela1Formatada = formatarNumero(conta.parcela1, sistema);
          }

          // Na operação de raiz, parcela2 pode ser null
          // Para divisão com sistema decimal, divisores (parcela2 e parcela3) devem aparecer como inteiros
          const formatarParcelaDivisao = (valor, sistema, tipo) => {
            if (
              tipo === "divisao" &&
              sistema === "decimal" &&
              Number.isInteger(valor)
            ) {
              return valor.toString();
            }
            return formatarNumero(valor, sistema);
          };

          // Para multiplicação com sistema decimal:
          // - Se 2 parcelas: primeira é natural, segunda é decimal
          // - Se 3 parcelas: primeira e segunda são naturais, terceira é decimal
          const formatarParcelaMultiplicacao = (
            valor,
            sistema,
            tipo,
            numeroParcela,
            temParcela3,
          ) => {
            if (tipo === "multiplicacao" && sistema === "decimal") {
              if (temParcela3) {
                // 3 parcelas: parcela1 e parcela2 são naturais, parcela3 é decimal
                // O backend já envia parcela1 e parcela2 como inteiras
                if (numeroParcela === 1 || numeroParcela === 2) {
                  return valor.toString(); // Natural (sem vírgula)
                } else if (numeroParcela === 3) {
                  return formatarNumero(valor, "decimal"); // Decimal (com vírgula)
                }
              } else {
                // 2 parcelas: parcela1 é natural, parcela2 é decimal
                // O backend já envia parcela1 como inteira
                if (numeroParcela === 1) {
                  return valor.toString(); // Natural (sem vírgula)
                } else if (numeroParcela === 2) {
                  return formatarNumero(valor, "decimal"); // Decimal (com vírgula)
                }
              }
            }
            // Para outros casos, usar formatação normal (divisão ou outros sistemas)
            return formatarParcelaDivisao(valor, sistema, tipo);
          };

          const temParcela3 =
            conta.parcela3 !== null && conta.parcela3 !== undefined;
          const parcela2Formatada =
            conta.parcela2 !== null && conta.parcela2 !== undefined
              ? formatarParcelaComParenteses(
                  conta.parcela2,
                  formatarParcelaMultiplicacao(
                    conta.parcela2,
                    sistema,
                    conta.tipo,
                    2,
                    temParcela3,
                  ),
                )
              : "";
          const parcela3Formatada =
            conta.parcela3 !== null && conta.parcela3 !== undefined
              ? formatarParcelaComParenteses(
                  conta.parcela3,
                  formatarParcelaMultiplicacao(
                    conta.parcela3,
                    sistema,
                    conta.tipo,
                    3,
                    temParcela3,
                  ),
                )
              : null;
          const simbolo = obterSimboloOperacao(conta.tipo);

          // Criar uma chave única baseada no conteúdo da conta para ajudar o React a detectar mudanças
          // Para a conta atual (index 0), usar key fixa para evitar remontagem do input
          const contaKey =
            index === contaAtualIndex
              ? "conta-atual-fixa"
              : `${conta.parcela1}-${conta.parcela2}-${
                  conta.parcela3 || "null"
                }-${conta.resultado}-${conta.tipo}-${index}`;

          // Verificar se esta conta teve erro (para manter caixa vermelha)
          const contaIdRender = `${conta.parcela1}-${conta.parcela2}-${
            conta.parcela3 || "null"
          }-${conta.resultado}-${conta.tipo}`;
          const contaTeveErroRender =
            contaComErroRef.current === contaIdRender &&
            index === contaAtualIndex;

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
                  ) : conta.tipo === "conversao" ? (
                    // Para conversão, mostrar apenas parcela1 (número a converter)
                    <span className="parcela">{parcela1Formatada}</span>
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
                  {index !== 1 && (
                    <>
                      <span className="igual">=</span>
                      <input
                        key={
                          index === contaAtualIndex
                            ? "input-atual-fixo"
                            : contaKey
                        }
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
                        autoFocus={
                          index === contaAtualIndex && !disabled && !isMobile
                        }
                        type="text"
                        inputMode={
                          isMobile
                            ? "none"
                            : sistemaEntrada === "romano" ||
                                sistemaEntrada === "hexadecimal"
                              ? "text"
                              : "numeric"
                        }
                        pattern={
                          sistemaEntrada === "natural"
                            ? "[0-9]*"
                            : sistemaEntrada === "inteiro"
                              ? "-?[0-9]*"
                              : sistemaEntrada === "decimal"
                                ? "[0-9]*[.,]?[0-9]*"
                                : sistemaEntrada === "binario"
                                  ? "[01]*"
                                  : sistemaEntrada === "hexadecimal"
                                    ? "[0-9A-Fa-f]*"
                                    : undefined
                        }
                        className={`conta-input-resultado${contaTeveErroRender ? " errado" : ""}`}
                        disabled={disabled || index !== contaAtualIndex}
                        onFocus={(e) => {
                          // Prevenir foco no mobile para evitar teclado nativo
                          if (isMobile && index === contaAtualIndex) {
                            setTimeout(() => e.target.blur(), 0);
                          }
                        }}
                        onTouchStart={(e) => {
                          // Prevenir teclado nativo ao tocar no input no mobile
                          if (isMobile && index === contaAtualIndex) {
                            e.preventDefault();
                            e.target.blur();
                          }
                        }}
                        onChange={(e) => handleChange(conta, index, e)}
                        onKeyDown={handleKeyDown}
                        placeholder="?"
                        autoComplete="off"
                        defaultValue=""
                        aria-label={`Resultado da conta ${index + 1}`}
                      />
                    </>
                  )}
                </div>
              </div>
              {index === 1 && isMobile && contas.length >= 2 && (
                <TecladoVirtual
                  sistema={sistema}
                  formatoResposta={formatoResposta}
                  onKeyPress={handleTecladoVirtualKeyPress}
                  disabled={disabled}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ListaContas;
