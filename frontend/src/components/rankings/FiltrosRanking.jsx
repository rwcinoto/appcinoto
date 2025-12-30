import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./FiltrosRanking.css";

const FiltrosRanking = ({
  onFiltrar,
  limiteSelecionado,
  sistemaSelecionado,
}) => {
  const [operacoes, setOperacoes] = useState([]);
  const [conjuntos, setConjuntos] = useState([]);
  const [operacaoSelecionada, setOperacaoSelecionada] = useState("");
  const [conjuntoSelecionado, setConjuntoSelecionado] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [operacoesRes, conjuntosRes] = await Promise.all([
        api.get("/operacoes"),
        api.get("/conjuntos").catch(() => ({ data: [] })), // Se não existir ainda, retorna array vazio
      ]);

      setOperacoes(operacoesRes.data);
      setConjuntos(conjuntosRes.data || []);

      // Definir valores padrão
      if (operacoesRes.data.length > 0) {
        setOperacaoSelecionada(String(operacoesRes.data[0].id));
      }
      // Conjunto começa vazio (global)
      setConjuntoSelecionado("");
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtro automático ao mudar seleção (apenas se operação estiver selecionada e limite/sistema estiverem disponíveis)
  useEffect(() => {
    if (!loading && operacaoSelecionada && limiteSelecionado && sistemaSelecionado) {
      const filtros = {
        operacao_id: parseInt(operacaoSelecionada),
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
    conjuntoSelecionado,
    loading,
    limiteSelecionado,
    sistemaSelecionado,
  ]);

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
                {formatarTipoOperacao(operacao.tipo)}: {operacao.nome}
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

