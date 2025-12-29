import React, { useCallback, useEffect, useState } from "react";
import ListaConjuntos from "../components/conjuntos/ListaConjuntos";
import ModalConjunto from "../components/conjuntos/ModalConjunto";
import ModalAdicionarMembro from "../components/conjuntos/ModalAdicionarMembro";
import ConvitesPendentes from "../components/conjuntos/ConvitesPendentes";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
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
  const [modalAdicionarMembroAberto, setModalAdicionarMembroAberto] = useState(false);
  const [conjuntoParaAdicionarMembro, setConjuntoParaAdicionarMembro] = useState(null);

  const carregarConjuntos = useCallback(async () => {
    if (!usuario) return;

    setLoading(true);
    setErro("");

    try {
      const response = await api.get("/conjuntos");
      setConjuntos(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar conjuntos:", error);
      const mensagemErro =
        error.response?.data?.message ||
        "Erro ao carregar conjuntos. Tente novamente.";
      setErro(mensagemErro);
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

  const handleAdicionarMembro = (conjunto) => {
    setConjuntoParaAdicionarMembro(conjunto);
    setModalAdicionarMembroAberto(true);
  };

  const handleModalAdicionarMembroFechar = () => {
    setModalAdicionarMembroAberto(false);
    setConjuntoParaAdicionarMembro(null);
  };

  const handleMembroAdicionado = () => {
    handleModalAdicionarMembroFechar();
    carregarConjuntos();
    // Recarregar convites pendentes após adicionar membro (pode ter criado um novo convite)
    carregarConvitesPendentes();
  };

  if (!usuario) {
    return (
      <div className="conjuntos-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="conjuntos-container">
      <div className="conjuntos-header">
        <h1>Meus conjuntos</h1>
        <button className="btn-criar" onClick={handleCriarConjunto}>
          + Criar conjunto
        </button>
      </div>

      {erro && <div className="mensagem-erro">{erro}</div>}

      <div className="convites-section">
        <ConvitesPendentes onConviteAceito={carregarConjuntos} />
      </div>

      <ListaConjuntos
        conjuntos={conjuntos}
        onEditar={handleEditarConjunto}
        onExcluir={handleExcluirConjunto}
        onAdicionarMembro={handleAdicionarMembro}
        loading={loading}
      />

      {modalAberto && (
        <ModalConjunto
          conjunto={conjuntoEditando}
          onFechar={handleModalFechar}
          onSalvo={handleConjuntoSalvo}
        />
      )}

      {modalAdicionarMembroAberto && conjuntoParaAdicionarMembro && (
        <ModalAdicionarMembro
          conjuntoId={conjuntoParaAdicionarMembro.id}
          onFechar={handleModalAdicionarMembroFechar}
          onMembroAdicionado={handleMembroAdicionado}
        />
      )}
    </div>
  );
};

export default Conjuntos;

