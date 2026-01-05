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
   * @param {string} sistema - Sistema numérico ('natural', 'romano', 'binario', 'inteiro')
   * @returns {number} Número limitado conforme sistema
   */
  aplicarLimiteSistema(numero, sistema) {
    if (sistema === "romano") {
      return Math.min(numero, 3999);
    } else if (sistema === "binario") {
      return Math.min(numero, 2047);
    }
    return numero; // natural e inteiro não têm limite (além do limite da operação)
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
        parcela1 = this.numeroAleatorio(min_parcela_1, max_parcela_1);
        parcela1 = this.aplicarSinalAleatorio(parcela1, sistema, permitirNegativos);
        
        parcela2 = this.numeroAleatorio(min_parcela_2, max_parcela_2);
        parcela2 = this.aplicarSinalAleatorio(parcela2, sistema, permitirNegativos);

        // Se houver parcela 3, usar
        if (min_parcela_3 !== null && max_parcela_3 !== null) {
          parcela3 = this.numeroAleatorio(min_parcela_3, max_parcela_3);
          parcela3 = this.aplicarSinalAleatorio(parcela3, sistema, permitirNegativos);
          resultado = parcela1 + parcela2 + parcela3;
        } else {
          parcela3 = null;
          resultado = parcela1 + parcela2;
        }
        break;

      case "subtracao":
        // Gerar minuendo primeiro, depois subtraendo menor ou igual
        parcela1 = this.numeroAleatorio(min_parcela_1, max_parcela_1);
        parcela1 = this.aplicarSinalAleatorio(parcela1, sistema, permitirNegativos);
        
        // Para sistema inteiro, não precisa garantir que subtraendo <= minuendo
        const maxParcela2 = permitirNegativos 
          ? max_parcela_2 
          : Math.min(max_parcela_2, Math.abs(parcela1));
        parcela2 = this.numeroAleatorio(min_parcela_2, maxParcela2);
        parcela2 = this.aplicarSinalAleatorio(parcela2, sistema, permitirNegativos);

        if (min_parcela_3 !== null && max_parcela_3 !== null) {
          // Para subtração com 3 parcelas
          const resultadoParcial = parcela1 - parcela2;
          const maxParcela3 = permitirNegativos 
            ? max_parcela_3 
            : Math.min(max_parcela_3, Math.abs(resultadoParcial));
          parcela3 = this.numeroAleatorio(min_parcela_3, maxParcela3);
          parcela3 = this.aplicarSinalAleatorio(parcela3, sistema, permitirNegativos);
          resultado = resultadoParcial - parcela3;
        } else {
          parcela3 = null;
          resultado = parcela1 - parcela2;
        }
        break;

      case "multiplicacao":
        parcela1 = this.numeroAleatorio(min_parcela_1, max_parcela_1);
        parcela1 = this.aplicarSinalAleatorio(parcela1, sistema, permitirNegativos);
        
        parcela2 = this.numeroAleatorio(min_parcela_2, max_parcela_2);
        parcela2 = this.aplicarSinalAleatorio(parcela2, sistema, permitirNegativos);

        if (min_parcela_3 !== null && max_parcela_3 !== null) {
          parcela3 = this.numeroAleatorio(min_parcela_3, max_parcela_3);
          parcela3 = this.aplicarSinalAleatorio(parcela3, sistema, permitirNegativos);
          resultado = parcela1 * parcela2 * parcela3;
        } else {
          parcela3 = null;
          resultado = parcela1 * parcela2;
        }
        break;

      case "divisao":
        // Gerar valores absolutos primeiro (como naturais)
        let parcela2Abs = this.numeroAleatorio(min_parcela_2, max_parcela_2);
        // Garantir que divisor não seja zero
        if (parcela2Abs === 0) {
          parcela2Abs = 1;
        }

        if (min_parcela_3 !== null && max_parcela_3 !== null) {
          // Para divisão com 3 parcelas: (parcela1 / parcela2) / parcela3 deve ser inteiro
          // Isso significa: parcela1 / (parcela2 * parcela3) deve ser inteiro
          let parcela3Abs = this.numeroAleatorio(min_parcela_3, max_parcela_3);
          if (parcela3Abs === 0) {
            parcela3Abs = 1;
          }

          const divisorTotalAbs = parcela2Abs * parcela3Abs;
          
          // Calcular múltiplos possíveis considerando apenas valores absolutos
          const multiploMin = Math.ceil(min_parcela_1 / divisorTotalAbs);
          const multiploMax = Math.floor(max_parcela_1 / divisorTotalAbs);

          if (multiploMin > multiploMax) {
            throw new Error(
              `Impossível gerar divisão com 3 parcelas: nenhum múltiplo de ${divisorTotalAbs} está no intervalo [${min_parcela_1}, ${max_parcela_1}]`
            );
          }

          const multiplo = this.numeroAleatorio(multiploMin, multiploMax);
          let parcela1Abs = multiplo * divisorTotalAbs; // Garante que o resultado é inteiro
          
          // Aplicar sinais aleatórios depois (se sistema inteiro)
          parcela1 = this.aplicarSinalAleatorio(parcela1Abs, sistema, permitirNegativos);
          parcela2 = this.aplicarSinalAleatorio(parcela2Abs, sistema, permitirNegativos);
          parcela3 = this.aplicarSinalAleatorio(parcela3Abs, sistema, permitirNegativos);
          
          // O resultado já terá o sinal correto automaticamente
          resultado = parcela1 / parcela2 / parcela3;
        } else {
          // Para divisão com 2 parcelas: parcela1 / parcela2 deve ser inteiro
          // Calcular múltiplos possíveis considerando apenas valores absolutos
          const multiploMin = Math.ceil(min_parcela_1 / parcela2Abs);
          const multiploMax = Math.floor(max_parcela_1 / parcela2Abs);

          if (multiploMin > multiploMax) {
            throw new Error(
              `Impossível gerar divisão: nenhum múltiplo de ${parcela2Abs} está no intervalo [${min_parcela_1}, ${max_parcela_1}]`
            );
          }

          const multiplo = this.numeroAleatorio(multiploMin, multiploMax);
          let parcela1Abs = multiplo * parcela2Abs; // Garante que parcela1 % parcela2 == 0
          
          // Aplicar sinais aleatórios depois (se sistema inteiro)
          parcela1 = this.aplicarSinalAleatorio(parcela1Abs, sistema, permitirNegativos);
          parcela2 = this.aplicarSinalAleatorio(parcela2Abs, sistema, permitirNegativos);
          
          // O resultado já terá o sinal correto automaticamente
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

      default:
        throw new Error(`Tipo de operação inválido: ${tipo}`);
    }

    // Aplicar limites do sistema numérico ao resultado
    // Se o resultado ultrapassar o limite do sistema, gerar novamente
    const limiteMaximo =
      sistema === "romano" ? 3999 : sistema === "binario" ? 2047 : Infinity;

    if (sistema !== "inteiro" && Math.abs(resultado) > limiteMaximo) {
      // Se o resultado ultrapassar o limite do sistema, tentar gerar novamente
      // (será chamado recursivamente via gerarBufferContas)
      // Para sistema inteiro, não há limite além dos limites da operação
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

      if (sistema === "natural" || sistema === "inteiro") {
        // Para natural e inteiro, comparar números diretamente
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
