"use strict";

const calendarioService = require("./calendarioService");

const {
  TIPOS_TREINO_CALENDARIO,
  sortearDataGeral,
  sortearDataSeculo21,
  sortearDataAnoAtual,
  calcularDiaSemana,
  converterDiaSemanaParaFormatoUsuario,
} = calendarioService;

/**
 * Serviço para geração de datas de treino de calendário e validação de respostas.
 *
 * Responsabilidades deste service:
 * - sortear datas conforme o tipo de treino (data geral, século XXI, etc.)
 * - gerar buffers de datas (várias datas de uma vez)
 * - fornecer funções auxiliares para treinos de meses, anos e séculos
 * - validar respostas de dia da semana (número ou texto abreviado)
 */
class TreinoCalendarioService {
  /**
   * Gerar uma lista de datas conforme o tipo de treino.
   *
   * @param {number} quantidade - Quantidade de datas a gerar
   * @param {string} tipo - Tipo de treino (data_geral, dia, mes, ano, seculo, data_esse_ano, data_21)
   * @returns {Array<{ ano: number, mes: number, dia: number }>}
   */
  gerarDatas(quantidade = 1, tipo = TIPOS_TREINO_CALENDARIO.DATA_GERAL) {
    const qtde = Math.max(1, quantidade | 0);
    const datas = [];

    for (let i = 0; i < qtde; i++) {
      let data;

      switch (tipo) {
        case TIPOS_TREINO_CALENDARIO.DATA_21:
          data = sortearDataSeculo21();
          break;

        case TIPOS_TREINO_CALENDARIO.DATA_ESSE_ANO:
          // Apenas datas do ano atual (Brasil).
          data = sortearDataAnoAtual();
          break;

        case TIPOS_TREINO_CALENDARIO.DIA:
        case TIPOS_TREINO_CALENDARIO.MES:
        case TIPOS_TREINO_CALENDARIO.ANO:
        case TIPOS_TREINO_CALENDARIO.SECULO:
          // Para treinos de dia/mês/ano/século, usamos o mesmo sorteio geral.
          // A diferença estará na forma de validar a resposta.
          data = sortearDataGeral();
          break;

        case TIPOS_TREINO_CALENDARIO.DATA_GERAL:
        default:
          data = sortearDataGeral();
          break;
      }

      datas.push(data);
    }

    return datas;
  }

  /**
   * Gerar um buffer de datas (similar ao buffer de contas).
   * Pode ser usado para pré-carregar 150 datas para cada minuto de treino.
   *
   * @param {number} quantidade
   * @param {string} tipo
   * @returns {Array<{ ano: number, mes: number, dia: number }>}
   */
  gerarBufferDatas(
    quantidade = 150,
    tipo = TIPOS_TREINO_CALENDARIO.DATA_GERAL,
  ) {
    // Estratégia simples: apenas gerar a quantidade solicitada.
    // Se quisermos evitar repetições consecutivas, poderemos evoluir aqui.
    return this.gerarDatas(quantidade, tipo);
  }

  /**
   * Normaliza uma chave para o intervalo -7..7, mantendo equivalência módulo 7.
   *
   * Exemplo: 8 -> 1, -8 -> -1, 14 -> 0, -14 -> 0
   *
   * @param {number} valor
   * @returns {number}
   */
  normalizarChaveModulo7(valor) {
    if (typeof valor !== "number" || !Number.isFinite(valor)) {
      throw new Error("Valor inválido para normalização módulo 7.");
    }
    const mod = ((valor % 7) + 7) % 7; // 0..6
    // Representar 0 como 0 mesmo; -0 não é necessário.
    if (mod === 0) return 0;
    // Escolher a representação em -7..7 com menor valor absoluto
    return mod <= 3 ? mod : mod - 7; // 4 -> -3, 5 -> -2, 6 -> -1
  }

