"use strict";

const conversaoService = require("./conversaoService");

/**
 * Service para geração de contas matemáticas e validação de respostas
 */
class TreinoService {
  /**
   * Gerar número aleatório entre min e max (inclusive)
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  numeroAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Aplicar limites do sistema numérico ao número
   * @param {number} numero - Número a limitar
   * @param {string} sistema - Sistema numérico ('natural', 'romano', 'binario', 'inteiro', 'hexadecimal')
   * @returns {number} Número limitado conforme sistema
   */
  aplicarLimiteSistema(numero, sistema) {
    if (sistema === "romano") {
      return Math.min(numero, 3999);
    } else if (sistema === "binario") {
      return Math.min(numero, 2047);
    }
    return numero; // natural, inteiro, decimal e hexadecimal não têm limite (além do limite da operação)
  }

  /**
   * Aplicar sinal negativo aleatoriamente quando sistema é "inteiro"
   * @param {number} numero - Número a processar
   * @param {string} sistema - Sistema numérico
   * @param {boolean} permitirNegativo - Se false, nunca torna negativo (ex: raiz quadrada)
   * @returns {number} Número com sinal aleatório (se sistema for "inteiro" e permitirNegativo for true)
   */
  aplicarSinalAleatorio(numero, sistema, permitirNegativo = true) {
    if (sistema === "inteiro" && permitirNegativo && numero > 0) {
      // 50% de chance de tornar negativo
      return Math.random() < 0.5 ? -numero : numero;
    }
    return numero;
  }

  /**
   * Adicionar duas casas decimais aleatórias a um número (para sistema decimal)
   * @param {number} numero - Número inteiro
   * @param {string} sistema - Sistema numérico
   * @returns {number} Número com duas casas decimais aleatórias (se sistema for "decimal")
   */
  adicionarCasasDecimais(numero, sistema) {
    if (sistema === "decimal") {
      // Gerar número aleatório entre 0 e 99 para as casas decimais
      const casasDecimais = this.numeroAleatorio(0, 99);
      // Dividir por 100 para obter o valor decimal (0.00 a 0.99)
      const parteDecimal = casasDecimais / 100;
      // Adicionar ao número inteiro e arredondar para 2 casas decimais para evitar erros de ponto flutuante
      return Math.round((numero + parteDecimal) * 100) / 100;
    }
    return numero;
  }

