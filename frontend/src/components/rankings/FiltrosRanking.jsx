import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./FiltrosRanking.css";

const FiltrosRanking = ({ onFiltrar }) => {
  const [operacoes, setOperacoes] = useState([]);
  const [limites, setLimites] = useState([]);
  const [sistemas, setSistemas] = useState([]);
  const [conjuntos, setConjuntos] = useState([]);
  const [operacaoSelecionada, setOperacaoSelecionada] = useState("");
  const [limiteSelecionado, setLimiteSelecionado] = useState("");
  const [sistemaSelecionado, setSistemaSelecionado] = useState("");
  const [conjuntoSelecionado, setConjuntoSelecionado] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [operacoesRes, limitesRes, sistemasRes, conjuntosRes] =
        await Promise.all([
          api.get("/operacoes"),
          api.get("/limites"),
          api.get("/sistemas"),
          api.get("/conjuntos").catch(() => ({ data: [] })), // Se não existir ainda, retorna array vazio
        ]);

      setOperacoes(operacoesRes.data);
      setLimites(limitesRes.data);
      setSistemas(sistemasRes.data);
      setConjuntos(conjuntosRes.data || []);

      // Definir valores padrão (primeiro item de cada lista)
      if (operacoesRes.data.length > 0) {
        setOperacaoSelecionada(String(operacoesRes.data[0].id));
      }
      if (limitesRes.data.length > 0) {
        setLimiteSelecionado(String(limitesRes.data[0].id));
      }
      if (sistemasRes.data.length > 0) {
        setSistemaSelecionado(String(sistemasRes.data[0].id));
      }
      // Conjunto começa vazio (global)
      setConjuntoSelecionado("");
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtro automático ao mudar seleção (apenas se todos obrigatórios estiverem preenchidos)
  useEffect(() => {
    if (
      !loading &&
      operacaoSelecionada &&
      limiteSelecionado &&
      sistemaSelecionado
    ) {
      const filtros = {
        operacao_id: parseInt(operacaoSelecionada),
        limite_id: parseInt(limiteSelecionado),
        sistema_id: parseInt(sistemaSelecionado),
      };

      // Adicionar conjunto_id apenas se selecionado (não vazio)
      if (conjuntoSelecionado) {
        filtros.conjunto_id = parseInt(conjuntoSelecionado);
      }

      onFiltrar(filtros);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    operacaoSelecionada,
    limiteSelecionado,
    sistemaSelecionado,
    conjuntoSelecionado,
    loading,
  ]);

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

  if (loading) {
    return (
      <div className="filtros-ranking loading">Carregando filtros...</div>
    );
  }

  return (
    <div className="filtros-ranking">
      <div className="filtros-campos">
        <div className="campo-filtro">
          <label htmlFor="operacao">Operação</label>
          <select
            id="operacao"
            value={operacaoSelecionada}
            onChange={(e) => setOperacaoSelecionada(e.target.value)}
            required
          >
            {operacoes.map((operacao) => (
              <option key={operacao.id} value={operacao.id}>
                {formatarTipoOperacao(operacao.tipo)} - {operacao.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="campo-filtro">
          <label htmlFor="limite">Limite de tempo</label>
          <select
            id="limite"
            value={limiteSelecionado}
            onChange={(e) => setLimiteSelecionado(e.target.value)}
            required
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
            required
          >
            {sistemas.map((sistema) => (
              <option key={sistema.id} value={sistema.id}>
                {formatarTipoSistema(sistema.tipo)}
                {sistema.descricao ? ` - ${sistema.descricao}` : ""}
              </option>
            ))}
          </select>
        </div>

        {conjuntos.length > 0 && (
          <div className="campo-filtro">
            <label htmlFor="conjunto">Conjunto</label>
            <select
              id="conjunto"
              value={conjuntoSelecionado}
              onChange={(e) => setConjuntoSelecionado(e.target.value)}
            >
              <option value="">Global</option>
              {conjuntos.map((conjunto) => (
                <option key={conjunto.id} value={conjunto.id}>
                  {conjunto.nome}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default FiltrosRanking;

