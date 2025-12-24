import React, { useEffect, useState } from "react";
import "./FormOperacao.css";

const FormOperacao = ({
  operacao,
  planos,
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
  });
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (operacao) {
      const isRaiz = operacao.tipo === "raiz";
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
        // Se não for raiz e vier null, inicializar com 0 (obrigatório)
        // Se for raiz e vier null, deixar como string vazia
        min_parcela_2: isRaiz
          ? operacao.min_parcela_2 !== null
            ? operacao.min_parcela_2
            : ""
          : operacao.min_parcela_2 !== null &&
            operacao.min_parcela_2 !== undefined
          ? operacao.min_parcela_2
          : 0,
        max_parcela_2: isRaiz
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

      // Se tipo mudou para "raiz", limpar parcelas 2 e 3
      if (name === "tipo" && value === "raiz") {
        newData.min_parcela_2 = "";
        newData.max_parcela_2 = "";
        newData.min_parcela_3 = "";
        newData.max_parcela_3 = "";
      }
      // Se tipo mudou de "raiz" para outro, preencher parcela 2 com valores padrão
      if (name === "tipo" && value !== "raiz" && formData.tipo === "raiz") {
        newData.min_parcela_2 = 0;
        newData.max_parcela_2 = 9;
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

    // Validar parcela 1
    if (formData.min_parcela_1 > formData.max_parcela_1) {
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
      min_parcela_1:
        typeof formData.min_parcela_1 === "number"
          ? formData.min_parcela_1
          : parseInt(formData.min_parcela_1),
      max_parcela_1:
        typeof formData.max_parcela_1 === "number"
          ? formData.max_parcela_1
          : parseInt(formData.max_parcela_1),
      id_plano: parseInt(formData.id_plano),
    };

    // Se não for raiz, parcela 2 é obrigatória
    if (formData.tipo !== "raiz") {
      dados.min_parcela_2 =
        typeof formData.min_parcela_2 === "number"
          ? formData.min_parcela_2
          : parseInt(formData.min_parcela_2);
      dados.max_parcela_2 =
        typeof formData.max_parcela_2 === "number"
          ? formData.max_parcela_2
          : parseInt(formData.max_parcela_2);
    } else {
      // Para raiz, garantir que min_parcela_2, max_parcela_2, min_parcela_3 e max_parcela_3 não sejam enviados
      // Não incluir esses campos no objeto dados
    }

    // Parcela 3 é sempre opcional (apenas se não for raiz)
    if (formData.tipo !== "raiz") {
      if (formData.min_parcela_3 !== "") {
        dados.min_parcela_3 = parseInt(formData.min_parcela_3);
      }
      if (formData.max_parcela_3 !== "") {
        dados.max_parcela_3 = parseInt(formData.max_parcela_3);
      }
    }

    onSalvar(dados);
  };

  const isRaiz = formData.tipo === "raiz";

  return (
    <form onSubmit={handleSubmit} className="form-operacao">
      <div className="form-group">
        <label htmlFor="nome">Nome *</label>
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
        <label htmlFor="tipo">Tipo *</label>
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
        <label htmlFor="id_plano">Plano *</label>
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

      <div className="parcelas-section">
        <h3>Limites das Parcelas</h3>

        <div className="parcela-group">
          <h4>Parcela 1 *</h4>
          <div className="parcela-inputs">
            <div className="form-group">
              <label htmlFor="min_parcela_1">Mínimo *</label>
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
              <label htmlFor="max_parcela_1">Máximo *</label>
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

        {!isRaiz && (
          <>
            <div className="parcela-group">
              <h4>Parcela 2 *</h4>
              <div className="parcela-inputs">
                <div className="form-group">
                  <label htmlFor="min_parcela_2">Mínimo *</label>
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
                  <label htmlFor="max_parcela_2">Máximo *</label>
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

      {erro && <div className="erro">{erro}</div>}

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