  /**
   * Gerar conta matemática conforme tipo de operação
   * @param {object} operacao - Objeto com tipo e limites de parcelas
   * @param {string} sistema - Sistema numérico ('natural', 'romano', 'binario', 'inteiro')
   * @returns {object} { parcela1, parcela2, parcela3, resultado, tipo }
   */
  gerarConta(operacao, sistema = "natural") {
    const {
      tipo,
      min_parcela_1,
      max_parcela_1,
      min_parcela_2,
      max_parcela_2,
      min_parcela_3,
      max_parcela_3,
    } = operacao;

    let parcela1, parcela2, parcela3, resultado;
    const permitirNegativos = sistema === "inteiro" && tipo !== "raiz";

    switch (tipo) {
      case "soma":
        // Para sistema romano, garantir que parcelas não sejam zero
        const minParcela1Soma = sistema === "romano" ? Math.max(1, min_parcela_1) : min_parcela_1;
        const minParcela2Soma = sistema === "romano" ? Math.max(1, min_parcela_2) : min_parcela_2;

        parcela1 = this.numeroAleatorio(minParcela1Soma, max_parcela_1);
        parcela1 = this.aplicarSinalAleatorio(parcela1, sistema, permitirNegativos);
        parcela1 = this.adicionarCasasDecimais(parcela1, sistema);

        parcela2 = this.numeroAleatorio(minParcela2Soma, max_parcela_2);
        parcela2 = this.aplicarSinalAleatorio(parcela2, sistema, permitirNegativos);
        parcela2 = this.adicionarCasasDecimais(parcela2, sistema);

        // Se houver parcela 3, usar
        if (min_parcela_3 !== null && max_parcela_3 !== null) {
          const minParcela3Soma = sistema === "romano" ? Math.max(1, min_parcela_3) : min_parcela_3;
          parcela3 = this.numeroAleatorio(minParcela3Soma, max_parcela_3);
          parcela3 = this.aplicarSinalAleatorio(parcela3, sistema, permitirNegativos);
          parcela3 = this.adicionarCasasDecimais(parcela3, sistema);
          resultado = parcela1 + parcela2 + parcela3;
          // Arredondar resultado para 2 casas decimais se for sistema decimal
          if (sistema === "decimal") {
            resultado = Math.round(resultado * 100) / 100;
          }
        } else {
          parcela3 = null;
          resultado = parcela1 + parcela2;
          // Arredondar resultado para 2 casas decimais se for sistema decimal
          if (sistema === "decimal") {
            resultado = Math.round(resultado * 100) / 100;
          }
        }
        break;

      case "subtracao":
        // Gerar minuendo primeiro, depois subtraendo menor ou igual
        // Para sistema romano, garantir que parcelas não sejam zero
        let minParcela1Subt = sistema === "romano" ? Math.max(1, min_parcela_1) : min_parcela_1;
        
        // Se há 3 parcelas, garantir que parcela1 seja grande o suficiente
        // para subtrair parcela2 e parcela3 e ainda ter resultado >= 0 (ou > 0 para romanos)
        if (min_parcela_3 !== null && max_parcela_3 !== null) {
          if (sistema === "romano") {
            const minParcela2Subt = Math.max(1, min_parcela_2);
            const minParcela3Subt = Math.max(1, min_parcela_3);
            // parcela1 precisa ser pelo menos: minParcela2Subt + minParcela3Subt + 1
            // (para poder subtrair parcela2 e parcela3 e ainda ter resultado positivo)
            const minParcela1Necessario = minParcela2Subt + minParcela3Subt + 1;
            minParcela1Subt = Math.max(minParcela1Subt, minParcela1Necessario);
          } else if (!permitirNegativos) {
            // Para sistemas que não permitem negativos (naturais, decimais, binários, hexadecimais)
            // parcela1 precisa ser pelo menos: min_parcela_2 + min_parcela_3
            // (para poder subtrair parcela2 e parcela3 e ainda ter resultado >= 0)
            const minParcela1Necessario = min_parcela_2 + min_parcela_3;
            minParcela1Subt = Math.max(minParcela1Subt, minParcela1Necessario);
          }
        }
        
        parcela1 = this.numeroAleatorio(minParcela1Subt, max_parcela_1);
        parcela1 = this.aplicarSinalAleatorio(parcela1, sistema, permitirNegativos);
        parcela1 = this.adicionarCasasDecimais(parcela1, sistema);

        // Para sistema decimal, garantir que subtraendo <= minuendo
        // Para sistema inteiro, não precisa garantir que subtraendo <= minuendo
        // Para sistema romano, garantir que subtraendo não seja zero e seja menor que minuendo
        let maxParcela2;
        const minParcela2Subt = sistema === "romano" ? Math.max(1, min_parcela_2) : min_parcela_2;

        // Se há 3 parcelas, garantir que resultadoParcial seja suficiente
        // para subtrair a terceira parcela e ainda ter resultado >= 0 (ou > 0 para romanos)
        if (min_parcela_3 !== null && max_parcela_3 !== null) {
          if (sistema === "romano") {
            const minParcela3Subt = Math.max(1, min_parcela_3);
            // ResultadoParcial precisa ser pelo menos (minParcela3Subt + 1) para poder subtrair
            // parcela3 e ainda ter resultado positivo (não zero)
            // Isso significa: parcela1 - parcela2 >= minParcela3Subt + 1
            // Ou seja: parcela2 <= parcela1 - (minParcela3Subt + 1)
            const parcela1Inteira = Math.abs(parcela1);
            const resultadoParcialMinimo = minParcela3Subt + 1;
            const maxParcela2Para3Parcelas = Math.max(1, parcela1Inteira - resultadoParcialMinimo);
            maxParcela2 = Math.min(max_parcela_2, maxParcela2Para3Parcelas);
            // Garantir que maxParcela2 seja pelo menos 1
            if (maxParcela2 < 1) {
              maxParcela2 = 1;
            }
          } else if (!permitirNegativos) {
            // Para sistemas que não permitem negativos (naturais, decimais, binários, hexadecimais)
            // ResultadoParcial precisa ser pelo menos min_parcela_3 para poder subtrair
            // parcela3 e ainda ter resultado >= 0
            // Isso significa: parcela1 - parcela2 >= min_parcela_3
            // Ou seja: parcela2 <= parcela1 - min_parcela_3
            const parcela1Inteira = sistema === "decimal" ? Math.floor(parcela1) : Math.abs(parcela1);
            const resultadoParcialMinimo = min_parcela_3;
            const maxParcela2Para3Parcelas = parcela1Inteira - resultadoParcialMinimo;
            maxParcela2 = Math.min(max_parcela_2, maxParcela2Para3Parcelas);
            // Garantir que maxParcela2 seja pelo menos min_parcela_2
            if (maxParcela2 < min_parcela_2) {
              maxParcela2 = min_parcela_2;
            }
          } else if (sistema === "decimal") {
            // Para decimal com 3 parcelas, parcela2 pode ter parte inteira igual ou menor que parcela1
            const parcela1Inteira = Math.floor(parcela1);
            maxParcela2 = Math.min(max_parcela_2, parcela1Inteira);
          } else {
            // Para inteiro com 3 parcelas, não precisa limitar (pode ser negativo)
            maxParcela2 = max_parcela_2;
          }
        } else if (sistema === "decimal") {
          // Para decimal, parcela2 pode ter parte inteira igual ou menor que parcela1
          const parcela1Inteira = Math.floor(parcela1);
          maxParcela2 = Math.min(max_parcela_2, parcela1Inteira);
        } else if (sistema === "romano") {
          // Para romano com 2 parcelas, parcela2 deve ser menor que parcela1 (não pode ser igual para evitar zero)
          const parcela1Inteira = Math.abs(parcela1);
          maxParcela2 = Math.min(max_parcela_2, parcela1Inteira - 1);
          // Garantir que maxParcela2 seja pelo menos 1
          if (maxParcela2 < 1) {
            maxParcela2 = 1;
          }
        } else {
          const parcela1Inteira = Math.abs(parcela1);
          maxParcela2 = permitirNegativos
            ? max_parcela_2
            : Math.min(max_parcela_2, parcela1Inteira);
        }

        parcela2 = this.numeroAleatorio(minParcela2Subt, maxParcela2);
        parcela2 = this.aplicarSinalAleatorio(parcela2, sistema, permitirNegativos);
        parcela2 = this.adicionarCasasDecimais(parcela2, sistema);

        // Para sistema decimal, garantir que parcela2 realmente seja <= parcela1
        if (sistema === "decimal" && parcela2 > parcela1) {
          const parteInteiraParcela1 = Math.floor(parcela1);
          const parteInteiraParcela2 = Math.floor(parcela2);

          if (parteInteiraParcela2 < parteInteiraParcela1) {
            // Se parte inteira de parcela2 é menor, não precisa ajustar (já está garantido)
            // Mas se chegou aqui é porque após adicionar casas decimais ficou maior, o que não deveria acontecer
            // Neste caso, mantém parcela2 como está (não deveria acontecer, mas por segurança)
          } else if (parteInteiraParcela2 === parteInteiraParcela1) {
            // Se parte inteira é igual, garantir que parte decimal de parcela2 <= parte decimal de parcela1
            const parteDecimalParcela1 = parcela1 - parteInteiraParcela1;
            // Gerar nova parte decimal que seja <= parteDecimalParcela1
            const maxCasasDecimais = Math.floor(parteDecimalParcela1 * 100);
            const casasDecimais = this.numeroAleatorio(0, maxCasasDecimais);
            parcela2 = Math.round((parteInteiraParcela2 + (casasDecimais / 100)) * 100) / 100;
          } else {
            // Se parte inteira de parcela2 é maior (não deveria acontecer), ajustar
            parcela2 = parcela1;
          }
        }

        if (min_parcela_3 !== null && max_parcela_3 !== null) {
          // Para subtração com 3 parcelas
          let resultadoParcial = parcela1 - parcela2;
          // Arredondar resultadoParcial para 2 casas decimais se for sistema decimal
          if (sistema === "decimal") {
            resultadoParcial = Math.round(resultadoParcial * 100) / 100;
          }

          // Verificar se resultadoParcial é suficiente para subtrair parcela3
          // Se não for, ajustar parcela2 para garantir que resultadoParcial seja adequado
          if (sistema === "romano") {
            const minParcela3Subt = Math.max(1, min_parcela_3);
            const resultadoParcialInteiro = Math.abs(resultadoParcial);
            // ResultadoParcial precisa ser pelo menos (minParcela3Subt + 1)
            if (resultadoParcialInteiro < minParcela3Subt + 1) {
              // Ajustar parcela2 para garantir que resultadoParcial seja suficiente
              const parcela1Inteira = Math.abs(parcela1);
              const resultadoParcialMinimo = minParcela3Subt + 1;
              const maxParcela2Ajustado = Math.max(1, parcela1Inteira - resultadoParcialMinimo);
              // Regerar parcela2 com limite ajustado (usar minParcela2Subt que já garante mínimo de 1 para romano)
              parcela2 = this.numeroAleatorio(minParcela2Subt, Math.min(max_parcela_2, maxParcela2Ajustado));
              parcela2 = this.aplicarSinalAleatorio(parcela2, sistema, permitirNegativos);
              // Recalcular resultadoParcial
              resultadoParcial = parcela1 - parcela2;
            }
          } else if (!permitirNegativos) {
            // Para sistemas que não permitem negativos (naturais, decimais, binários, hexadecimais)
            // ResultadoParcial precisa ser pelo menos min_parcela_3 para poder subtrair parcela3
            const resultadoParcialInteiro = sistema === "decimal" ? Math.floor(resultadoParcial) : Math.abs(resultadoParcial);
            if (resultadoParcialInteiro < min_parcela_3) {
              // Ajustar parcela2 para garantir que resultadoParcial seja suficiente
              const parcela1Inteira = sistema === "decimal" ? Math.floor(parcela1) : Math.abs(parcela1);
              const resultadoParcialMinimo = min_parcela_3;
              const maxParcela2Ajustado = parcela1Inteira - resultadoParcialMinimo;
              // Regerar parcela2 com limite ajustado
              parcela2 = this.numeroAleatorio(min_parcela_2, Math.min(max_parcela_2, maxParcela2Ajustado));
              parcela2 = this.aplicarSinalAleatorio(parcela2, sistema, permitirNegativos);
              if (sistema === "decimal") {
                parcela2 = this.adicionarCasasDecimais(parcela2, sistema);
              }
              // Recalcular resultadoParcial
              resultadoParcial = parcela1 - parcela2;
              if (sistema === "decimal") {
                resultadoParcial = Math.round(resultadoParcial * 100) / 100;
              }
            }
          }

          // Para sistema decimal, garantir que parcela3 <= resultadoParcial
          // Para sistema romano, garantir que parcela3 não seja zero e seja menor que resultadoParcial
          // Para outros sistemas que não permitem negativos, garantir que parcela3 <= resultadoParcial
          let maxParcela3;
          const minParcela3Subt = sistema === "romano" ? Math.max(1, min_parcela_3) : min_parcela_3;
          if (sistema === "decimal") {
            const resultadoParcialInteiro = Math.floor(resultadoParcial);
            maxParcela3 = Math.min(max_parcela_3, resultadoParcialInteiro);
            // Garantir que maxParcela3 seja pelo menos min_parcela_3
            if (maxParcela3 < min_parcela_3) {
              maxParcela3 = min_parcela_3;
            }
          } else if (sistema === "romano") {
            // Para romano, parcela3 deve ser menor que resultadoParcial (não pode ser igual para evitar zero)
            const resultadoParcialInteiro = Math.abs(resultadoParcial);
            maxParcela3 = Math.min(max_parcela_3, resultadoParcialInteiro - 1);
            // Garantir que maxParcela3 seja pelo menos 1
            if (maxParcela3 < 1) {
              maxParcela3 = 1;
            }
          } else {
            const resultadoParcialInteiro = Math.abs(resultadoParcial);
            if (permitirNegativos) {
              maxParcela3 = max_parcela_3;
            } else {
              // Para sistemas que não permitem negativos (naturais, binários, hexadecimais)
              maxParcela3 = Math.min(max_parcela_3, resultadoParcialInteiro);
              // Garantir que maxParcela3 seja pelo menos min_parcela_3
              if (maxParcela3 < min_parcela_3) {
                maxParcela3 = min_parcela_3;
              }
            }
          }

          // Garantir que minParcela3Subt <= maxParcela3
          if (minParcela3Subt > maxParcela3) {
            maxParcela3 = minParcela3Subt;
          }
          
          parcela3 = this.numeroAleatorio(minParcela3Subt, maxParcela3);
          parcela3 = this.aplicarSinalAleatorio(parcela3, sistema, permitirNegativos);
          parcela3 = this.adicionarCasasDecimais(parcela3, sistema);

          // Para sistema decimal, garantir que parcela3 realmente seja <= resultadoParcial
          if (sistema === "decimal" && parcela3 > resultadoParcial) {
            const parteInteiraResultado = Math.floor(resultadoParcial);
            const parteInteiraParcela3 = Math.floor(parcela3);

            if (parteInteiraParcela3 < parteInteiraResultado) {
              // Se parte inteira de parcela3 é menor, não precisa ajustar
            } else if (parteInteiraParcela3 === parteInteiraResultado) {
              // Se parte inteira é igual, garantir que parte decimal de parcela3 <= parte decimal de resultadoParcial
              const parteDecimalResultado = resultadoParcial - parteInteiraResultado;
              const maxCasasDecimais = Math.floor(parteDecimalResultado * 100);
              const casasDecimais = this.numeroAleatorio(0, maxCasasDecimais);
              parcela3 = Math.round((parteInteiraParcela3 + (casasDecimais / 100)) * 100) / 100;
            } else {
              // Se parte inteira de parcela3 é maior (não deveria acontecer), ajustar
              parcela3 = resultadoParcial;
            }
          }

          resultado = resultadoParcial - parcela3;
          // Arredondar resultado para 2 casas decimais se for sistema decimal
          if (sistema === "decimal") {
            resultado = Math.round(resultado * 100) / 100;
          }
          
          // Para sistemas que não permitem negativos, garantir que resultado >= 0
          // Se resultado for negativo, ajustar parcela3 para garantir resultado >= 0
          if (!permitirNegativos && resultado < 0) {
            // Ajustar parcela3 para que resultado seja >= 0
            // parcela3 deve ser <= resultadoParcial
            const resultadoParcialInteiro = sistema === "decimal" ? Math.floor(resultadoParcial) : Math.abs(resultadoParcial);
            const maxParcela3Ajustado = Math.min(max_parcela_3, resultadoParcialInteiro);
            // Garantir que maxParcela3Ajustado seja pelo menos min_parcela_3
            if (maxParcela3Ajustado >= min_parcela_3) {
              parcela3 = this.numeroAleatorio(min_parcela_3, maxParcela3Ajustado);
              parcela3 = this.aplicarSinalAleatorio(parcela3, sistema, permitirNegativos);
              parcela3 = this.adicionarCasasDecimais(parcela3, sistema);
              // Recalcular resultado
              resultado = resultadoParcial - parcela3;
              if (sistema === "decimal") {
                resultado = Math.round(resultado * 100) / 100;
              }
            } else {
              // Se não for possível gerar parcela3 válida, ajustar parcela2
              const parcela1Inteira = sistema === "decimal" ? Math.floor(parcela1) : Math.abs(parcela1);
              const maxParcela2Ajustado = parcela1Inteira - min_parcela_3;
              if (maxParcela2Ajustado >= min_parcela_2) {
                parcela2 = this.numeroAleatorio(min_parcela_2, Math.min(max_parcela_2, maxParcela2Ajustado));
                parcela2 = this.aplicarSinalAleatorio(parcela2, sistema, permitirNegativos);
                parcela2 = this.adicionarCasasDecimais(parcela2, sistema);
                // Recalcular resultadoParcial
                resultadoParcial = parcela1 - parcela2;
                if (sistema === "decimal") {
                  resultadoParcial = Math.round(resultadoParcial * 100) / 100;
                }
                // Regerar parcela3
                const resultadoParcialInteiro2 = sistema === "decimal" ? Math.floor(resultadoParcial) : Math.abs(resultadoParcial);
                const maxParcela3Ajustado2 = Math.min(max_parcela_3, resultadoParcialInteiro2);
                parcela3 = this.numeroAleatorio(min_parcela_3, maxParcela3Ajustado2);
                parcela3 = this.aplicarSinalAleatorio(parcela3, sistema, permitirNegativos);
                parcela3 = this.adicionarCasasDecimais(parcela3, sistema);
                // Recalcular resultado
                resultado = resultadoParcial - parcela3;
                if (sistema === "decimal") {
                  resultado = Math.round(resultado * 100) / 100;
                }
              }
            }
          }
        } else {
          parcela3 = null;
          resultado = parcela1 - parcela2;
          // Arredondar resultado para 2 casas decimais se for sistema decimal
          if (sistema === "decimal") {
            resultado = Math.round(resultado * 100) / 100;
          }
        }
        break;

      case "multiplicacao":
        // Para sistema romano, garantir que parcelas não sejam zero
        const minParcela1Mult = sistema === "romano" ? Math.max(1, min_parcela_1) : min_parcela_1;
        const minParcela2Mult = sistema === "romano" ? Math.max(1, min_parcela_2) : min_parcela_2;

        parcela1 = this.numeroAleatorio(minParcela1Mult, max_parcela_1);
        parcela1 = this.aplicarSinalAleatorio(parcela1, sistema, permitirNegativos);
        // Para multiplicação com sistema decimal: parcela1 sempre é inteira (natural)
        if (sistema === "decimal") {
          // Manter parcela1 como inteira (sem casas decimais)
          parcela1 = Math.round(parcela1);
        } else {
          parcela1 = this.adicionarCasasDecimais(parcela1, sistema);
        }

        parcela2 = this.numeroAleatorio(minParcela2Mult, max_parcela_2);
        parcela2 = this.aplicarSinalAleatorio(parcela2, sistema, permitirNegativos);
        const temParcela3 = min_parcela_3 !== null && max_parcela_3 !== null;
        if (sistema === "decimal") {
          if (temParcela3) {
            // Se há 3 parcelas: parcela2 é inteira (natural)
            parcela2 = Math.round(parcela2);
          } else {
            // Se há 2 parcelas: parcela2 tem 2 casas decimais
            const casasDecimais = this.numeroAleatorio(1, 99) / 100;
            parcela2 = Math.round((parcela2 + casasDecimais) * 100) / 100;
          }
        } else {
          parcela2 = this.adicionarCasasDecimais(parcela2, sistema);
        }

        if (temParcela3) {
          const minParcela3Mult = sistema === "romano" ? Math.max(1, min_parcela_3) : min_parcela_3;
          parcela3 = this.numeroAleatorio(minParcela3Mult, max_parcela_3);
          parcela3 = this.aplicarSinalAleatorio(parcela3, sistema, permitirNegativos);
          if (sistema === "decimal") {
            // Para multiplicação com 3 parcelas: parcela3 tem 2 casas decimais
            const casasDecimais = this.numeroAleatorio(1, 99) / 100;
            parcela3 = Math.round((parcela3 + casasDecimais) * 100) / 100;
          } else {
            parcela3 = this.adicionarCasasDecimais(parcela3, sistema);
          }
          resultado = parcela1 * parcela2 * parcela3;
          // Arredondar resultado para 2 casas decimais se for sistema decimal
          if (sistema === "decimal") {
            resultado = Math.round(resultado * 100) / 100;
          }
        } else {
          parcela3 = null;
          resultado = parcela1 * parcela2;
          // Arredondar resultado para 2 casas decimais se for sistema decimal
          if (sistema === "decimal") {
            resultado = Math.round(resultado * 100) / 100;
          }
        }
        break;

      case "divisao":
        // Ajustar limites se for sistema decimal (multiplicar por 100)
        const ajusteDecimal = sistema === "decimal" ? 100 : 1;
        const minParcela1Ajustado = min_parcela_1 * ajusteDecimal;
        const maxParcela1Ajustado = max_parcela_1 * ajusteDecimal;

        // Gerar valores absolutos primeiro (como naturais)
        // Para sistema romano, garantir que divisor não seja zero
        const minParcela2Div = sistema === "romano" ? Math.max(1, min_parcela_2) : min_parcela_2;
        let parcela2Abs = this.numeroAleatorio(minParcela2Div, max_parcela_2);
        // Garantir que divisor não seja zero
        if (parcela2Abs === 0) {
          parcela2Abs = 1;
        }

        if (min_parcela_3 !== null && max_parcela_3 !== null) {
          // Para divisão com 3 parcelas: (parcela1 / parcela2) / parcela3 deve ser inteiro
          // Isso significa: parcela1 / (parcela2 * parcela3) deve ser inteiro
          // Para sistema romano, garantir que parcela3 não seja zero
          const minParcela3Div = sistema === "romano" ? Math.max(1, min_parcela_3) : min_parcela_3;
          let parcela3Abs = this.numeroAleatorio(minParcela3Div, max_parcela_3);
          if (parcela3Abs === 0) {
            parcela3Abs = 1;
          }

          const divisorTotalAbs = parcela2Abs * parcela3Abs;

          // Calcular múltiplos possíveis considerando apenas valores absolutos
          const multiploMin = Math.ceil(minParcela1Ajustado / divisorTotalAbs);
          const multiploMax = Math.floor(maxParcela1Ajustado / divisorTotalAbs);

          if (multiploMin > multiploMax) {
            throw new Error(
              `Impossível gerar divisão com 3 parcelas: nenhum múltiplo de ${divisorTotalAbs} está no intervalo [${min_parcela_1}, ${max_parcela_1}]`
            );
          }

          // Para sistema romano, garantir que o resultado não seja zero
          // Se multiploMin for 0, ajustar para 1
          const multiploMinAjustado = sistema === "romano" ? Math.max(1, multiploMin) : multiploMin;
          if (multiploMinAjustado > multiploMax) {
            throw new Error(
              `Impossível gerar divisão com 3 parcelas sem zero: nenhum múltiplo de ${divisorTotalAbs} está no intervalo [${min_parcela_1}, ${max_parcela_1}]`
            );
          }

          const multiplo = this.numeroAleatorio(multiploMinAjustado, multiploMax);
          let parcela1Abs = multiplo * divisorTotalAbs; // Garante que o resultado é inteiro

          // Aplicar sinais aleatórios depois (se sistema inteiro)
          parcela1 = this.aplicarSinalAleatorio(parcela1Abs, sistema, permitirNegativos);
          // Para sistema decimal, dividir parcela1 por 100 para ter 2 casas decimais
          if (sistema === "decimal") {
            parcela1 = parcela1 / 100;
          }
          parcela2 = this.aplicarSinalAleatorio(parcela2Abs, sistema, permitirNegativos);
          parcela3 = this.aplicarSinalAleatorio(parcela3Abs, sistema, permitirNegativos);

          // O resultado já terá o sinal correto automaticamente
          resultado = parcela1 / parcela2 / parcela3;
          // Arredondar resultado para 2 casas decimais se for sistema decimal
          if (sistema === "decimal") {
            resultado = Math.round(resultado * 100) / 100;
          }
        } else {
          // Para divisão com 2 parcelas: parcela1 / parcela2 deve ser inteiro
          // Calcular múltiplos possíveis considerando apenas valores absolutos
          const multiploMin = Math.ceil(minParcela1Ajustado / parcela2Abs);
          const multiploMax = Math.floor(maxParcela1Ajustado / parcela2Abs);

          if (multiploMin > multiploMax) {
            throw new Error(
              `Impossível gerar divisão: nenhum múltiplo de ${parcela2Abs} está no intervalo [${min_parcela_1}, ${max_parcela_1}]`
            );
          }

          // Para sistema romano, garantir que o resultado não seja zero
          // Se multiploMin for 0, ajustar para 1
          const multiploMinAjustado2 = sistema === "romano" ? Math.max(1, multiploMin) : multiploMin;
          if (multiploMinAjustado2 > multiploMax) {
            throw new Error(
              `Impossível gerar divisão sem zero: nenhum múltiplo de ${parcela2Abs} está no intervalo [${min_parcela_1}, ${max_parcela_1}]`
            );
          }

          const multiplo = this.numeroAleatorio(multiploMinAjustado2, multiploMax);
          let parcela1Abs = multiplo * parcela2Abs; // Garante que parcela1 % parcela2 == 0

          // Aplicar sinais aleatórios depois (se sistema inteiro)
          parcela1 = this.aplicarSinalAleatorio(parcela1Abs, sistema, permitirNegativos);
          // Para sistema decimal, dividir parcela1 por 100 para ter 2 casas decimais
          if (sistema === "decimal") {
            parcela1 = parcela1 / 100;
          }
          parcela2 = this.aplicarSinalAleatorio(parcela2Abs, sistema, permitirNegativos);

          // O resultado já terá o sinal correto automaticamente
          parcela3 = null;
          resultado = parcela1 / parcela2;
          // Arredondar resultado para 2 casas decimais se for sistema decimal
          if (sistema === "decimal") {
            resultado = Math.round(resultado * 100) / 100;
          }
        }
        break;

      case "raiz":
        if (sistema === "decimal") {
          // Para sistema decimal: gerar base com 1 casa decimal, elevar ao quadrado (que terá 2 casas)
          // Gerar base como número natural entre 1 e 100 (que dividido por 10 terá 1 casa decimal)
          const baseMinNatural = Math.ceil(Math.sqrt(min_parcela_1) * 10);
          const baseMaxNatural = Math.floor(Math.sqrt(max_parcela_1) * 10);

          if (baseMinNatural > baseMaxNatural) {
            throw new Error(
              `Impossível gerar raiz: nenhuma base² está no intervalo [${min_parcela_1}, ${max_parcela_1}]`
            );
          }

          const baseNatural = this.numeroAleatorio(baseMinNatural, baseMaxNatural);
          const base = baseNatural / 10; // Base com 1 casa decimal
          parcela1 = Math.round((base * base) * 100) / 100; // resultado da raiz (com 2 casas decimais, arredondado)
          parcela2 = null;
          parcela3 = null;
          resultado = Math.round(base * 10) / 10; // a raiz quadrada (com 1 casa decimal, arredondado)
        } else {
          // Para raiz: gerar base aleatória, calcular base²
          // O resultado será base², e base² deve estar nos limites de parcela_1
          const baseMin = Math.ceil(Math.sqrt(min_parcela_1));
          const baseMax = Math.floor(Math.sqrt(max_parcela_1));

          if (baseMin > baseMax) {
            throw new Error(
              `Impossível gerar raiz: nenhuma base² está no intervalo [${min_parcela_1}, ${max_parcela_1}]`
            );
          }

          const base = this.numeroAleatorio(baseMin, baseMax);
          parcela1 = base * base; // resultado da raiz
          parcela2 = null;
          parcela3 = null;
          resultado = base; // a raiz quadrada
        }
        break;

      case "aleatorio":
        // Para aleatório: selecionar uma das operações incluídas aleatoriamente
        if (!operacao.operacoes_incluidas || operacao.operacoes_incluidas.length === 0) {
          throw new Error("Operação aleatória não possui operações configuradas");
        }

        // Selecionar uma operação aleatória das incluídas
        const indiceAleatorio = Math.floor(
          Math.random() * operacao.operacoes_incluidas.length
        );
        const operacaoSelecionada = operacao.operacoes_incluidas[indiceAleatorio];

        // Gerar conta usando a operação selecionada (recursão)
        return this.gerarConta(operacaoSelecionada, sistema);

      case "conversao":
        // Para conversão: gerar apenas primeira parcela (número em natural)
        // O resultado será o mesmo número (será convertido no momento de exibir/validar conforme formato_resposta)
        // Para sistema romano, garantir que não seja zero
        const minParcela1Conv = sistema === "romano" ? Math.max(1, min_parcela_1) : min_parcela_1;

        // Aplicar limites do sistema ao número gerado
        const limiteMaxSistema = sistema === "romano" ? 3999 : sistema === "binario" ? 2047 : Infinity;
        const maxParcela1AjustadoConv = Math.min(max_parcela_1, limiteMaxSistema);

        if (minParcela1Conv > maxParcela1AjustadoConv) {
          throw new Error(
            `Impossível gerar conversão: limite mínimo ${minParcela1Conv} é maior que limite máximo ajustado ${maxParcela1AjustadoConv} para sistema ${sistema}`
          );
        }

        parcela1 = this.numeroAleatorio(minParcela1Conv, maxParcela1AjustadoConv);
        parcela2 = null;
        parcela3 = null;
        // O resultado será o mesmo número (parcela1) - será convertido no momento de exibir/validar
        resultado = parcela1;
        break;

      default:
        throw new Error(`Tipo de operação inválido: ${tipo}`);
    }

    // Para sistema romano: garantir que nenhuma parcela ou resultado seja zero
    // (números romanos não têm representação para zero)
    if (sistema === "romano") {
      // Verificar se alguma parcela é zero
      if (parcela1 === 0 || parcela2 === 0 || (parcela3 !== null && parcela3 === 0)) {
        throw new Error(
          `Sistema romano não suporta zero. Parcela gerada foi zero.`
        );
      }

      // Verificar se resultado é zero
      if (resultado === 0) {
        throw new Error(
          `Sistema romano não suporta zero. Resultado da operação foi zero.`
        );
      }
    }

    // Aplicar limites do sistema numérico ao resultado
    // Se o resultado ultrapassar o limite do sistema, gerar novamente
    const limiteMaximo =
      sistema === "romano" ? 3999 : sistema === "binario" ? 2047 : Infinity;

    if (sistema !== "inteiro" && sistema !== "decimal" && sistema !== "hexadecimal" && Math.abs(resultado) > limiteMaximo) {
      // Se o resultado ultrapassar o limite do sistema, tentar gerar novamente
      // (será chamado recursivamente via gerarBufferContas)
      // Para sistema inteiro, decimal e hexadecimal, não há limite além dos limites da operação
      throw new Error(
        `Resultado ${resultado} ultrapassa o limite do sistema ${sistema} (máximo: ${limiteMaximo})`
      );
    }

    return {
      parcela1,
      parcela2,
      parcela3,
      resultado,
      tipo,
    };
  }

