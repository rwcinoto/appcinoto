import { format } from "date-fns";
import React from "react";
import "./CardRecorde.css";

const CardRecorde = ({ recorde }) => {
  if (!recorde) {
    return null;
  }

  const formatarTipoOperacao = (tipo) => {
    const tipos = {
      soma: "Soma",
      subtracao: "Subtração",
      multiplicacao: "Multiplicação",
      divisao: "Divisão",
      raiz: "Raiz quadrada",
    };
    return tipos[tipo] || tipo;
  };

  const formatarTipoSistema = (tipo) => {
    const tipos = {
      natural: "Natural",
      romano: "Romano",
      binario: "Binário",
    };
    return tipos[tipo] || tipo;
  };

  const formatarData = (data) => {
    if (!data) return "-";
    try {
      const dataObj = new Date(data);
      return format(dataObj, "dd/MM/yy");
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "-";
    }
  };

  const obterCorOperacao = (tipo) => {
    const cores = {
      soma: "#2196f3", // Azul
      subtracao: "#4caf50", // Verde
      multiplicacao: "#ff9800", // Laranja
      divisao: "#ffeb3b", // Amarelo
      raiz: "#f44336", // Vermelho
    };
    return cores[tipo] || "#666";
  };

  const tipoOperacao = recorde.operacao?.tipo || "";
  const corOperacao = obterCorOperacao(tipoOperacao);

  // Calcular tempo médio por conta
  const calcularTempoMedioPorConta = () => {
    const totalAcertos = recorde.total || 0;
    const tempoLimite = recorde.limite?.tempo || 0;

    if (totalAcertos === 0 || tempoLimite === 0) {
      return null;
    }

    const tempoMedio = tempoLimite / totalAcertos;
    return tempoMedio;
  };

  const tempoMedioPorConta = calcularTempoMedioPorConta();
  const tempoMedioFormatado =
    tempoMedioPorConta !== null
      ? tempoMedioPorConta.toFixed(1).replace(".", ",")
      : null;

  return (
    <div className="card-recorde" style={{ borderColor: corOperacao }}>
      <div className="card-recorde-header">
        <div className="card-recorde-titulo-linha">
          <h3>{recorde.operacao?.nome || "Operação"}</h3>
          <span className="card-recorde-tipo" style={{ color: corOperacao }}>
            {formatarTipoOperacao(tipoOperacao)}
          </span>
        </div>
        <div className="card-recorde-acertos-linha">
          <span className="card-recorde-acertos-texto">
            <strong>Acertos:</strong>{" "}
            <span
              className="card-recorde-acertos-valor"
              style={{ color: corOperacao }}
            >
              {recorde.total || 0}
            </span>
            {tempoMedioFormatado && (
              <span className="card-recorde-tempo-medio">
                {" "}({tempoMedioFormatado} seg/conta)
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="card-recorde-info-linha">
        <div className="card-recorde-info-item">
          <span className="card-recorde-info-label">Limite</span>
          <span className="card-recorde-info-value">
            {recorde.limite?.descricao || "-"}
          </span>
        </div>

        <div className="card-recorde-info-item">
          <span className="card-recorde-info-label">Sistema</span>
          <span className="card-recorde-info-value">
            {recorde.sistema?.tipo
              ? formatarTipoSistema(recorde.sistema.tipo)
              : "-"}
          </span>
        </div>

        <div className="card-recorde-info-item">
          <span className="card-recorde-info-label">Data</span>
          <span className="card-recorde-info-value">
            {formatarData(recorde.atualizado_em)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CardRecorde;
