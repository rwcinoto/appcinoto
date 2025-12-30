/**
 * Tema do cubo mágico
 * 
 * Paleta de cores baseada nas cores do cubo mágico de Rubik:
 * - Branco: fundo, cards
 * - Amarelo: destaques, top 1
 * - Verde: sucesso, acertos
 * - Azul: primária, links
 * - Vermelho: erros, alertas
 * - Laranja: secundária, top 2-3
 */

const theme = {
  // Cores base do cubo mágico
  colors: {
    // Branco - fundo, cards
    white: '#FFFFFF',
    whiteLight: '#FAFAFA',
    whiteDark: '#F5F5F5',
    
    // Amarelo - destaques, top 1
    yellow: '#FFD700',
    yellowLight: '#FFEB3B',
    yellowDark: '#FFC107',
    
    // Verde - sucesso, acertos
    green: '#4CAF50',
    greenLight: '#8BC34A',
    greenDark: '#388E3C',
    
    // Azul - primária, links
    blue: '#2196F3',
    blueLight: '#03A9F4',
    blueDark: '#1976D2',
    
    // Vermelho - erros, alertas
    red: '#F44336',
    redLight: '#E91E63',
    redDark: '#D32F2F',
    
    // Laranja - secundária, top 2-3
    orange: '#FF9800',
    orangeLight: '#FFB74D',
    orangeDark: '#FF5722',
    
    // Cores auxiliares
    gray: '#757575',
    grayLight: '#BDBDBD',
    grayDark: '#424242',
    black: '#000000',
  },

  // Cores por contexto de uso
  context: {
    // Cores primárias
    primary: '#2196F3',
    primaryLight: '#03A9F4',
    primaryDark: '#1976D2',
    primaryHover: '#1E88E5',
    
    // Cores secundárias
    secondary: '#FF9800',
    secondaryLight: '#FFB74D',
    secondaryDark: '#FF5722',
    secondaryHover: '#FB8C00',
    
    // Sucesso
    success: '#4CAF50',
    successLight: '#8BC34A',
    successDark: '#388E3C',
    successHover: '#43A047',
    
    // Erro
    error: '#F44336',
    errorLight: '#E91E63',
    errorDark: '#D32F2F',
    errorHover: '#E53935',
    
    // Aviso/Alertas
    warning: '#FF9800',
    warningLight: '#FFB74D',
    warningDark: '#FF5722',
    
    // Info
    info: '#2196F3',
    infoLight: '#03A9F4',
    infoDark: '#1976D2',
    
    // Destaque/Top 1
    highlight: '#FFD700',
    highlightLight: '#FFEB3B',
    highlightDark: '#FFC107',
  },

  // Cores para ranking (top 3)
  ranking: {
    top1: '#FFD700',      // Ouro/Amarelo
    top1Light: '#FFEB3B',
    top1Dark: '#FFC107',
    
    top2: '#FF9800',      // Prata/Laranja
    top2Light: '#FFB74D',
    top2Dark: '#FF5722',
    
    top3: '#2196F3',      // Bronze/Azul
    top3Light: '#03A9F4',
    top3Dark: '#1976D2',
  },

  // Cores para operações matemáticas
  operations: {
    soma: '#2196F3',           // Azul
    subtracao: '#4CAF50',      // Verde
    multiplicacao: '#FF9800',  // Laranja
    divisao: '#FFD700',        // Amarelo
    raiz: '#F44336',           // Vermelho suave
  },

  // Cores para feedback visual
  feedback: {
    acerto: '#4CAF50',         // Verde
    acertoLight: '#8BC34A',
    acertoDark: '#388E3C',
    
    erro: '#F44336',           // Vermelho
    erroLight: '#E91E63',
    erroDark: '#D32F2F',
    
    neutro: '#757575',         // Cinza
    neutroLight: '#BDBDBD',
    neutroDark: '#424242',
  },

  // Cores para componentes específicos
  components: {
    // Background
    background: '#FFFFFF',
    backgroundLight: '#FAFAFA',
    backgroundDark: '#F5F5F5',
    
    // Cards
    card: '#FFFFFF',
    cardHover: '#F5F5F5',
    cardBorder: '#E0E0E0',
    
    // Texto
    text: '#212121',
    textLight: '#757575',
    textDark: '#000000',
    textInverse: '#FFFFFF',
    
    // Links
    link: '#2196F3',
    linkHover: '#1976D2',
    linkVisited: '#7B1FA2',
    
    // Botões
    buttonPrimary: '#2196F3',
    buttonPrimaryHover: '#1976D2',
    buttonPrimaryActive: '#1565C0',
    
    buttonSecondary: '#FF9800',
    buttonSecondaryHover: '#FB8C00',
    buttonSecondaryActive: '#F57C00',
    
    buttonDanger: '#F44336',
    buttonDangerHover: '#E53935',
    buttonDangerActive: '#D32F2F',
    
    buttonDisabled: '#BDBDBD',
    buttonDisabledText: '#757575',
    
    // Badges
    badgeNotification: '#FF9800',
    badgeNotificationLight: '#FFB74D',
    badgeSuccess: '#4CAF50',
    badgeError: '#F44336',
    badgeInfo: '#2196F3',
  },

  // Cores para estados
  states: {
    hover: {
      light: 'rgba(0, 0, 0, 0.04)',
      dark: 'rgba(0, 0, 0, 0.08)',
    },
    active: {
      light: 'rgba(0, 0, 0, 0.08)',
      dark: 'rgba(0, 0, 0, 0.12)',
    },
    focus: {
      light: 'rgba(33, 150, 243, 0.12)',
      dark: 'rgba(33, 150, 243, 0.24)',
    },
    disabled: {
      background: '#F5F5F5',
      text: '#9E9E9E',
      border: '#E0E0E0',
    },
  },

  // Sombras
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },

  // Bordas
  borders: {
    radius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },
    width: {
      thin: '1px',
      medium: '2px',
      thick: '4px',
    },
    color: {
      default: '#E0E0E0',
      light: '#F5F5F5',
      dark: '#BDBDBD',
    },
  },

  // Espaçamentos (opcional - pode ser usado para consistência)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
};

export default theme;

// Exportações auxiliares para facilitar o uso
export const {
  colors,
  context,
  ranking,
  operations,
  feedback,
  components,
  states,
  shadows,
  borders,
  spacing,
} = theme;

