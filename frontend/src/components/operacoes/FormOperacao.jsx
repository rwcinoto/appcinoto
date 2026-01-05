import React, { useEffect, useState } from "react";
import ErrorMessage from "../common/ErrorMessage";
import "./FormOperacao.css";

const FormOperacao = ({
  operacao,
  planos,
  operacoes, // Lista de operações disponíveis (para seleção em aleatório)
  onSalvar,
  onCancelar,
  disabled = false,
}) => {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tipo: "soma",
    min_parcela_1: 0,
    max_parcela_1: 9,
    min_parcela_2: 0,
    max_parcela_2: 9,
    min_parcela_3: "",
    max_parcela_3: "",
    id_plano: "",
    ordem: "",
    operacoes_incluidas: [], // IDs das operações incluídas (para tipo aleatorio)
  });
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (operacao) {
      const isRaiz = operacao.tipo === "raiz";
      const isAleatorio = operacao.tipo === "aleatorio";
      
      // Extrair IDs das operações incluídas se houver
      const operacoesIncluidas = operacao.operacoes_incluidas 
        ? operacao.operacoes_incluidas.map(op => op.id)
        : [];
      
      setFormData({
        nome: operacao.nome || "",
        descricao: operacao.descricao || "",
        tipo: operacao.tipo || "soma",
        min_parcela_1:
          operacao.min_parcela_1 !== null &&
          operacao.min_parcela_1 !== undefined
            ? operacao.min_parcela_1
            : 0,
        max_parcela_1:
          operacao.max_parcela_1 !== null &&
          operacao.max_parcela_1 !== undefined
            ? operacao.max_parcela_1
            : 9,
        // Se não for raiz/aleatorio e vier null, inicializar com 0 (obrigatório)
        // Se for raiz/aleatorio e vier null, deixar como string vazia
        min_parcela_2: isRaiz || isAleatorio
          ? operacao.min_parcela_2 !== null
            ? operacao.min_parcela_2
            : ""
          : operacao.min_parcela_2 !== null &&
            operacao.min_parcela_2 !== undefined
          ? operacao.min_parcela_2
          : 0,
        max_parcela_2: isRaiz || isAleatorio
          ? operacao.max_parcela_2 !== null
            ? operacao.max_parcela_2
            : ""
          : operacao.max_parcela_2 !== null &&
            operacao.max_parcela_2 !== undefined
          ? operacao.max_parcela_2
          : 0,
        min_parcela_3:
          operacao.min_parcela_3 !== null &&
          operacao.min_parcela_3 !== undefined
            ? operacao.min_parcela_3
            : "",
        max_parcela_3:
          operacao.max_parcela_3 !== null &&
          operacao.max_parcela_3 !== undefined
            ? operacao.max_parcela_3
            : "",
        id_plano: operacao.id_plano?.toString() || "",
        ordem: operacao.ordem?.toString() || "",
        operacoes_incluidas: operacoesIncluidas,
      });
    } else {
      // Ao criar nova operação, inicializar com valores padrão
      // Tipo padrão é "soma", então min_parcela_2 e max_parcela_2 têm valores padrão
      setFormData({
        nome: "",
        descricao: "",
        tipo: "soma",
        min_parcela_1: 0,
        max_parcela_1: 9,
        min_parcela_2: 0,
        max_parcela_2: 9,
        min_parcela_3: "",
        max_parcela_3: "",
        id_plano: planos.length > 0 ? planos[0].id.toString() : "",
        ordem: "",
        operacoes_incluidas: [],
      });
    }
  }, [operacao, planos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let processedValue;
      if (name === "tipo" || name === "nome" || name === "descricao") {
        processedValue = value;
      } else if (name === "id_plano") {
        processedValue = value;
      } else {
        // Para campos numéricos, tratar string vazia como "" e números como números
        if (value === "") {
          processedValue = "";
        } else {
          const parsed = parseInt(value);
          processedValue = isNaN(parsed) ? "" : parsed;
        }
      }

      const newData = {
        ...prev,
        [name]: processedValue,
      };

      // Se tipo mudou para "raiz" ou "aleatorio", limpar parcelas 2 e 3
      if (name === "tipo" && (value === "raiz" || value === "aleatorio")) {
        newData.min_parcela_2 = "";
        newData.max_parcela_2 = "";
        newData.min_parcela_3 = "";
        newData.max_parcela_3 = "";
        if (value === "aleatorio") {
          newData.operacoes_incluidas = [];
        }
      }
      // Se tipo mudou de "raiz" ou "aleatorio" para outro, preencher parcela 2 com valores padrão
      if (name === "tipo" && value !== "raiz" && value !== "aleatorio" && (formData.tipo === "raiz" || formData.tipo === "aleatorio")) {
        newData.min_parcela_2 = 0;
        newData.max_parcela_2 = 9;
        newData.operacoes_incluidas = [];
      }

      return newData;
    });
    setErro("");
  };

  const validarFormulario = () => {
    if (!formData.nome || formData.nome.trim().length < 3) {
      setErro("Nome deve ter no mínimo 3 caracteres");
      return false;
    }

    if (!formData.id_plano) {
      setErro("Plano é obrigatório");
      return false;
    }

    // Validar parcela 1 (exceto para tipo aleatorio)
    if (formData.tipo !== "aleatorio" && formData.min_parcela_1 > formData.max_parcela_1) {
      setErro("min_parcela_1 deve ser menor ou igual a max_parcela_1");
      return false;
    }

    // Se tipo é raiz, validar que parcelas 2 e 3 estão vazias
    if (formData.tipo === "raiz") {
      if (formData.min_parcela_2 !== "" || formData.max_parcela_2 !== "") {
        setErro("Operação do tipo 'raiz' só utiliza parcela_1");
        return false;
      }
      if (formData.min_parcela_3 !== "" || formData.max_parcela_3 !== "") {
        setErro("Operação do tipo 'raiz' só utiliza parcela_1");
        return false;
      }
    } else if (formData.tipo === "aleatorio") {
      // Para aleatório, validar que há pelo menos uma operação incluída
      if (!formData.operacoes_incluidas || formData.operacoes_incluidas.length === 0) {
        setErro("Operação do tipo 'aleatorio' deve ter pelo menos uma operação incluída");
        return false;
      }
    } else {
      // Para outros tipos, parcela 2 é obrigatória
      // Aceitar 0 como valor válido, rejeitar apenas string vazia, null ou undefined
      const min2Val =
        formData.min_parcela_2 === "" ||
        formData.min_parcela_2 === null ||
        formData.min_parcela_2 === undefined;
      const max2Val =
        formData.max_parcela_2 === "" ||
        formData.max_parcela_2 === null ||
        formData.max_parcela_2 === undefined;

      if (min2Val || max2Val) {
        setErro("Parcela 2 é obrigatória (deve fornecer min e max)");
        return false;
      }

      const min2Num =
        typeof formData.min_parcela_2 === "number"
          ? formData.min_parcela_2
          : parseInt(formData.min_parcela_2);
      const max2Num =
        typeof formData.max_parcela_2 === "number"
          ? formData.max_parcela_2
          : parseInt(formData.max_parcela_2);

      if (isNaN(min2Num) || isNaN(max2Num)) {
        setErro("Parcela 2 deve conter valores numéricos válidos");
        return false;
      }

      if (min2Num > max2Num) {
        setErro("min_parcela_2 deve ser menor ou igual a max_parcela_2");
        return false;
      }

      // Validar parcela 3
      if (
        (formData.min_parcela_3 !== "" && formData.max_parcela_3 === "") ||
        (formData.min_parcela_3 === "" && formData.max_parcela_3 !== "")
      ) {
        setErro("Se fornecer parcela_3, deve fornecer min e max");
        return false;
      }

      if (formData.min_parcela_3 !== "" && formData.max_parcela_3 !== "") {
        if (
          parseInt(formData.min_parcela_3) > parseInt(formData.max_parcela_3)
        ) {
          setErro("min_parcela_3 deve ser menor ou igual a max_parcela_3");
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validarFormulario()) {
      return;
    }

    const dados = {
      nome: formData.nome.trim(),
      descricao: formData.descricao.trim() || null,
      tipo: formData.tipo,
      id_plano: parseInt(formData.id_plano),
    };

    // Para tipo aleatorio, não enviar parcelas (ou enviar como 0)
    if (formData.tipo !== "aleatorio") {
      dados.min_parcela_1 =
        typeof formData.min_parcela_1 === "number"
          ? formData.min_parcela_1
          : parseInt(formData.min_parcela_1);
      dados.max_parcela_1 =
        typeof formData.max_parcela_1 === "number"
          ? formData.max_parcela_1
          : parseInt(formData.max_parcela_1);
    } else {
      // Para aleatorio, enviar 0 como padrão (não será usado)
      dados.min_parcela_1 = 0;
      dados.max_parcela_1 = 0;
    }

    // Incluir ordem se fornecida
    if (formData.ordem !== "" && formData.ordem !== null && formData.ordem !== undefined) {
      dados.ordem = parseInt(formData.ordem);
    }

    // Se não for raiz nem aleatorio, parcela 2 é obrigatória
    if (formData.tipo !== "raiz" && formData.tipo !== "aleatorio") {
      dados.min_parcela_2 =
        typeof formData.min_parcela_2 === "number"
          ? formData.min_parcela_2
          : parseInt(formData.min_parcela_2);
      dados.max_parcela_2 =
        typeof formData.max_parcela_2 === "number"
          ? formData.max_parcela_2
          : parseInt(formData.max_parcela_2);
    } else {
      // Para raiz e aleatorio, garantir que min_parcela_2, max_parcela_2, min_parcela_3 e max_parcela_3 não sejam enviados
      // Não incluir esses campos no objeto dados
    }

    // Parcela 3 é sempre opcional (apenas se não for raiz nem aleatorio)
    if (formData.tipo !== "raiz" && formData.tipo !== "aleatorio") {
      if (formData.min_parcela_3 !== "") {
        dados.min_parcela_3 = parseInt(formData.min_parcela_3);
      }
      if (formData.max_parcela_3 !== "") {
        dados.max_parcela_3 = parseInt(formData.max_parcela_3);
      }
    }

    // Se for tipo aleatorio, incluir operações incluídas
    if (formData.tipo === "aleatorio") {
      dados.operacoes_incluidas = formData.operacoes_incluidas;
    }

    onSalvar(dados);
  };

  const isRaiz = formData.tipo === "raiz";
  const isAleatorio = formData.tipo === "aleatorio";

  // Filtrar operações disponíveis para incluir em aleatório
  // Excluir operações aleatórias e a própria operação sendo editada
  const operacoesDisponiveis = operacoes
    ? operacoes.filter(op => 
        op.tipo !== "aleatorio" && 
        (!operacao || op.id !== operacao.id)
      )
    : [];

  const handleOperacaoIncluidaChange = (operacaoId, checked) => {
    setFormData(prev => {
      const ids = prev.operacoes_incluidas || [];
      if (checked) {
        return { ...prev, operacoes_incluidas: [...ids, operacaoId] };
      } else {
        return { ...prev, operacoes_incluidas: ids.filter(id => id !== operacaoId) };
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form-operacao">
      <div className="form-group">
        <label htmlFor="nome">Nome</label>
        <input
          type="text"
          id="nome"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          required
          minLength={3}
          disabled={disabled}
        />
      </div>

      <div className="form-group">
        <label htmlFor="tipo">Tipo</label>
        <select
          id="tipo"
          name="tipo"
          value={formData.tipo}
          onChange={handleChange}
          required
          disabled={disabled}
        >
          <option value="soma">Soma</option>
          <option value="subtracao">Subtração</option>
          <option value="multiplicacao">Multiplicação</option>
          <option value="divisao">Divisão</option>
          <option value="raiz">Raiz</option>
          <option value="aleatorio">Aleatório</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="descricao">Descrição</label>
        <textarea
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          rows={3}
          disabled={disabled}
        />
      </div>

      <div className="form-group">
        <label htmlFor="id_plano">Plano</label>
        <select
          id="id_plano"
          name="id_plano"
          value={formData.id_plano}
          onChange={handleChange}
          required
          disabled={disabled}
        >
          <option value="">Selecione um plano</option>
          {planos.map((plano) => (
            <option key={plano.id} value={plano.id}>
              {plano.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="ordem">Ordem</label>
        <input
          type="number"
          id="ordem"
          name="ordem"
          value={formData.ordem}
          onChange={handleChange}
          min="1"
          placeholder="Deixe vazio para colocar no final"
          disabled={disabled}
        />
        <small className="form-help">
          Ordem de exibição. Se não informado, será colocado no final.
        </small>
      </div>

      {!isAleatorio && (
        <div className="parcelas-section">
          <h3>Limites das Parcelas</h3>

          <div className="parcela-group">
            <h4>Parcela 1</h4>
            <div className="parcela-inputs">
              <div className="form-group">
                <label htmlFor="min_parcela_1">Mínimo</label>
                <input
                  type="number"
                  id="min_parcela_1"
                  name="min_parcela_1"
                  value={formData.min_parcela_1}
                  onChange={handleChange}
                  required
                  disabled={disabled}
                />
              </div>
              <div className="form-group">
                <label htmlFor="max_parcela_1">Máximo</label>
                <input
                  type="number"
                  id="max_parcela_1"
                  name="max_parcela_1"
                  value={formData.max_parcela_1}
                  onChange={handleChange}
                  required
                  disabled={disabled}
                />
              </div>
            </div>
          </div>

        {!isRaiz && !isAleatorio && (
          <>
            <div className="parcela-group">
              <h4>Parcela 2</h4>
              <div className="parcela-inputs">
                <div className="form-group">
                  <label htmlFor="min_parcela_2">Mínimo</label>
                  <input
                    type="number"
                    id="min_parcela_2"
                    name="min_parcela_2"
                    value={formData.min_parcela_2}
                    onChange={handleChange}
                    required={!isRaiz}
                    disabled={disabled}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="max_parcela_2">Máximo</label>
                  <input
                    type="number"
                    id="max_parcela_2"
                    name="max_parcela_2"
                    value={formData.max_parcela_2}
                    onChange={handleChange}
                    required={!isRaiz}
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>

            <div className="parcela-group">
              <h4>Parcela 3 (opcional)</h4>
              <div className="parcela-inputs">
                <div className="form-group">
                  <label htmlFor="min_parcela_3">Mínimo</label>
                  <input
                    type="number"
                    id="min_parcela_3"
                    name="min_parcela_3"
                    value={formData.min_parcela_3}
                    onChange={handleChange}
                    disabled={disabled}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="max_parcela_3">Máximo</label>
                  <input
                    type="number"
                    id="max_parcela_3"
                    name="max_parcela_3"
                    value={formData.max_parcela_3}
                    onChange={handleChange}
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {isRaiz && (
          <div className="info-raiz">
            <small>ⓘ Operação do tipo "Raiz" utiliza apenas a parcela 1.</small>
          </div>
        )}
        </div>
      )}

      {isAleatorio && (
        <div className="parcelas-section">
          <h3>Operações incluídas</h3>
          <div className="operacoes-incluidas-section">
            <h4>Operações incluídas</h4>
            <div className="info-aleatorio">
              <small>ⓘ Selecione quais operações farão parte desta operação aleatória.</small>
            </div>
            {operacoesDisponiveis.length === 0 ? (
              <div className="aviso-sem-operacoes">
                <small>Não há operações disponíveis para incluir. Crie outras operações primeiro.</small>
              </div>
            ) : (
              <div className="operacoes-checkboxes">
                {operacoesDisponiveis.map(op => (
                  <label key={op.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.operacoes_incluidas.includes(op.id)}
                      onChange={(e) => handleOperacaoIncluidaChange(op.id, e.target.checked)}
                      disabled={disabled}
                    />
                    <span>{op.nome} ({op.tipo})</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {erro && (
        <ErrorMessage
          message={erro}
          type="error"
          dismissible
          onDismiss={() => setErro("")}
        />
      )}

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancelar}
          className="btn-cancelar"
          disabled={disabled}
        >
          Cancelar
        </button>
        <button type="submit" className="btn-salvar" disabled={disabled}>
          {operacao ? "Atualizar" : "Criar"}
        </button>
      </div>
    </form>
  );
};

export default FormOperacao;
