import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COSMETICOS } from './tema';

export default function Cabecera({ usuario, perfil }) {
  const color =
    COSMETICOS.find((item) => item.id === perfil?.colorActivo)?.color || '#70E8FF';
  const banner = COSMETICOS.find((item) => item.id === perfil?.bannerActivo);
  const nombre =
    perfil?.nombre?.trim() ||
    usuario?.displayName ||
    usuario?.email?.split('@')[0] ||
    'Entrenador';
  const doradoActivo = perfil?.colorActivo === 'dorado';

  return (
    <View
      style={[
        styles.contenedor,
        banner && {
          backgroundColor: banner.fondo,
          borderBottomColor: banner.borde,
        },
      ]}
    >
      <View>
        <Text style={styles.marca}>✦ COSMOS POKÉ ✦</Text>
        <Text style={styles.subtitulo}>TU AVENTURA GALÁCTICA</Text>
      </View>
      {usuario ? (
        <View style={styles.usuario}>
          <Text style={styles.etiqueta}>ENTRENADOR</Text>
          <Text
            numberOfLines={1}
            style={[
              styles.nombre,
              { color, textShadowColor: color },
              doradoActivo && styles.nombreDorado,
            ]}
          >
            {doradoActivo ? '✦ ' : ''}
            {nombre}
            {doradoActivo ? ' ✦' : ''}
          </Text>
          <Text style={styles.puntos}>{Number(perfil?.puntos || 0)} puntos</Text>
        </View>
      ) : (
        <Text style={styles.acceso}>INICIA TU VIAJE</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    minHeight: 74,
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(5, 12, 31, 0.96)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(101, 218, 255, 0.3)',
  },
  marca: {
    color: '#C6F7FF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  subtitulo: {
    color: '#7792B7',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.6,
    marginTop: 3,
  },
  usuario: {
    alignItems: 'flex-end',
    maxWidth: '54%',
  },
  etiqueta: {
    color: '#8096B9',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  nombre: {
    fontSize: 15,
    fontWeight: '800',
    maxWidth: '100%',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  nombreDorado: {
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 },
  },
  puntos: {
    color: '#9AB2D6',
    fontSize: 10,
    marginTop: 1,
  },
  acceso: {
    color: '#70E8FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
