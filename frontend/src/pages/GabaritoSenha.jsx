import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./GabaritoSenha.css";

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
          return (
            <div
              key={index}
              className={`gabarito-tentativa-linha ${isAcerto ? "acerto" : ""}`}
            >
              <span className="gabarito-tentativa-numero">{index + 1}.</span>
              <div className="gabarito-tentativa-digitos">
                {t.tentativa.map((d, i) => (
                  <span
                    key={i}
                    className={`gabarito-tentativa-digito ${d === senhaSecreta[i] ? "correto" : ""}`}
                  >
                    {d}
                  </span>
                ))}
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
