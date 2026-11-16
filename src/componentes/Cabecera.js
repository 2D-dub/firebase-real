import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COSMETICOS } from './tema';

export default function Cabecera({ usuario, perfil }) {
  const color =
    COSMETICOS.find((item) => item.id === perfil?.colorActivo)?.color || '#E8B75A';
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
    backgroundColor: '#182126',
    borderBottomWidth: 1,
    borderBottomColor: '#53625F',
  },
  marca: {
    color: '#F5F1E8',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  usuario: {
    alignItems: 'flex-end',
    maxWidth: '54%',
  },
  etiqueta: {
    color: '#AEB8B4',
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
    color: '#C4CCC9',
    fontSize: 10,
    marginTop: 1,
  },
  acceso: {
    color: '#E8B75A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
