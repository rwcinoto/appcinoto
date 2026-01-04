import React, { useCallback, useEffect, useState } from "react";
import ListaConjuntos from "../components/conjuntos/ListaConjuntos";
import ModalConjunto from "../components/conjuntos/ModalConjunto";
import ModalAdicionarElemento from "../components/conjuntos/ModalAdicionarElemento";
import ConvitesPendentes from "../components/conjuntos/ConvitesPendentes";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { getErrorMessage, logError } from "../utils/errorHandler";
import api from "../services/api";
import "./Conjuntos.css";

const Conjuntos = () => {
  const { usuario } = useAuth();
  const { carregarConvitesPendentes } = useNotifications();
  const [conjuntos, setConjuntos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [conjuntoEditando, setConjuntoEditando] = useState(null);
  const [modalAdicionarElementoAberto, setModalAdicionarElementoAberto] = useState(false);
  const [conjuntoParaAdicionarElemento, setConjuntoParaAdicionarElemento] = useState(null);

  const carregarConjuntos = useCallback(async () => {
    if (!usuario) return;

    setLoading(true);
    setErro("");

    try {
      const response = await api.get("/conjuntos");
      setConjuntos(response.data || []);
    } catch (error) {
      logError("Conjuntos - carregarConjuntos", error);
      setErro(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [usuario]);

  useEffect(() => {
    if (usuario) {
      carregarConjuntos();
      // Não precisa chamar carregarConvitesPendentes aqui, pois o NotificationContext já carrega quando o usuário faz login
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  const handleCriarConjunto = () => {
    setConjuntoEditando(null);
    setModalAberto(true);
  };

  const handleEditarConjunto = (conjunto) => {
    setConjuntoEditando(conjunto);
    setModalAberto(true);
  };

  const handleExcluirConjunto = async (conjuntoId) => {
    if (
      !window.confirm(
        "Deseja realmente excluir este conjunto? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/conjuntos/${conjuntoId}`);
      carregarConjuntos();
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir conjunto";
      alert(mensagemErro);
      console.error("Erro ao excluir conjunto:", error);
    }
  };

  const handleModalFechar = () => {
    setModalAberto(false);
    setConjuntoEditando(null);
  };

  const handleConjuntoSalvo = () => {
    handleModalFechar();
    carregarConjuntos();
  };

  const handleAdicionarElemento = (conjunto) => {
    setConjuntoParaAdicionarElemento(conjunto);
    setModalAdicionarElementoAberto(true);
  };

  const handleModalAdicionarElementoFechar = () => {
    setModalAdicionarElementoAberto(false);
    setConjuntoParaAdicionarElemento(null);
  };

  const handleElementoAdicionado = () => {
    handleModalAdicionarElementoFechar();
    carregarConjuntos();
    // Recarregar convites pendentes após adicionar elemento (pode ter criado um novo convite)
    carregarConvitesPendentes();
  };

  const handleSairConjunto = async (conjuntoId) => {
    if (
      !window.confirm(
        "Deseja realmente sair deste conjunto? Você não aparecerá mais nos rankings deste conjunto."
      )
    ) {
      return;
    }

    try {
      await api.post(`/conjuntos/${conjuntoId}/sair`);
      carregarConjuntos();
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao sair do conjunto";
      alert(mensagemErro);
      console.error("Erro ao sair do conjunto:", error);
    }
  };

  if (!usuario) {
    return (
      <div className="conjuntos-container">
        <Loading text="Carregando..." />
      </div>
    );
  }

  return (
    <div className="conjuntos-container">
      <div className="conjuntos-header">
        <h1>Conjuntos</h1>
        <button className="btn-criar" onClick={handleCriarConjunto}>
          + Criar conjunto
        </button>
      </div>

      {erro && (
        <ErrorMessage
          message={erro}
          type="error"
          dismissible
          onDismiss={() => setErro("")}
        />
      )}

      <div className="convites-section">
        <ConvitesPendentes onConviteAceito={carregarConjuntos} />
      </div>

      <ListaConjuntos
        conjuntos={conjuntos}
        onEditar={handleEditarConjunto}
        onExcluir={handleExcluirConjunto}
        onAdicionarElemento={handleAdicionarElemento}
        onSair={handleSairConjunto}
        loading={loading}
      />

      {modalAberto && (
        <ModalConjunto
          conjunto={conjuntoEditando}
          onFechar={handleModalFechar}
          onSalvo={handleConjuntoSalvo}
        />
      )}

      {modalAdicionarElementoAberto && conjuntoParaAdicionarElemento && (
        <ModalAdicionarElemento
          conjuntoId={conjuntoParaAdicionarElemento.id}
          onFechar={handleModalAdicionarElementoFechar}
          onElementoAdicionado={handleElementoAdicionado}
        />
      )}
    </div>
  );
};

export default Conjuntos;

