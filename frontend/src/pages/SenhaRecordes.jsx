import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ErrorMessage from "../components/common/ErrorMessage";
import Loading from "../components/common/Loading";
import ListaRecordesSenha from "../components/recordes/ListaRecordesSenha";
import ListaUltimosRecordesSenhaBatidos from "../components/recordes/ListaUltimosRecordesSenhaBatidos";
import {
  DIGITOS_POR_PLANO,
  LABELS_REPETICAO,
  TAMANHOS_POR_PLANO,
} from "../constants/senha";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getErrorMessage, logError } from "../utils/errorHandler";
import "./Recordes.css";

const SenhaRecordes = () => {
  const { usuario } = useAuth();
  const [searchParams] = useSearchParams();
  const usuarioIdParam = searchParams.get("usuario_id");

  const [usuarioVisualizado, setUsuarioVisualizado] = useState(null);
  const [recordes, setRecordes] = useState([]);
  const [digitosFiltro, setDigitosFiltro] = useState("");
  const [tamanhoFiltro, setTamanhoFiltro] = useState("");
  const [repeticaoFiltro, setRepeticaoFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const planoUsuario = usuario?.id_plano || 2;
  const digitosDisponiveis = useMemo(
    () => DIGITOS_POR_PLANO[planoUsuario] || DIGITOS_POR_PLANO[2],
    [planoUsuario]
  );
  const tamanhosDisponiveis = useMemo(
    () => TAMANHOS_POR_PLANO[planoUsuario] || TAMANHOS_POR_PLANO[2],
    [planoUsuario]
  );

  useEffect(() => {
    const carregarUsuarioVisualizado = async () => {
      if (usuarioIdParam) {
        const usuarioId = parseInt(usuarioIdParam);
        if (!isNaN(usuarioId) && usuarioId !== 0 && usuarioId !== usuario?.id) {
          try {
            const response = await api.get(`/usuarios/${usuarioId}/nome`);
            setUsuarioVisualizado(response.data);
          } catch (error) {
            logError("SenhaRecordes - carregarUsuarioVisualizado", error);
            setErro("Usuário não encontrado");
          }
        } else {
          setUsuarioVisualizado(null);
        }
      } else {
        setUsuarioVisualizado(null);
      }
    };

    if (usuario) {
      carregarUsuarioVisualizado();
    }
  }, [usuarioIdParam, usuario]);

  const carregarRecordes = useCallback(async () => {
    setLoading(true);
    setErro("");

    try {
      const params = new URLSearchParams();

      if (digitosFiltro) params.append("digitos", digitosFiltro);
      if (tamanhoFiltro) params.append("tamanho", tamanhoFiltro);
      if (repeticaoFiltro !== "") params.append("repeticao", repeticaoFiltro);

      if (usuarioIdParam) {
        const usuarioId = parseInt(usuarioIdParam);
        if (!isNaN(usuarioId) && usuarioId !== 0 && usuarioId !== usuario?.id) {
          params.append("usuario_id", usuarioId.toString());
        }
      } else if (usuario?.isVisitante) {
        params.append("usuario_id", "0");
      }

      const queryString = params.toString();
      const url = `/senha/recordes${queryString ? `?${queryString}` : ""}`;

      const response = await api.get(url);
      setRecordes(response.data || []);
    } catch (error) {
      logError("SenhaRecordes - carregarRecordes", error);
      setErro(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [digitosFiltro, tamanhoFiltro, repeticaoFiltro, usuarioIdParam, usuario]);

  useEffect(() => {
    if (usuario) {
      carregarRecordes();
    }
  }, [usuario, carregarRecordes]);

  if (!usuario) {
    return (
      <div className="recordes-container">
        <Loading text="Carregando..." />
      </div>
    );
  }

  const titulo = usuarioVisualizado
    ? `Recordes de senha de ${usuarioVisualizado.nome}`
    : "Meus recordes de senha";

  return (
    <div className="recordes-container">
      <div className="recordes-header">
        <div className="recordes-titulo-container">
          <div className="titulo-com-ajuda">
            <h1>{titulo}</h1>
          </div>
        </div>

        <div className="filtros-header">
          <div className="select-group-filtro">
            <span className="filtro-label">Dígitos:</span>
            <select
              value={digitosFiltro}
              onChange={(e) => setDigitosFiltro(e.target.value)}
              className="select-filtro"
            >
              <option value="">Todos</option>
              {digitosDisponiveis.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="select-group-filtro">
            <span className="filtro-label">Tamanho:</span>
            <select
              value={tamanhoFiltro}
              onChange={(e) => setTamanhoFiltro(e.target.value)}
              className="select-filtro"
            >
              <option value="">Todos</option>
              {tamanhosDisponiveis.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="select-group-filtro">
            <span className="filtro-label">Repetição:</span>
            <select
              value={repeticaoFiltro}
              onChange={(e) => setRepeticaoFiltro(e.target.value)}
              className="select-filtro"
            >
              <option value="">Todos</option>
              {LABELS_REPETICAO.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {erro && (
        <ErrorMessage
          message={erro}
          type="error"
          dismissible
          onDismiss={() => setErro("")}
        />
      )}

      <ListaRecordesSenha
        recordes={recordes}
        loading={loading}
        usuarioIdVisualizado={usuarioIdParam ? parseInt(usuarioIdParam) : null}
        isVisitante={usuario?.isVisitante || false}
      />

      <ListaUltimosRecordesSenhaBatidos />
    </div>
  );
};

export default SenhaRecordes;
