import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { logError } from "../../utils/errorHandler";
import Loading from "../common/Loading";
import CardUltimoRecordeBatido from "./CardUltimoRecordeBatido";
import "./ListaUltimosRecordesBatidos.css";

const LIMITE = 20;

const ListaUltimosRecordesBatidos = () => {
  const [recordes, setRecordes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const carregar = async () => {
      setErro("");
      try {
        const response = await api.get(
          `/recordes/ultimos-batidos?limite=${LIMITE}`,
        );
        setRecordes(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        logError("ListaUltimosRecordesBatidos - carregar", error);
        setRecordes([]);
        setErro(
          error.response?.status === 404
            ? "Endpoint não encontrado (reinicie o backend)"
            : "Não foi possível carregar os últimos recordes",
        );
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, []);

  if (loading) {
    return (
      <div className="ultimos-recordes-batidos-loading">
        <Loading text="Carregando últimos recordes..." />
      </div>
    );
  }

  if (erro) {
    return (
      <section className="ultimos-recordes-batidos">
        <h2 className="ultimos-recordes-batidos-titulo">
          Últimos recordes batidos no Numix
        </h2>
        <p className="ultimos-recordes-batidos-erro">{erro}</p>
      </section>
    );
  }

  if (!recordes || recordes.length === 0) {
    return (
      <section className="ultimos-recordes-batidos">
        <h2 className="ultimos-recordes-batidos-titulo">
          Últimos recordes batidos no Numix
        </h2>
        <p className="ultimos-recordes-batidos-vazio">
          Nenhum recorde recente para exibir
        </p>
      </section>
    );
  }

  return (
    <section className="ultimos-recordes-batidos">
      <h2 className="ultimos-recordes-batidos-titulo">
        Últimos recordes batidos no Numix
      </h2>
      <div className="ultimos-recordes-batidos-grid">
        {recordes.map((recorde) => (
          <CardUltimoRecordeBatido key={recorde.id} recorde={recorde} />
        ))}
      </div>
    </section>
  );
};

export default ListaUltimosRecordesBatidos;
