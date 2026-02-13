/**
 * Chaves padrão para treinos de calendário (mês e século).
 * Usadas quando não perguntamos ao usuário (PERGUNTAR_CHAVES_CALENDARIO = false).
 * Para voltar a perguntar: defina PERGUNTAR_CHAVES_CALENDARIO = true e o modal
 * voltará a exibir os campos de chave; as telas que iniciam o treino passarão
 * a usar os valores escolhidos no modal.
 */
export const CHAVE_JANEIRO_PADRAO = 1;
export const CHAVE_SECULO_21_PADRAO = -1;

/** Se true, o modal de opções mostra os campos para o usuário escolher a chave de janeiro e do século XXI. */
export const PERGUNTAR_CHAVES_CALENDARIO = false;
