export const LIMITE_TENTATIVAS = 20;

export const DIGITOS_POR_PLANO = {
  2: [6],
  3: [6, 7],
  4: [6, 7, 8],
  5: [6, 7, 8, 9],
  6: [6, 7, 8, 9, 10],
};

export const TAMANHOS_POR_PLANO = {
  2: [4],
  3: [3, 4],
  4: [3, 4, 5],
  5: [3, 4, 5],
  6: [3, 4, 5],
};

export const REPETICAO_POR_PLANO = {
  2: [0],
  3: [0, 1],
  4: [0, 1],
  5: [0, 1],
  6: [0, 1],
};

export const LABELS_REPETICAO = [
  { value: 0, label: "Não" },
  { value: 1, label: "Sim" },
];

export const CORES_POR_DIGITOS = {
  6: "#2196f3",
  7: "#4caf50",
  8: "#ff9800",
  9: "#f44336",
  10: "#9c27b0",
};

export const obterCorPorDigitos = (digitos) => {
  return CORES_POR_DIGITOS[digitos] || "#666";
};

export const formatarTempoSenha = (ms) => {
  if (!ms) return "-";
  const totalSeg = Math.floor(ms / 1000);
  const min = Math.floor(totalSeg / 60);
  const seg = totalSeg % 60;
  const cent = Math.floor((ms % 1000) / 10);
  if (min > 0) {
    return `${min}:${seg.toString().padStart(2, "0")}.${cent.toString().padStart(2, "0")}`;
  }
  return `${seg}.${cent.toString().padStart(2, "0")}s`;
};
