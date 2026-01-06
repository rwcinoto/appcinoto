"use strict";

/**
 * Service para conversão entre sistemas numéricos (natural, romano, binário, hexadecimal)
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
   * Converter número decimal para hexadecimal
   * @param {number} numero - Número decimal (inteiro não negativo)
   * @returns {string} Número em hexadecimal (maiúsculas)
   * @throws {Error} Se o número for inválido
   */
  paraHexadecimal(numero) {
    if (!Number.isInteger(numero) || numero < 0) {
      throw new Error(
        "Número deve ser um inteiro não negativo para conversão para hexadecimal"
      );
    }

    if (numero === 0) {
      return "0";
    }

    let resultado = "";
    let valorRestante = numero;

    while (valorRestante > 0) {
      const resto = valorRestante % 16;
      // Converter resto para dígito hexadecimal (0-9 ou A-F)
      const digito = resto < 10 ? resto.toString() : String.fromCharCode(65 + resto - 10); // A=65, B=66, etc.
      resultado = digito + resultado;
      valorRestante = Math.floor(valorRestante / 16);
    }

    return resultado;
  }

  /**
   * Converter número hexadecimal para decimal
   * @param {string} hexadecimal - Número em hexadecimal (string)
   * @returns {number} Número decimal
   * @throws {Error} Se o formato hexadecimal for inválido
   */
  deHexadecimal(hexadecimal) {
    if (typeof hexadecimal !== "string") {
      throw new Error("Hexadecimal deve ser uma string");
    }

    // Validar formato hexadecimal (apenas 0-9 e A-F, case insensitive)
    if (!/^[0-9A-Fa-f]+$/.test(hexadecimal)) {
      throw new Error("Formato hexadecimal inválido. Deve conter apenas dígitos 0-9 e letras A-F");
    }

    // Converter para maiúsculas para facilitar processamento
    const hexUpper = hexadecimal.toUpperCase();
    let resultado = 0;
    const tamanho = hexUpper.length;

    for (let i = 0; i < tamanho; i++) {
      const char = hexUpper[i];
      let digito;
      
      // Converter caractere para valor decimal
      if (char >= "0" && char <= "9") {
        digito = parseInt(char);
      } else if (char >= "A" && char <= "F") {
        digito = char.charCodeAt(0) - 55; // A=10, B=11, ..., F=15
      } else {
        throw new Error(`Caractere hexadecimal inválido: ${char}`);
      }

      const potencia = tamanho - 1 - i;
      resultado += digito * Math.pow(16, potencia);
    }

    return resultado;
  }

  /**
   * Formatar número conforme sistema solicitado
   * @param {number} numero - Número decimal
   * @param {string} sistema - Sistema numérico: 'natural', 'romano', 'binario', 'inteiro', 'decimal' ou 'hexadecimal'
   * @returns {string|number} Número formatado (string para romano/binário/hexadecimal/decimal, number para natural/inteiro)
   * @throws {Error} Se o sistema for inválido ou o número estiver fora dos limites
   */
  formatarNumero(numero, sistema) {
    if (sistema === "decimal") {
      // Para sistema decimal, formatar com 2 casas decimais
      return parseFloat(numero).toFixed(2);
    }

    if (!Number.isInteger(numero)) {
      throw new Error("Número deve ser um inteiro");
    }

    switch (sistema) {
      case "natural":
        return numero;

      case "inteiro":
        return numero;

      case "romano":
        return this.paraRomano(numero);

      case "binario":
        return this.paraBinario(numero);

      case "hexadecimal":
        return this.paraHexadecimal(numero);

      default:
        throw new Error(
          `Sistema inválido: ${sistema}. Use 'natural', 'romano', 'binario', 'inteiro', 'decimal' ou 'hexadecimal'`
        );
    }
  }
}

module.exports = new ConversaoService();
