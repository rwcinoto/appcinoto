import React, { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Loading from "../components/common/Loading";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { logError } from "../utils/errorHandler";
import "./Visitantes.css";

const formatarDataAtualizacao = (dataString) => {
  if (!dataString) return "-";
  try {
    const data = new Date(dataString);
    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "-";
  }
};

const Visitantes = () => {
  const { usuario } = useAuth();
  const [recordes, setRecordes] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarRecordes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/visitantes/recordes");
      setRecordes(response.data);
    } catch (error) {
      logError("Visitantes - carregarRecordes", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (usuario?.tipo === "admin") {
      carregarRecordes();
    }
  }, [usuario, carregarRecordes]);

  if (!usuario || usuario.tipo !== "admin") {
    return <Navigate to="/novo-treino" />;
  }

  return (
    <div className="visitantes-container">
      <div className="visitantes-header">
        <h1>Visitantes</h1>
        <p className="visitantes-descricao">
          Quantidade de treinos realizados por visitantes (usuários não logados)
        </p>
      </div>

      {loading ? (
        <Loading text="Carregando..." />
      ) : recordes.length === 0 ? (
        <div className="visitantes-vazio">
          Nenhum treino de visitante registrado ainda.
        </div>
      ) : (
        <div className="visitantes-tabela-wrapper">
          <table className="visitantes-tabela">
            <thead>
              <tr>
                <th>Operação</th>
                <th>Quantidade</th>
                <th>Última atualização</th>
                <th>Limite (min)</th>
                <th>Sistema</th>
              </tr>
            </thead>
            <tbody>
              {recordes.map((rv) => (
                <tr key={rv.id}>
                  <td>{rv.operacao_nome}</td>
                  <td>{rv.quantidade}</td>
                  <td>{formatarDataAtualizacao(rv.atualizado_em)}</td>
                  <td>{rv.limite_minutos ?? "-"}</td>
                  <td>{rv.sistema_descricao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Visitantes;
