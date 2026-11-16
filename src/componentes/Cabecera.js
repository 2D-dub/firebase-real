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
        <Text style={styles.marca}>JUEGO DE AHORCADO</Text>
      </View>
      {usuario ? (
        <View style={styles.usuario}>
          <Text style={styles.etiqueta}>JUGADOR</Text>
          <Text
            numberOfLines={1}
            style={[
              styles.nombre,
              { color, textShadowColor: color },
              doradoActivo && styles.nombreDorado,
            ]}
          >
            {nombre}
          </Text>
          <Text style={styles.puntos}>{Number(perfil?.puntos || 0)} puntos</Text>
        </View>
      ) : (
        <Text style={styles.acceso}>INICIA SESIÓN</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    minHeight: 64,
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(5, 12, 31, 0.98)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(101, 218, 255, 0.28)',
  },
  marca: {
    color: '#F3FAFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  usuario: {
    alignItems: 'flex-end',
    maxWidth: '54%',
  },
  etiqueta: {
    color: '#8CA0C2',
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
    color: '#A8B9D4',
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
