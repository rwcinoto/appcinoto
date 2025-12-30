import React, { useCallback, useEffect, useState } from "react";
import FiltrosRanking from "../components/rankings/FiltrosRanking";
import InfoUsuario from "../components/rankings/InfoUsuario";
import TabelaRanking from "../components/rankings/TabelaRanking";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage, logError } from "../utils/errorHandler";
import api from "../services/api";
import "./Rankings.css";

const Rankings = () => {
  const { usuario } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [posicaoUsuario, setPosicaoUsuario] = useState(null);
  const [totalParticipantes, setTotalParticipantes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState(null); // null até ter todos os filtros obrigatórios
  const [erro, setErro] = useState("");

  const carregarRanking = useCallback(async () => {
    // Não carregar se filtros não estão completos
    if (!filtros || !filtros.operacao_id || !filtros.limite_id || !filtros.sistema_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErro("");

    try {
      // Construir query string com filtros
      const params = new URLSearchParams({
        operacao_id: filtros.operacao_id.toString(),
        limite_id: filtros.limite_id.toString(),
        sistema_id: filtros.sistema_id.toString(),
      });

      // Adicionar conjunto_id se fornecido
      if (filtros.conjunto_id) {
        params.append("conjunto_id", filtros.conjunto_id.toString());
      }

      const url = `/rankings?${params.toString()}`;
      const response = await api.get(url);

      setRanking(response.data.ranking || []);
      setPosicaoUsuario(response.data.posicaoUsuario);
      setTotalParticipantes(response.data.totalParticipantes || 0);
    } catch (error) {
      logError("Rankings - carregarRanking", error);
      setErro(getErrorMessage(error));
      setRanking([]);
      setPosicaoUsuario(null);
      setTotalParticipantes(0);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    if (usuario && filtros) {
      carregarRanking();
    }
  }, [usuario, filtros, carregarRanking]);

  const handleFiltrar = (novosFiltros) => {
    setFiltros(novosFiltros);
  };

  if (!usuario) {
    return (
      <div className="rankings-container">
        <Loading text="Carregando..." />
      </div>
    );
  }

  return (
    <div className="rankings-container">
      <div className="rankings-header">
        <h1>Rankings</h1>
      </div>

      {erro && (
        <ErrorMessage
          message={erro}
          type="error"
          dismissible
          onDismiss={() => setErro("")}
        />
      )}

      <FiltrosRanking onFiltrar={handleFiltrar} />

      {loading ? (
        <Loading text="Carregando ranking..." />
      ) : filtros && filtros.operacao_id && filtros.limite_id && filtros.sistema_id ? (
        <>
          <InfoUsuario
            posicaoUsuario={posicaoUsuario}
            totalParticipantes={totalParticipantes}
            ranking={ranking}
          />

          <TabelaRanking ranking={ranking} posicaoUsuario={posicaoUsuario} />
        </>
      ) : (
        <div className="mensagem-aviso">
          <p>Selecione os filtros acima para visualizar o ranking.</p>
        </div>
      )}
    </div>
  );
};

export default Rankings;

