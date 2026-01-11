/**
 * Utilitários para conversão de números entre sistemas numéricos
 */

/**
 * Converter número decimal para romano
 * @param {number} numero - Número entre 1 e 3999
 * @returns {string} Número em notação romana
 */
export const paraRomano = (numero) => {
  // Se for null ou undefined, retornar string vazia
  if (numero === null || numero === undefined) {
    return "";
  }

  if (!Number.isInteger(numero) || numero < 1 || numero > 3999) {
    return numero.toString(); // Retornar como string se não puder converter
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
  let num = numero;

  for (const { valor, simbolo } of valores) {
    while (num >= valor) {
      resultado += simbolo;
      num -= valor;
    }
  }

  return resultado;
};

/**
 * Converter número decimal para binário
 * @param {number} numero - Número entre 0 e 2047
 * @returns {string} Número em notação binária
 */
export const paraBinario = (numero) => {
  // Se for null ou undefined, retornar string vazia
  if (numero === null || numero === undefined) {
    return "";
  }

  if (!Number.isInteger(numero) || numero < 0 || numero > 2047) {
    return numero.toString(); // Retornar como string se não puder converter
  }
  return numero.toString(2);
};

/**
 * Converter número decimal para hexadecimal
 * @param {number} numero - Número inteiro não negativo
 * @returns {string} Número em notação hexadecimal (maiúsculas)
 */
export const paraHexadecimal = (numero) => {
  // Se for null ou undefined, retornar string vazia
  if (numero === null || numero === undefined) {
    return "";
  }

  if (!Number.isInteger(numero) || numero < 0) {
    return numero.toString(); // Retornar como string se não puder converter
  }
  return numero.toString(16).toUpperCase();
};

/**
 * Formatar número conforme sistema numérico
 * @param {number|null} numero - Número decimal (pode ser null)
 * @param {string} sistema - 'natural', 'romano', 'binario', 'inteiro', 'decimal' ou 'hexadecimal'
 * @returns {string|number} Número formatado
 */
export const formatarNumero = (numero, sistema) => {
  // Se for null ou undefined, retornar string vazia
  if (numero === null || numero === undefined) {
    return "";
  }

  switch (sistema) {
    case "natural":
      return numero.toString();
    case "inteiro":
      return numero.toString();
    case "decimal":
      // Formatar com vírgula como separador decimal (padrão brasileiro)
      return parseFloat(numero).toFixed(2).replace(".", ",");
    case "romano":
      // Para romano, precisa ser inteiro
      if (!Number.isInteger(numero) || numero < 1 || numero > 3999) {
        return numero.toString();
      }
      return paraRomano(numero);
    case "binario":
      // Para binário, precisa ser inteiro
      if (!Number.isInteger(numero) || numero < 0 || numero > 2047) {
        return numero.toString();
      }
      return paraBinario(numero);
    case "hexadecimal":
      // Para hexadecimal, precisa ser inteiro
      if (!Number.isInteger(numero) || numero < 0) {
        return numero.toString();
      }
      return paraHexadecimal(numero);
    default:
      return numero.toString();
  }
};

/**
 * Obter símbolo da operação matemática
 * @param {string} tipo - Tipo de operação
 * @returns {string} Símbolo da operação
 */
export const obterSimboloOperacao = (tipo) => {
  const simbolos = {
    soma: "+",
    subtracao: "−",
    multiplicacao: "×",
    divisao: "÷",
    raiz: "√",
    conversao: "→",
  };
  return simbolos[tipo] || "?";
};
