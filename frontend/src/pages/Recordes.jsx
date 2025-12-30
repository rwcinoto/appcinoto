import React, { useCallback, useEffect, useState } from "react";
import FiltrosRecordes from "../components/recordes/FiltrosRecordes";
import ListaRecordes from "../components/recordes/ListaRecordes";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage, logError } from "../utils/errorHandler";
import api from "../services/api";
import "./Recordes.css";

const Recordes = () => {
  const { usuario } = useAuth();
  const [recordes, setRecordes] = useState([]);
  const [loading, setLoading] = useState(true);
  // Inicializar com filtros padrão (limite_id = 1, sistema_id = 1)
  const [filtros, setFiltros] = useState({
    limite_id: 1,
    sistema_id: 1,
  });
  const [erro, setErro] = useState("");

  const carregarRecordes = useCallback(async () => {
    setLoading(true);
    setErro("");

    try {
      // Construir query string com filtros
      const params = new URLSearchParams();
      if (filtros.limite_id) {
        params.append("limite_id", filtros.limite_id);
      }
      if (filtros.sistema_id) {
        params.append("sistema_id", filtros.sistema_id);
      }

      const queryString = params.toString();
      const url = `/recordes${queryString ? `?${queryString}` : ""}`;

      const response = await api.get(url);
      setRecordes(response.data);
    } catch (error) {
      logError("Recordes - carregarRecordes", error);
      setErro(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    if (usuario) {
      carregarRecordes();
    }
  }, [usuario, carregarRecordes]);

  const handleFiltrar = (novosFiltros) => {
    setFiltros(novosFiltros);
  };

  if (!usuario) {
    return (
      <div className="recordes-container">
        <Loading text="Carregando..." />
      </div>
    );
  }

  return (
    <div className="recordes-container">
      <div className="recordes-header">
        <h1>Meus recordes</h1>
      </div>

      {erro && (
        <ErrorMessage
          message={erro}
          type="error"
          dismissible
          onDismiss={() => setErro("")}
        />
      )}

      <FiltrosRecordes
        onFiltrar={handleFiltrar}
        totalRecordes={recordes.length}
      />

      <ListaRecordes recordes={recordes} loading={loading} />
    </div>
  );
};

export default Recordes;
