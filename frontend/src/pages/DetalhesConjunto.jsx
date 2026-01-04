import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DetalhesConjunto from "../components/conjuntos/DetalhesConjunto";
import ListaElementos from "../components/conjuntos/ListaElementos";
import ModalAdicionarElemento from "../components/conjuntos/ModalAdicionarElemento";
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
  const [elementos, setElementos] = useState([]);
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
      setElementos(response.data.elementos || []);
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

  const handleAdicionarElemento = () => {
    setModalAdicionarAberto(true);
  };

  const handleElementoAdicionado = () => {
    carregarDetalhes();
  };

  const handleTornarAdmin = async (usuarioId) => {
    if (
      !window.confirm(
        "Deseja realmente tornar este elemento um administrador? Ele terá permissões para gerenciar elementos do conjunto."
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

  const handleRemoverElemento = async (usuarioId) => {
    if (
      !window.confirm(
        "Deseja realmente remover este elemento do conjunto? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/conjuntos/${id}/usuarios/${usuarioId}`);
      carregarDetalhes();
    } catch (error) {
      logError("DetalhesConjunto - handleRemoverElemento", error);
      alert(getErrorMessage(error));
    }
  };

  const handleReenviarConvite = async (usuarioId) => {
    if (
      !window.confirm(
        "Deseja realmente reenviar o convite para este elemento? O convite ficará pendente novamente."
      )
    ) {
      return;
    }

    try {
      await api.post(`/conjuntos/${id}/usuarios/${usuarioId}/reenviar`);
      carregarDetalhes();
    } catch (error) {
      logError("DetalhesConjunto - handleReenviarConvite", error);
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
        elementos={elementos}
        meuTipo={meuTipo}
        onAdicionarElemento={handleAdicionarElemento}
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
          <div className="elementos-section">
            <h2>Elementos do conjunto</h2>
            <ListaElementos
              elementos={elementos}
              meuTipo={meuTipo}
              onTornarAdmin={handleTornarAdmin}
              onRemover={handleRemoverElemento}
              onReenviarConvite={handleReenviarConvite}
              loading={false}
            />
          </div>
        </>
      )}

      {modalAdicionarAberto && (
        <ModalAdicionarElemento
          conjuntoId={id}
          onFechar={() => setModalAdicionarAberto(false)}
          onElementoAdicionado={handleElementoAdicionado}
        />
      )}
    </div>
  );
};

export default DetalhesConjuntoPage;