  /**
   * Verificar se duas contas são exatamente iguais
   * @param {object} conta1 - Primeira conta
   * @param {object} conta2 - Segunda conta
   * @returns {boolean} true se as contas forem iguais
   */
  contasIguais(conta1, conta2) {
    if (!conta1 || !conta2) return false;

    // Normalizar null/undefined para null
    const parcela3_1 = conta1.parcela3 ?? null;
    const parcela3_2 = conta2.parcela3 ?? null;
    const parcela2_1 = conta1.parcela2 ?? null;
    const parcela2_2 = conta2.parcela2 ?? null;

    return (
      conta1.tipo === conta2.tipo &&
      conta1.parcela1 === conta2.parcela1 &&
      parcela2_1 === parcela2_2 &&
      parcela3_1 === parcela3_2 &&
      conta1.resultado === conta2.resultado
    );
  }

  /**
   * Gerar múltiplas contas antecipadamente
   * @param {object} operacao - Objeto com tipo e limites de parcelas
   * @param {number} quantidade - Número de contas a gerar (padrão: 10)
   * @param {string} sistema - Sistema numérico
   * @returns {array} Array de contas
   */
  gerarBufferContas(operacao, quantidade = 10, sistema = "natural") {
    const contas = [];
    const maxTentativas = quantidade * 50; // Limite máximo de tentativas (50x a quantidade desejada)
    let tentativas = 0;

    while (contas.length < quantidade && tentativas < maxTentativas) {
      try {
        const conta = this.gerarConta(operacao, sistema);
        contas.push(conta);
      } catch (error) {
        // Se houver erro ao gerar conta (ex: limites inválidos ou resultado ultrapassa limite do sistema)
        // Continuar tentando
        tentativas++;
        if (tentativas >= maxTentativas) {
          throw new Error(
            `Não foi possível gerar ${quantidade} contas válidas após ${maxTentativas} tentativas. Último erro: ${error.message}`
          );
        }
      }
      tentativas++;
    }

    if (contas.length < quantidade) {
      throw new Error(
        `Apenas ${contas.length} de ${quantidade} contas foram geradas após ${tentativas} tentativas`
      );
    }

    return contas;
  }