  /**
   * Calcula a chave de um mês, dado o valor base de janeiro.
   *
   * Regras:
   * - janeiro = base (digitado pela pessoa, padrão 0)
   * - outubro = janeiro
   * - abril e julho = janeiro - 1
   * - maio = janeiro + 1
   * - agosto = janeiro + 2
   * - fevereiro, março e novembro = janeiro + 3
   * - setembro e dezembro = janeiro - 2
   * - junho = janeiro - 3
   *
   * @param {number} mes - 1 (janeiro) a 12 (dezembro)
   * @param {number} chaveJaneiroBase
   * @returns {number} chave normalizada em -7..7 (equivalente módulo 7)
   */
  calcularChaveMes(mes, chaveJaneiroBase) {
    let delta = 0;

    switch (mes) {
      case 1: // janeiro
        delta = 0;
        break;
      case 10: // outubro
        delta = 0;
        break;
      case 4: // abril
      case 7: // julho
        delta = -1;
        break;
      case 5: // maio
        delta = 1;
        break;
      case 8: // agosto
        delta = 2;
        break;
      case 2: // fevereiro
      case 3: // março
      case 11: // novembro
        delta = 3;
        break;
      case 9: // setembro
      case 12: // dezembro
        delta = -2;
        break;
      case 6: // junho
        delta = -3;
        break;
      default:
        throw new Error("Mês inválido para cálculo de chave.");
    }

    const valorBruto = (chaveJaneiroBase || 0) + delta;
    return this.normalizarChaveModulo7(valorBruto);
  }

  /**
   * Valida uma resposta de treino de MESES.
   *
   * A pessoa vê a data completa, mas responde apenas a chave do mês,
   * calculada a partir da chave de janeiro informada (base).
   *
   * Usamos a mesma convenção de chaves em -7..7 (equivalentes módulo 7).
   *
   * @param {{ ano: number, mes: number, dia: number }} data
   * @param {string|number} respostaUsuario
   * @param {number} chaveJaneiroBase
   * @returns {{ correto: boolean, chaveEsperada: number }}
   */
  validarRespostaMes(data, respostaUsuario, chaveJaneiroBase = 0) {
    const { mes } = data || {};
    if (!mes) {
      throw new Error("Data inválida para validação de chave de mês.");
    }

    const baseNormalizada = this.normalizarChaveModulo7(
      Number(chaveJaneiroBase) || 0,
    );
    const chaveEsperada = this.calcularChaveMes(mes, baseNormalizada);

    const respostaNum =
      typeof respostaUsuario === "string"
        ? parseInt(respostaUsuario.trim(), 10)
        : Number(respostaUsuario);

    let correto = false;

    if (!Number.isNaN(respostaNum)) {
      const respostaNormalizada = this.normalizarChaveModulo7(respostaNum);
      correto = respostaNormalizada === chaveEsperada;
    }

    return {
      correto,
      chaveEsperada,
    };
  }

  /**
   * Calcula a chave de século para um ano, dado o valor base do século XXI.
   *
   * Regras (relativas ao século XXI):
   * - século XVII = mesmo valor do XXI
   * - séculos XVI, XX e XXIV = valor do XXI + 1
   * - séculos XIX e XXIII = valor do XXI + 3
   * - séculos XVIII e XXII = valor do XXI - 2
   *
   * Observação: usamos a notação "século N" usual,
   * onde N = floor(ano / 100) + 1 (ex.: 1984 -> século 20).
   *
   * @param {number} ano
   * @param {number} chaveSeculo21Base
   * @returns {number} chave normalizada em -7..7 (equivalente módulo 7)
   */
  calcularChaveSeculo(ano, chaveSeculo21Base) {
    if (typeof ano !== "number" || !Number.isFinite(ano)) {
      throw new Error("Ano inválido para cálculo de chave de século.");
    }

    const seculo = Math.floor(ano / 100) + 1;
    let delta;

    switch (seculo) {
      case 17:
      case 21:
        delta = 0;
        break;
      case 16:
      case 20:
      case 24:
        delta = 1;
        break;
      case 19:
      case 23:
        delta = 3;
        break;
      case 18:
      case 22:
        delta = -2;
        break;
      default: {
        // Para outros séculos, seguir o mesmo padrão cíclico (módulo 4)
        // mapeando-os para o grupo mais próximo conhecido.
        const seculoRef = (((seculo - 16) % 4) + 4) % 4; // 0..3
        // 0 -> como 16, 1 -> como 17, 2 -> como 18, 3 -> como 19
        if (seculoRef === 0) {
          delta = 1;
        } else if (seculoRef === 1) {
          delta = 0;
        } else if (seculoRef === 2) {
          delta = -2;
        } else {
          delta = 3;
        }
        break;
      }
    }

    const valorBruto = (chaveSeculo21Base || 0) + delta;
    return this.normalizarChaveModulo7(valorBruto);
  }

