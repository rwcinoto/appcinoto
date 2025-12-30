import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DetalhesConjunto from "../components/conjuntos/DetalhesConjunto";
import ListaMembros from "../components/conjuntos/ListaMembros";
import ModalAdicionarMembro from "../components/conjuntos/ModalAdicionarMembro";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage, logError } from "../utils/errorHandler";
import api from "../services/api";
import "./DetalhesConjunto.css";

const DetalhesConjuntoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [conjunto, setConjunto] = useState(null);
  const [membros, setMembros] = useState([]);
  const [meuTipo, setMeuTipo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
  const [semPermissao, setSemPermissao] = useState(false);

  const carregarDetalhes = useCallback(async () => {
    if (!usuario || !id) return;

    setLoading(true);
    setErro("");
    setSemPermissao(false);

    try {
      const response = await api.get(`/conjuntos/${id}`);
      setConjunto(response.data);
      setMembros(response.data.membros || []);
      setMeuTipo(response.data.meu_tipo || null);
    } catch (error) {
      logError("DetalhesConjunto - carregarDetalhes", error);
      if (error.response?.status === 403) {
        setSemPermissao(true);
        setErro(getErrorMessage(error));
      } else {
        setErro(getErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  }, [usuario, id]);

  useEffect(() => {
    if (usuario) {
      carregarDetalhes();
    }
  }, [usuario, carregarDetalhes]);

  const handleAdicionarMembro = () => {
    setModalAdicionarAberto(true);
  };

  const handleMembroAdicionado = () => {
    carregarDetalhes();
  };

  const handleTornarAdmin = async (usuarioId) => {
    if (
      !window.confirm(
        "Deseja realmente tornar este membro um administrador? Ele terá permissões para gerenciar membros do conjunto."
      )
    ) {
      return;
    }

    try {
      await api.put(`/conjuntos/${id}/usuarios/${usuarioId}`, {
        tipo: "admin",
      });
      carregarDetalhes();
    } catch (error) {
      logError("DetalhesConjunto - handleTornarAdmin", error);
      alert(getErrorMessage(error));
    }
  };

  const handleRemoverMembro = async (usuarioId) => {
    if (
      !window.confirm(
        "Deseja realmente remover este membro do conjunto? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/conjuntos/${id}/usuarios/${usuarioId}`);
      carregarDetalhes();
    } catch (error) {
      logError("DetalhesConjunto - handleRemoverMembro", error);
      alert(getErrorMessage(error));
    }
  };

  if (!usuario) {
    return (
      <div className="detalhes-conjunto-container">
        <Loading text="Carregando..." />
      </div>
    );
  }

  if (semPermissao) {
    return (
      <div className="detalhes-conjunto-container">
        <div className="erro-container">
          <h2>Acesso negado</h2>
          <p>Você não tem permissão para ver este conjunto.</p>
          <button onClick={() => navigate("/conjuntos")}>
            Voltar para conjuntos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detalhes-conjunto-container">
      <DetalhesConjunto
        conjunto={conjunto}
        membros={membros}
        meuTipo={meuTipo}
        onAdicionarMembro={handleAdicionarMembro}
        loading={loading}
      />

      {erro && !loading && (
        <ErrorMessage
          message={erro}
          type="error"
          dismissible
          onDismiss={() => setErro("")}
        />
      )}

      {!loading && conjunto && (
        <>
          <div className="membros-section">
            <h2>Membros do conjunto</h2>
            <ListaMembros
              membros={membros}
              meuTipo={meuTipo}
              onTornarAdmin={handleTornarAdmin}
              onRemover={handleRemoverMembro}
              loading={false}
            />
          </div>
        </>
      )}

      {modalAdicionarAberto && (
        <ModalAdicionarMembro
          conjuntoId={id}
          onFechar={() => setModalAdicionarAberto(false)}
          onMembroAdicionado={handleMembroAdicionado}
        />
      )}
    </div>
  );
};

export default DetalhesConjuntoPage;