  /**
   * Gerar múltiplas contas sem repetições seguidas
   * Garante que nenhuma conta seja igual à anterior
   * @param {object} operacao - Objeto com tipo e limites de parcelas
   * @param {number} quantidade - Número de contas a gerar
   * @param {string} sistema - Sistema numérico
   * @returns {array} Array de contas sem repetições seguidas
   */
  gerarContasSemRepeticoes(operacao, quantidade, sistema = "natural") {
    const contas = [];
    const maxTentativasPorConta = 200; // Limite de tentativas por conta para evitar loop infinito
    let tentativasTotais = 0;
    const maxTentativasTotais = quantidade * 200; // Limite total de tentativas

    while (contas.length < quantidade && tentativasTotais < maxTentativasTotais) {
      let contaGerada = null;
      let tentativasConta = 0;

      while (tentativasConta < maxTentativasPorConta && tentativasTotais < maxTentativasTotais) {
        try {
          contaGerada = this.gerarConta(operacao, sistema);

          // Verificar se é diferente da conta anterior (se houver)
          if (contas.length === 0 || !this.contasIguais(contaGerada, contas[contas.length - 1])) {
            contas.push(contaGerada);
            break; // Conta aceita, sair do loop interno
          }

          // Se for igual, tentar gerar outra
          tentativasConta++;
          tentativasTotais++;
        } catch (error) {
          // Se houver erro ao gerar conta, continuar tentando
          tentativasConta++;
          tentativasTotais++;
        }
      }

      // Se não conseguiu gerar uma conta diferente após muitas tentativas
      if (!contaGerada || (contas.length > 0 && this.contasIguais(contaGerada, contas[contas.length - 1]))) {
        tentativasTotais++;
        // Continuar tentando (pode ser que os limites sejam muito restritivos)
        if (tentativasTotais >= maxTentativasTotais) {
          throw new Error(
            `Não foi possível gerar ${quantidade} contas sem repetições após ${maxTentativasTotais} tentativas. Geradas: ${contas.length}`
          );
        }
      }
    }

    if (contas.length < quantidade) {
      throw new Error(
        `Apenas ${contas.length} de ${quantidade} contas foram geradas sem repetições após ${tentativasTotais} tentativas`
      );
    }

    return contas;
  }

