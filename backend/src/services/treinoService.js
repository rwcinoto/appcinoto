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
   * @param {string} sistema - Sistema numérico ('arabico', 'romano', 'binario')
   * @returns {number} Número limitado conforme sistema
   */
  aplicarLimiteSistema(numero, sistema) {
    if (sistema === "romano") {
      return Math.min(numero, 3999);
    } else if (sistema === "binario") {
      return Math.min(numero, 2047);
    }
    return numero; // arábico não tem limite (além do limite da operação)
  }

  /**
   * Gerar conta matemática conforme tipo de operação
   * @param {object} operacao - Objeto com tipo e limites de parcelas
   * @param {string} sistema - Sistema numérico ('arabico', 'romano', 'binario')
   * @returns {object} { parcela1, parcela2, parcela3, resultado, tipo }
   */
  gerarConta(operacao, sistema = "arabico") {
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

    switch (tipo) {
      case "soma":
        parcela1 = this.numeroAleatorio(min_parcela_1, max_parcela_1);
        parcela2 = this.numeroAleatorio(min_parcela_2, max_parcela_2);

        // Se houver parcela 3, usar
        if (min_parcela_3 !== null && max_parcela_3 !== null) {
          parcela3 = this.numeroAleatorio(min_parcela_3, max_parcela_3);
          resultado = parcela1 + parcela2 + parcela3;
        } else {
          parcela3 = null;
          resultado = parcela1 + parcela2;
        }
        break;

      case "subtracao":
        // Gerar minuendo primeiro, depois subtraendo menor ou igual
        parcela1 = this.numeroAleatorio(min_parcela_1, max_parcela_1);
        parcela2 = this.numeroAleatorio(
          min_parcela_2,
          Math.min(max_parcela_2, parcela1) // Garantir que subtraendo <= minuendo
        );

        if (min_parcela_3 !== null && max_parcela_3 !== null) {
          // Para subtração com 3 parcelas: (parcela1 - parcela2) - parcela3 >= 0
          const resultadoParcial = parcela1 - parcela2;
          parcela3 = this.numeroAleatorio(
            min_parcela_3,
            Math.min(max_parcela_3, resultadoParcial)
          );
          resultado = resultadoParcial - parcela3;
        } else {
          parcela3 = null;
          resultado = parcela1 - parcela2;
        }
        break;

      case "multiplicacao":
        parcela1 = this.numeroAleatorio(min_parcela_1, max_parcela_1);
        parcela2 = this.numeroAleatorio(min_parcela_2, max_parcela_2);

        if (min_parcela_3 !== null && max_parcela_3 !== null) {
          parcela3 = this.numeroAleatorio(min_parcela_3, max_parcela_3);
          resultado = parcela1 * parcela2 * parcela3;
        } else {
          parcela3 = null;
          resultado = parcela1 * parcela2;
        }
        break;

      case "divisao":
        // Gerar divisores primeiro
        parcela2 = this.numeroAleatorio(min_parcela_2, max_parcela_2);
        // Garantir que divisor não seja zero
        if (parcela2 === 0) {
          parcela2 = 1;
        }

        if (min_parcela_3 !== null && max_parcela_3 !== null) {
          // Para divisão com 3 parcelas: (parcela1 / parcela2) / parcela3 deve ser inteiro
          // Isso significa: parcela1 / (parcela2 * parcela3) deve ser inteiro
          parcela3 = this.numeroAleatorio(min_parcela_3, max_parcela_3);
          if (parcela3 === 0) {
            parcela3 = 1;
          }

          const divisorTotal = parcela2 * parcela3;
          // Calcular múltiplo do divisorTotal dentro do intervalo de parcela1
          const multiploMin = Math.ceil(min_parcela_1 / divisorTotal);
          const multiploMax = Math.floor(max_parcela_1 / divisorTotal);

          if (multiploMin > multiploMax) {
            throw new Error(
              `Impossível gerar divisão com 3 parcelas: nenhum múltiplo de ${divisorTotal} está no intervalo [${min_parcela_1}, ${max_parcela_1}]`
            );
          }

          const multiplo = this.numeroAleatorio(multiploMin, multiploMax);
          parcela1 = multiplo * divisorTotal; // Garante que o resultado é inteiro
          resultado = parcela1 / parcela2 / parcela3;
        } else {
          // Para divisão com 2 parcelas: parcela1 / parcela2 deve ser inteiro
          const multiploMin = Math.ceil(min_parcela_1 / parcela2);
          const multiploMax = Math.floor(max_parcela_1 / parcela2);

          if (multiploMin > multiploMax) {
            throw new Error(
              `Impossível gerar divisão: nenhum múltiplo de ${parcela2} está no intervalo [${min_parcela_1}, ${max_parcela_1}]`
            );
          }

          const multiplo = this.numeroAleatorio(multiploMin, multiploMax);
          parcela1 = multiplo * parcela2; // Garante que parcela1 % parcela2 == 0
          parcela3 = null;
          resultado = parcela1 / parcela2;
        }
        break;

      case "raiz":
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
        break;

      default:
        throw new Error(`Tipo de operação inválido: ${tipo}`);
    }

    // Aplicar limites do sistema numérico ao resultado
    // Se o resultado ultrapassar o limite do sistema, gerar novamente
    const limiteMaximo =
      sistema === "romano" ? 3999 : sistema === "binario" ? 2047 : Infinity;

    if (resultado > limiteMaximo) {
      // Se o resultado ultrapassar o limite do sistema, tentar gerar novamente
      // (será chamado recursivamente via gerarBufferContas)
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
   * Gerar múltiplas contas antecipadamente
   * @param {object} operacao - Objeto com tipo e limites de parcelas
   * @param {number} quantidade - Número de contas a gerar (padrão: 10)
   * @param {string} sistema - Sistema numérico
   * @returns {array} Array de contas
   */
  gerarBufferContas(operacao, quantidade = 10, sistema = "arabico") {
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
   * Validar resposta do usuário
   * @param {object} conta - Conta gerada { parcela1, parcela2, parcela3, resultado, tipo }
   * @param {string|number} respostaUsuario - Resposta fornecida pelo usuário
   * @param {string} sistema - Sistema numérico usado
   * @returns {object} { correto: boolean, respostaEsperada: number|string }
   */
  validarResposta(conta, respostaUsuario, sistema = "arabico") {
    const resultadoEsperado = conta.resultado;
    let respostaEsperadaFormatada;

    try {
      // Formatar resultado esperado conforme sistema
      if (sistema === "arabico") {
        respostaEsperadaFormatada = resultadoEsperado;
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
      } else {
        throw new Error(`Sistema inválido: ${sistema}`);
      }

      // Comparar resposta do usuário
      let correto = false;

      if (sistema === "arabico") {
        // Para arábico, comparar números diretamente
        const respostaNumero =
          typeof respostaUsuario === "string"
            ? parseFloat(respostaUsuario.trim())
            : respostaUsuario;

        if (!isNaN(respostaNumero)) {
          correto = respostaNumero === resultadoEsperado;
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
      }

      return {
        correto,
        respostaEsperada: respostaEsperadaFormatada,
      };
    } catch (error) {
      // Se houver erro na formatação (ex: número fora do limite do sistema),
      // retornar resultado esperado em arábico
      return {
        correto: false,
        respostaEsperada: resultadoEsperado,
        erro: error.message,
      };
    }
  }
}

module.exports = new TreinoService();