  /**
   * Calcula a chave do ano a partir dos dois últimos dígitos,
   * usando a fórmula: (ANO + INT(ANO / 4)) mod 7
   *
   * @param {number} anoCompleto - ex.: 1984
   * @returns {number} valor entre 0 e 6
   */
  calcularChaveAno(anoCompleto) {
    if (typeof anoCompleto !== "number" || !Number.isFinite(anoCompleto)) {
      throw new Error("Ano inválido para cálculo de chave de ano.");
    }

    const doisUltimos = Math.abs(anoCompleto) % 100;
    const chave = (doisUltimos + Math.floor(doisUltimos / 4)) % 7;
    return chave;
  }

  /**
   * Valida uma resposta de treino de ANOS.
   *
   * A pessoa vê a data completa, mas responde apenas a chave do ano:
   *   (ANO + INT(ANO / 4)) mod 7,
   * onde ANO são os dois últimos dígitos do ano.
   *
   * Aceitamos qualquer inteiro; ele é normalizado módulo 7 para permitir,
   * por exemplo, que 7 seja aceito como 0, 14 como 0, etc.
   *
   * @param {{ ano: number, mes: number, dia: number }} data
   * @param {string|number} respostaUsuario
   * @returns {{ correto: boolean, chaveEsperada: number }}
   */
  validarRespostaAno(data, respostaUsuario) {
    const { ano } = data || {};
    if (!ano) {
      throw new Error("Data inválida para validação de chave de ano.");
    }

    const chaveEsperada = this.calcularChaveAno(ano); // 0..6

    const respostaNum =
      typeof respostaUsuario === "string"
        ? parseInt(respostaUsuario.trim(), 10)
        : Number(respostaUsuario);

    let correto = false;

    if (!Number.isNaN(respostaNum)) {
      // Normalizar módulo 7 para aceitar, por exemplo, 7, 14, -7, etc.
      const normalizada = ((respostaNum % 7) + 7) % 7;
      correto = normalizada === chaveEsperada;
    }

    return {
      correto,
      chaveEsperada,
    };
  }

  /**
   * Valida uma resposta de treino de DIAS.
   *
   * A pessoa vê a data completa, mas responde apenas o dia da data (DIA mod 7).
   *
   * @param {{ ano: number, mes: number, dia: number }} data
   * @param {string|number} respostaUsuario
   * @returns {{ correto: boolean, restoEsperado: number }}
   */
  validarRespostaDia(data, respostaUsuario) {
    const { dia } = data || {};
    if (!dia) {
      throw new Error("Data inválida para validação de treino de dias.");
    }

    const restoEsperado = ((dia % 7) + 7) % 7; // 0..6

    const respostaNum =
      typeof respostaUsuario === "string"
        ? parseInt(respostaUsuario.trim(), 10)
        : Number(respostaUsuario);

    let correto = false;

    if (!Number.isNaN(respostaNum)) {
      const normalizada = ((respostaNum % 7) + 7) % 7;
      correto = normalizada === restoEsperado;
    }

    return {
      correto,
      restoEsperado,
    };
  }