  /**
   * Validar resposta do usuário
   * @param {object} conta - Conta gerada { parcela1, parcela2, parcela3, resultado, tipo }
   * @param {string|number} respostaUsuario - Resposta fornecida pelo usuário
   * @param {string} sistema - Sistema numérico usado
   * @returns {object} { correto: boolean, respostaEsperada: number|string }
   */
  validarResposta(conta, respostaUsuario, sistema = "natural") {
    const resultadoEsperado = conta.resultado;
    let respostaEsperadaFormatada;

    try {
      // Formatar resultado esperado conforme sistema
      if (sistema === "natural" || sistema === "inteiro") {
        respostaEsperadaFormatada = resultadoEsperado;
      } else if (sistema === "decimal") {
        respostaEsperadaFormatada = conversaoService.formatarNumero(
          resultadoEsperado,
          "decimal"
        );
      } else if (sistema === "romano") {
        respostaEsperadaFormatada = conversaoService.formatarNumero(
          resultadoEsperado,
          "romano"
        );
      } else if (sistema === "binario") {
        respostaEsperadaFormatada = conversaoService.formatarNumero(
          resultadoEsperado,
          "binario"
        );
      } else if (sistema === "hexadecimal") {
        respostaEsperadaFormatada = conversaoService.formatarNumero(
          resultadoEsperado,
          "hexadecimal"
        );
      } else {
        throw new Error(`Sistema inválido: ${sistema}`);
      }

      // Comparar resposta do usuário
      let correto = false;

      if (sistema === "natural" || sistema === "inteiro") {
        // Para natural e inteiro, comparar números diretamente
        const respostaNumero =
          typeof respostaUsuario === "string"
            ? parseFloat(respostaUsuario.trim())
            : respostaUsuario;

        if (!isNaN(respostaNumero)) {
          correto = respostaNumero === resultadoEsperado;
        }
      } else if (sistema === "decimal") {
        // Para decimal, comparar números com 2 casas decimais
        const respostaNumero =
          typeof respostaUsuario === "string"
            ? parseFloat(respostaUsuario.trim().replace(",", "."))
            : respostaUsuario;

        if (!isNaN(respostaNumero)) {
          // Comparar com tolerância para erros de ponto flutuante
          const diferenca = Math.abs(respostaNumero - resultadoEsperado);
          correto = diferenca < 0.001; // Tolerância de 0.001
        }
      } else if (sistema === "romano") {
        // Para romano, comparar strings (normalizadas: maiúsculas e sem espaços)
        const respostaNormalizada =
          typeof respostaUsuario === "string"
            ? respostaUsuario.trim().toUpperCase()
            : String(respostaUsuario).toUpperCase();

        correto =
          respostaNormalizada === respostaEsperadaFormatada.toUpperCase();
      } else if (sistema === "binario") {
        // Para binário, comparar strings (apenas 0s e 1s)
        const respostaNormalizada =
          typeof respostaUsuario === "string"
            ? respostaUsuario.trim()
            : String(respostaUsuario);

        // Validar formato binário antes de comparar
        if (/^[01]+$/.test(respostaNormalizada)) {
          correto = respostaNormalizada === respostaEsperadaFormatada;
        }
      } else if (sistema === "hexadecimal") {
        // Para hexadecimal, comparar strings (0-9 e A-F, case insensitive)
        const respostaNormalizada =
          typeof respostaUsuario === "string"
            ? respostaUsuario.trim().toUpperCase()
            : String(respostaUsuario).toUpperCase();

        // Validar formato hexadecimal antes de comparar
        if (/^[0-9A-F]+$/.test(respostaNormalizada)) {
          correto = respostaNormalizada === respostaEsperadaFormatada.toUpperCase();
        }
      }

      return {
        correto,
        respostaEsperada: respostaEsperadaFormatada,
      };
    } catch (error) {
      // Se houver erro na formatação (ex: número fora do limite do sistema),
      // retornar resultado esperado em natural
      return {
        correto: false,
        respostaEsperada: resultadoEsperado,
        erro: error.message,
      };
    }
  }
}

module.exports = new TreinoService();
