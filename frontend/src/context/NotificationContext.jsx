import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";

const NotificationContext = createContext({});

export const NotificationProvider = ({ children }) => {
  const { usuario } = useAuth();
  const [convitesPendentes, setConvitesPendentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Carregar convites pendentes quando o usuário estiver logado
  useEffect(() => {
    if (usuario) {
      carregarConvitesPendentes();
    } else {
      // Limpar convites quando usuário fizer logout
      setConvitesPendentes([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  /**
   * Carrega a lista de convites pendentes do usuário logado
   */
  const carregarConvitesPendentes = async () => {
    if (!usuario) return;

    setLoading(true);
    setErro("");
    try {
      const response = await api.get("/usuarios/convites-pendentes");
      // Se a resposta for um array, usar diretamente; caso contrário, usar array vazio
      const convites = Array.isArray(response.data) ? response.data : [];
      setConvitesPendentes(convites);
      // Limpar erro se a requisição foi bem-sucedida
      setErro("");
    } catch (error) {
      console.error("Erro ao carregar convites pendentes:", error);
      // Só mostrar erro se não for um erro de rede ou se for um erro 500
      // Erros 404 ou array vazio não devem ser tratados como erro
      if (error.response?.status >= 500) {
        setErro("Erro ao carregar convites pendentes. Tente novamente.");
      } else {
        // Para outros erros (como 400, 401, 403), não mostrar mensagem de erro
        // apenas manter lista vazia
        setErro("");
      }
      // Em caso de erro, manter lista vazia
      setConvitesPendentes([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Atualiza a lista de convites após aceitar ou rejeitar um convite
   * Remove o convite da lista local
   */
  const removerConvite = (conjuntoId, usuarioId) => {
    setConvitesPendentes((prev) =>
      prev.filter(
        (convite) =>
          !(
            convite.id_conjunto === conjuntoId &&
            convite.id_usuario === usuarioId
          )
      )
    );
  };

  /**
   * Adiciona um novo convite à lista (para atualização em tempo real)
   */
  const adicionarConvite = (novoConvite) => {
    setConvitesPendentes((prev) => {
      // Verificar se já existe para evitar duplicatas
      const existe = prev.some(
        (convite) =>
          convite.id_conjunto === novoConvite.id_conjunto &&
          convite.id_usuario === novoConvite.id_usuario
      );
      if (!existe) {
        return [...prev, novoConvite];
      }
      return prev;
    });
  };

  /**
   * Aceita um convite e remove da lista
   */
  const aceitarConvite = async (conjuntoId, usuarioId) => {
    try {
      await api.post(
        `/conjuntos/${conjuntoId}/usuarios/${usuarioId}/aceitar`
      );
      removerConvite(conjuntoId, usuarioId);
      return true;
    } catch (error) {
      console.error("Erro ao aceitar convite:", error);
      throw error;
    }
  };

  /**
   * Rejeita um convite e remove da lista
   */
  const rejeitarConvite = async (conjuntoId, usuarioId) => {
    try {
      await api.post(
        `/conjuntos/${conjuntoId}/usuarios/${usuarioId}/rejeitar`
      );
      removerConvite(conjuntoId, usuarioId);
      return true;
    } catch (error) {
      console.error("Erro ao rejeitar convite:", error);
      throw error;
    }
  };

  // Contador de convites pendentes
  const quantidadeConvitesPendentes = convitesPendentes.length;

  return (
    <NotificationContext.Provider
      value={{
        convitesPendentes,
        quantidadeConvitesPendentes,
        loading,
        erro,
        carregarConvitesPendentes,
        aceitarConvite,
        rejeitarConvite,
        adicionarConvite,
        removerConvite,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications deve ser usado dentro de NotificationProvider"
    );
  }
  return context;
};

