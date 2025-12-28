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

  const formatarTempo = (segundos) => {
    if (segundos < 60) {
      return `${segundos}s`;
    } else if (segundos < 3600) {
      const minutos = Math.floor(segundos / 60);
      const segundosRestantes = segundos % 60;
      return segundosRestantes > 0
        ? `${minutos}min ${segundosRestantes}s`
        : `${minutos}min`;
    } else {
      const horas = Math.floor(segundos / 3600);
      const minutos = Math.floor((segundos % 3600) / 60);
      const segundosRestantes = segundos % 60;
      let resultado = `${horas}h`;
      if (minutos > 0) resultado += ` ${minutos}min`;
      if (segundosRestantes > 0) resultado += ` ${segundosRestantes}s`;
      return resultado;
    }
  };

  const formatarTipoSistema = (tipo) => {
    const tipos = {
      arabico: "Arábico",
      romano: "Romano",
      binario: "Binário",
    };
    return tipos[tipo] || tipo;
  };

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
          <label htmlFor="limite">Limite de tempo</label>
          <select
            id="limite"
            value={limiteSelecionado}
            onChange={(e) => setLimiteSelecionado(e.target.value)}
          >
            {limites.map((limite) => (
              <option key={limite.id} value={limite.id}>
                {limite.descricao} ({formatarTempo(limite.tempo)})
              </option>
            ))}
          </select>
        </div>

        <div className="campo-filtro">
          <label htmlFor="sistema">Sistema numérico</label>
          <select
            id="sistema"
            value={sistemaSelecionado}
            onChange={(e) => setSistemaSelecionado(e.target.value)}
          >
            {sistemas.map((sistema) => (
              <option key={sistema.id} value={sistema.id}>
                {formatarTipoSistema(sistema.tipo)}
                {sistema.descricao ? ` - ${sistema.descricao}` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FiltrosRecordes;
