import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./GabaritoSenha.css";

/**
 * Mesma regra do treino (Mastermind): verdes primeiro, depois parciais sem duplicar.
 * @returns {("correto"|"parcial"|"neutro")[]}
 */
function estadosDigitosTentativa(senhaSecreta, tentativa) {
  const tamanho = senhaSecreta.length;
  const estados = Array(tamanho).fill("neutro");

  const senhaRestante = [];
  const indicesNaoCorretos = [];

  for (let i = 0; i < tamanho; i++) {
    if (tentativa[i] === senhaSecreta[i]) {
      estados[i] = "correto";
    } else {
      senhaRestante.push(senhaSecreta[i]);
      indicesNaoCorretos.push(i);
    }
  }

  const senhaContagem = {};
  for (const d of senhaRestante) {
    senhaContagem[d] = (senhaContagem[d] || 0) + 1;
  }

  for (const i of indicesNaoCorretos) {
    const d = tentativa[i];
    if (senhaContagem[d] > 0) {
      estados[i] = "parcial";
      senhaContagem[d]--;
    }
  }

  return estados;
}

const GabaritoSenha = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    tentativas = [],
    senhaSecreta = [],
    acertou = false,
    digitos,
    tamanho,
    repeticao,
  } = location.state || {};

  if (!senhaSecreta || senhaSecreta.length === 0) {
    return (
      <div className="gabarito-senha-container">
        <div className="gabarito-senha-vazio">
          <p>Nenhum dado de treino encontrado.</p>
          <button
            className="btn-voltar-ranking"
            onClick={() => navigate("/senha")}
          >
            Voltar ao ranking
          </button>
        </div>
      </div>
    );
  }

  const tentativaAcerto = acertou ? tentativas.length : null;

  return (
    <div className="gabarito-senha-container">
      <div className="gabarito-senha-header">
        <h1>Gabarito</h1>
        <span className="gabarito-senha-config">
          {digitos} dígitos · Tamanho {tamanho}
          {repeticao ? " · Com repetição" : ""}
        </span>
      </div>

      <div className="gabarito-senha-secreta">
        <span className="gabarito-senha-secreta-label">Senha correta:</span>
        <div className="gabarito-senha-secreta-digitos">
          {senhaSecreta.map((d, i) => (
            <span key={i} className="gabarito-digito-secreto">
              {d}
            </span>
          ))}
        </div>
      </div>

      <div className="gabarito-senha-resumo">
        {acertou ? (
          <span className="gabarito-acertou">
            Acertou na tentativa {tentativaAcerto} de {tentativas.length}
          </span>
        ) : (
          <span className="gabarito-nao-acertou">
            Não acertou em {tentativas.length} tentativas
          </span>
        )}
      </div>

      <div className="gabarito-senha-lista">
        {tentativas.map((t, index) => {
          const isAcerto = acertou && index === tentativas.length - 1;
          const estados = estadosDigitosTentativa(senhaSecreta, t.tentativa);
          return (
            <div
              key={index}
              className={`gabarito-tentativa-linha ${isAcerto ? "acerto" : ""}`}
            >
              <span className="gabarito-tentativa-numero">{index + 1}.</span>
              <div className="gabarito-tentativa-digitos">
                {t.tentativa.map((d, i) => {
                  const estado = estados[i];
                  return (
                    <span
                      key={i}
                      className={
                        estado === "neutro"
                          ? "gabarito-tentativa-digito"
                          : `gabarito-tentativa-digito ${estado}`
                      }
                    >
                      {d}
                    </span>
                  );
                })}
              </div>
              <div className="gabarito-tentativa-feedback">
                {Array(t.corretos)
                  .fill(null)
                  .map((_, i) => (
                    <span
                      key={`c${i}`}
                      className="feedback-correto"
                      title="Posição correta"
                    >
                      ●
                    </span>
                  ))}
                {Array(t.parciais)
                  .fill(null)
                  .map((_, i) => (
                    <span
                      key={`p${i}`}
                      className="feedback-parcial"
                      title="Dígito certo, posição errada"
                    >
                      ○
                    </span>
                  ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="gabarito-senha-actions">
        <button
          className="btn-voltar-ranking"
          onClick={() => navigate("/senha")}
        >
          Voltar ao ranking
        </button>
      </div>
    </div>
  );
};

export default GabaritoSenha;
