"use strict";

const LIMITES_POR_PLANO = {
  2: { digitos: [6], tamanhos: [4], repeticao: [0] },
  3: { digitos: [6, 7], tamanhos: [3, 4], repeticao: [0, 1] },
  4: { digitos: [6, 7, 8], tamanhos: [3, 4, 5], repeticao: [0, 1] },
  5: { digitos: [6, 7, 8, 9], tamanhos: [3, 4, 5], repeticao: [0, 1] },
  6: { digitos: [6, 7, 8, 9, 10], tamanhos: [3, 4, 5], repeticao: [0, 1] },
};

class TreinoSenhaService {
  /**
   * Gera a sequência secreta de algarismos.
   *
   * @param {number} digitos - Quantidade de dígitos disponíveis (6-10)
   * @param {number} tamanho - Tamanho da senha (3-5)
   * @param {number} repeticao - 0 = sem repetição, 1 = com repetição
   * @returns {number[]}
   */
  sortearSenha(digitos, tamanho, repeticao) {
    const pool = this._montarPool(digitos);
    const senha = [];

    if (repeticao) {
      for (let i = 0; i < tamanho; i++) {
        senha.push(pool[Math.floor(Math.random() * pool.length)]);
      }
    } else {
      const disponiveis = [...pool];
      for (let i = 0; i < tamanho; i++) {
        const idx = Math.floor(Math.random() * disponiveis.length);
        senha.push(disponiveis[idx]);
        disponiveis.splice(idx, 1);
      }
    }

    return senha;
  }

  /**
   * Compara a tentativa com a senha secreta (algoritmo Mastermind).
   *
   * Primeiro marca os exatos (posição correta), depois nos restantes
   * conta os parciais sem duplicação.
   *
   * @param {number[]} senhaSecreta
   * @param {number[]} tentativa
   * @returns {{ corretos: number, parciais: number }}
   */
  verificarTentativa(senhaSecreta, tentativa) {
    const tamanho = senhaSecreta.length;
    let corretos = 0;

    const senhaRestante = [];
    const tentativaRestante = [];

    for (let i = 0; i < tamanho; i++) {
      if (tentativa[i] === senhaSecreta[i]) {
        corretos++;
      } else {
        senhaRestante.push(senhaSecreta[i]);
        tentativaRestante.push(tentativa[i]);
      }
    }

    let parciais = 0;
    const senhaContagem = {};
    for (const d of senhaRestante) {
      senhaContagem[d] = (senhaContagem[d] || 0) + 1;
    }

    for (const d of tentativaRestante) {
      if (senhaContagem[d] > 0) {
        parciais++;
        senhaContagem[d]--;
      }
    }

    return { corretos, parciais };
  }

  /**
   * Valida se as opções escolhidas são permitidas para o plano do usuário.
   *
   * @param {number} digitos
   * @param {number} tamanho
   * @param {number} repeticao - 0 ou 1
   * @param {number} idPlano
   * @returns {{ valido: boolean, mensagem?: string }}
   */
  validarOpcoes(digitos, tamanho, repeticao, idPlano) {
    const limites = LIMITES_POR_PLANO[idPlano];
    if (!limites) {
      return { valido: false, mensagem: "Plano não permite treinos de senha." };
    }

    if (!limites.digitos.includes(digitos)) {
      return {
        valido: false,
        mensagem: `Seu plano não permite ${digitos} dígitos.`,
      };
    }

    if (!limites.tamanhos.includes(tamanho)) {
      return {
        valido: false,
        mensagem: `Seu plano não permite senha de tamanho ${tamanho}.`,
      };
    }

    if (!limites.repeticao.includes(repeticao)) {
      return {
        valido: false,
        mensagem: "Seu plano não permite repetição de algarismos.",
      };
    }

    if (!repeticao && tamanho > digitos) {
      return {
        valido: false,
        mensagem:
          "Sem repetição, o tamanho da senha não pode ser maior que a quantidade de dígitos.",
      };
    }

    return { valido: true };
  }

  /**
   * Monta o array de algarismos disponíveis.
   * Quando digitos=10, usa 1-9 e 0.
   *
   * @param {number} digitos
   * @returns {number[]}
   */
  _montarPool(digitos) {
    if (digitos === 10) {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    }
    const pool = [];
    for (let i = 1; i <= digitos; i++) {
      pool.push(i);
    }
    return pool;
  }
}

module.exports = new TreinoSenhaService();
