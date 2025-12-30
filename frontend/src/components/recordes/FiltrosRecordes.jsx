import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./FiltrosRecordes.css";

const FiltrosRecordes = ({ onFiltrar, totalRecordes }) => {
  const [limites, setLimites] = useState([]);
  const [sistemas, setSistemas] = useState([]);
  const [limiteSelecionado, setLimiteSelecionado] = useState("1");
  const [sistemaSelecionado, setSistemaSelecionado] = useState("1");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [limitesRes, sistemasRes] = await Promise.all([
        api.get("/limites"),
        api.get("/sistemas"),
      ]);

      setLimites(limitesRes.data);
      setSistemas(sistemasRes.data);

      // Garantir que os valores padrão sejam aplicados após carregar dados
      // Verificar se os IDs 1 existem, caso contrário usar o primeiro disponível
      const limitePadrao =
        limitesRes.data.find((l) => l.id === 1) || limitesRes.data[0];
      const sistemaPadrao =
        sistemasRes.data.find((s) => s.id === 1) || sistemasRes.data[0];

      if (limitePadrao) {
        setLimiteSelecionado(String(limitePadrao.id));
      }
      if (sistemaPadrao) {
        setSistemaSelecionado(String(sistemaPadrao.id));
      }
    } catch (error) {
      console.error("Erro ao carregar limites e sistemas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtro automático ao mudar seleção
  useEffect(() => {
    if (!loading && limiteSelecionado && sistemaSelecionado) {
      const filtros = {
        limite_id: parseInt(limiteSelecionado),
        sistema_id: parseInt(sistemaSelecionado),
      };
      onFiltrar(filtros);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limiteSelecionado, sistemaSelecionado, loading]);

  if (loading) {
    return (
      <div className="filtros-recordes loading">Carregando filtros...</div>
    );
  }

  return (
    <div className="filtros-recordes">
      <div className="filtros-header">
        <h3>Filtros</h3>
        {totalRecordes !== undefined && (
          <span className="total-recordes">
            {totalRecordes}{" "}
            {totalRecordes === 1
              ? "recorde encontrado"
              : "recordes encontrados"}
          </span>
        )}
      </div>

      <div className="filtros-campos">
        <div className="campo-filtro">
          <label htmlFor="limite">Limite</label>
          <select
            id="limite"
            value={limiteSelecionado}
            onChange={(e) => setLimiteSelecionado(e.target.value)}
          >
            {limites.map((limite) => (
              <option key={limite.id} value={limite.id}>
                {limite.descricao}
              </option>
            ))}
          </select>
        </div>

        <div className="campo-filtro">
          <label htmlFor="sistema">Sistema</label>
          <select
            id="sistema"
            value={sistemaSelecionado}
            onChange={(e) => setSistemaSelecionado(e.target.value)}
          >
            {sistemas.map((sistema) => (
              <option key={sistema.id} value={sistema.id}>
                {sistema.descricao}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FiltrosRecordes;