  /**
   * Valida uma resposta de treino de SÉCULOS.
   *
   * A pessoa vê a data completa, mas responde apenas a chave do século,
   * relativa à chave do século XXI informada (base, padrão 0).
   *
   * Usamos a mesma convenção de chaves em -7..7 (equivalentes módulo 7).
   *
   * @param {{ ano: number, mes: number, dia: number }} data
   * @param {string|number} respostaUsuario
   * @param {number} chaveSeculo21Base
   * @returns {{ correto: boolean, chaveEsperada: number }}
   */
  validarRespostaSeculo(data, respostaUsuario, chaveSeculo21Base = 0) {
    const { ano } = data || {};
    if (!ano) {
      throw new Error("Data inválida para validação de chave de século.");
    }

    const baseNormalizada = this.normalizarChaveModulo7(
      Number(chaveSeculo21Base) || 0,
    );
    const chaveEsperada = this.calcularChaveSeculo(ano, baseNormalizada);

    const respostaNum =
      typeof respostaUsuario === "string"
        ? parseInt(respostaUsuario.trim(), 10)
        : Number(respostaUsuario);

    let correto = false;

    if (!Number.isNaN(respostaNum)) {
      const respostaNormalizada = this.normalizarChaveModulo7(respostaNum);
      correto = respostaNormalizada === chaveEsperada;
    }

    return {
      correto,
      chaveEsperada,
    };
  }

  /**
   * Valida uma resposta de dia da semana para uma data específica.
   *
   * - tipoResposta "numeros": usuário digita 0–7, onde:
   *   1 = domingo, 2 = segunda, ..., 6 = sexta, 0 ou 7 = sábado.
   * - tipoResposta "texto": usuário digita abreviações:
   *   "dom", "seg", "ter", "qua", "qui", "sex", "sab"/"sáb".
   *
   * @param {{ ano: number, mes: number, dia: number }} data
   * @param {string|number} respostaUsuario
   * @param {("numeros"|"texto")} tipoResposta
   * @returns {{
   *   correto: boolean,
   *   diaSemanaEsperadoNumero: number,
   *   diaSemanaEsperadoTexto: string
   * }}
   */
  validarRespostaData(data, respostaUsuario, tipoResposta = "numeros") {
    const { ano, mes, dia } = data || {};
    if (!ano || !mes || !dia) {
      throw new Error("Data inválida para validação de resposta.");
    }

    const diaSemana = calcularDiaSemana(ano, mes, dia); // 0=domingo..6=sábado
    const codigoEsperado = converterDiaSemanaParaFormatoUsuario(diaSemana); // 1..7

    const nomesCanonicos = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
    const diaSemanaEsperadoTexto = nomesCanonicos[diaSemana];

    let correto = false;

    if (tipoResposta === "numeros") {
      const respostaNum =
        typeof respostaUsuario === "string"
          ? parseInt(respostaUsuario.trim(), 10)
          : Number(respostaUsuario);

      if (!Number.isNaN(respostaNum)) {
        if (codigoEsperado === 7) {
          // Sábado: aceitar 0 ou 7
          correto = respostaNum === 0 || respostaNum === 7;
        } else {
          correto = respostaNum === codigoEsperado;
        }
      }
    } else {
      // tipoResposta === "texto"
      const normalizar = (str) =>
        String(str || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

      const respostaNorm = normalizar(respostaUsuario);

      const mapaSinonimos = {
        dom: ["dom", "domingo"],
        seg: ["seg", "segunda", "segunda-feira", "segunda feira"],
        ter: ["ter", "terca", "terca-feira", "terca feira"],
        qua: ["qua", "quarta", "quarta-feira", "quarta feira"],
        qui: ["qui", "quinta", "quinta-feira", "quinta feira"],
        sex: ["sex", "sexta", "sexta-feira", "sexta feira"],
        sab: ["sab", "sabado", "sabado-feira", "sabado feira"],
      };

      const chave = diaSemanaEsperadoTexto;
      const sinonimos = mapaSinonimos[chave] || [chave];

      correto = sinonimos.some((s) => normalizar(s) === respostaNorm);
    }

    return {
      correto,
      diaSemanaEsperadoNumero: codigoEsperado,
      diaSemanaEsperadoTexto,
    };
  }
}

module.exports = new TreinoCalendarioService();
