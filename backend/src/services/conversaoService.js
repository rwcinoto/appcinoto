"use strict";

/**
 * Service para conversão entre sistemas numéricos (natural, romano, binário)
 */
class ConversaoService {
  /**
   * Converter número decimal para notação romana
   * @param {number} numero - Número decimal entre 1 e 3999
   * @returns {string} Número em notação romana
   * @throws {Error} Se o número estiver fora do intervalo válido
   */
  paraRomano(numero) {
    if (!Number.isInteger(numero) || numero < 1 || numero > 3999) {
      throw new Error(
        "Número deve ser um inteiro entre 1 e 3999 para conversão para romano"
      );
    }

    const valores = [
      { valor: 1000, simbolo: "M" },
      { valor: 900, simbolo: "CM" },
      { valor: 500, simbolo: "D" },
      { valor: 400, simbolo: "CD" },
      { valor: 100, simbolo: "C" },
      { valor: 90, simbolo: "XC" },
      { valor: 50, simbolo: "L" },
      { valor: 40, simbolo: "XL" },
      { valor: 10, simbolo: "X" },
      { valor: 9, simbolo: "IX" },
      { valor: 5, simbolo: "V" },
      { valor: 4, simbolo: "IV" },
      { valor: 1, simbolo: "I" },
    ];

    let resultado = "";
    let valorRestante = numero;

    for (const { valor, simbolo } of valores) {
      const quantidade = Math.floor(valorRestante / valor);
      if (quantidade > 0) {
        resultado += simbolo.repeat(quantidade);
        valorRestante -= valor * quantidade;
      }
    }

    return resultado;
  }

  /**
   * Converter número decimal para binário
   * @param {number} numero - Número decimal entre 0 e 2047
   * @returns {string} Número em binário
   * @throws {Error} Se o número estiver fora do intervalo válido
   */
  paraBinario(numero) {
    if (!Number.isInteger(numero) || numero < 0 || numero > 2047) {
      throw new Error(
        "Número deve ser um inteiro entre 0 e 2047 para conversão para binário"
      );
    }

    if (numero === 0) {
      return "0";
    }

    let resultado = "";
    let valorRestante = numero;

    while (valorRestante > 0) {
      resultado = (valorRestante % 2) + resultado;
      valorRestante = Math.floor(valorRestante / 2);
    }

    return resultado;
  }

  /**
   * Converter número binário para decimal
   * @param {string} binario - Número em binário (string)
   * @returns {number} Número decimal
   * @throws {Error} Se o formato binário for inválido
   */
  deBinario(binario) {
    if (typeof binario !== "string") {
      throw new Error("Binário deve ser uma string");
    }

    // Validar formato binário (apenas 0s e 1s)
    if (!/^[01]+$/.test(binario)) {
      throw new Error("Formato binário inválido. Deve conter apenas 0s e 1s");
    }

    let resultado = 0;
    const tamanho = binario.length;

    for (let i = 0; i < tamanho; i++) {
      const digito = parseInt(binario[i]);
      const potencia = tamanho - 1 - i;
      resultado += digito * Math.pow(2, potencia);
    }

    // Validar que o resultado está dentro do limite permitido (2047)
    if (resultado > 2047) {
      throw new Error(
        "Número binário convertido excede o limite máximo de 2047"
      );
    }

    return resultado;
  }

  /**
   * Formatar número conforme sistema solicitado
   * @param {number} numero - Número decimal
   * @param {string} sistema - Sistema numérico: 'natural', 'romano' ou 'binario'
   * @returns {string|number} Número formatado (string para romano/binário, number para natural)
   * @throws {Error} Se o sistema for inválido ou o número estiver fora dos limites
   */
  formatarNumero(numero, sistema) {
    if (!Number.isInteger(numero)) {
      throw new Error("Número deve ser um inteiro");
    }

    switch (sistema) {
      case "natural":
        return numero;

      case "romano":
        return this.paraRomano(numero);

      case "binario":
        return this.paraBinario(numero);

      default:
        throw new Error(
          `Sistema inválido: ${sistema}. Use 'natural', 'romano' ou 'binario'`
        );
    }
  }
}

module.exports = new ConversaoService();
