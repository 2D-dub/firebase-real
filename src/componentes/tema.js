import { Platform } from 'react-native';

export const CURSOR_AZUL =
  'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22%3E%3Cpath d=%22M4 2L4 20L9 15L12 22L16 20L13 13L20 13Z%22 fill=%22%237DEBFF%22 stroke=%22%230D4772%22 stroke-width=%221.5%22/%3E%3C/svg%3E") 4 2, auto';

export const ESTILO_CURSOR = Platform.OS === 'web' ? { cursor: CURSOR_AZUL } : {};

export const PUNTOS_POR_DIFICULTAD = {
  facil: 15,
  medio: 35,
  dificil: 100,
};

export const COSMETICOS = [
  {
    id: 'celeste',
    tipo: 'color',
    nombre: 'Azul',
    descripcion: 'Tu color inicial.',
    precio: 0,
    color: '#69C5C9',
  },
  {
    id: 'violeta',
    tipo: 'color',
    nombre: 'Violeta',
    descripcion: 'Un color intenso.',
    precio: 180,
    color: '#C6A0FF',
  },
  {
    id: 'rosa',
    tipo: 'color',
    nombre: 'Rosa',
    descripcion: 'Un tono brillante.',
    precio: 350,
    color: '#FF8DCB',
  },
  {
    id: 'nebula',
    tipo: 'banner',
    nombre: 'Marco violeta',
    descripcion: 'Un marco de color violeta.',
    precio: 300,
    fondo: 'rgba(126, 87, 194, 0.24)',
    borde: '#A88BFF',
  },
  {
    id: 'aurora',
    tipo: 'banner',
    nombre: 'Marco turquesa',
    descripcion: 'Un marco de color turquesa.',
    precio: 650,
    fondo: 'rgba(0, 188, 212, 0.2)',
    borde: '#71F4FF',
  },
  {
    id: 'dorado',
    tipo: 'color',
    nombre: 'Dorado',
    descripcion: 'Nombre dorado con brillo. Requiere 15 victorias difíciles.',
    precio: 1200,
    color: '#FFD76A',
    brillo: true,
    victoriasDificiles: 15,
  },
];

export const COLORES_INICIALES = ['celeste'];
export const BANNERS_INICIALES = [];
