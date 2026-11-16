import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { doc, onSnapshot, runTransaction } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import BotonBrillante from './BotonBrillante';
import { COSMETICOS, ESTILO_CURSOR } from './tema';
import avisar from '../avisar';

export default function Tienda() {
  const usuario = auth.currentUser;
  const [perfil, setPerfil] = useState(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (!usuario) return undefined;
    return onSnapshot(
      doc(db, 'usuarios', usuario.uid),
      (snapshot) => setPerfil(snapshot.exists() ? snapshot.data() : null),
      (error) => {
        console.error('Error al cargar la tienda:', error);
        avisar('No se pudo cargar la tienda', error.message);
      }
    );
  }, [usuario]);

  const actualizarCosmetico = async (item) => {
    if (!usuario || procesando) return;
    setProcesando(true);

    try {
      await runTransaction(db, async (transaccion) => {
        const usuarioRef = doc(db, 'usuarios', usuario.uid);
        const snapshot = await transaccion.get(usuarioRef);
        if (!snapshot.exists()) {
          throw new Error('No se encontró el perfil del entrenador.');
        }

        const datos = snapshot.data();
        const esColor = item.tipo === 'color';
        const campoDesbloqueados = esColor
          ? 'coloresDesbloqueados'
          : 'bannersDesbloqueados';
        const campoActivo = esColor ? 'colorActivo' : 'bannerActivo';
        const desbloqueados = Array.isArray(datos[campoDesbloqueados])
          ? datos[campoDesbloqueados]
          : [];
        const yaDesbloqueado = desbloqueados.includes(item.id);

        if (yaDesbloqueado) {
          transaccion.update(usuarioRef, {
            uid: usuario.uid,
            [campoActivo]: item.id,
          });
          return;
        }

        if (Number(datos.puntos || 0) < item.precio) {
          throw new Error('Todavía no tienes suficientes puntos.');
        }
        if (
          item.victoriasDificiles &&
          Number(datos.dificilesCompletados || 0) < item.victoriasDificiles
        ) {
          throw new Error(
            `Necesitas ${item.victoriasDificiles} victorias en dificultad difícil.`
          );
        }

        transaccion.update(usuarioRef, {
          uid: usuario.uid,
          puntos: Number(datos.puntos || 0) - item.precio,
          [campoDesbloqueados]: [...desbloqueados, item.id],
          [campoActivo]: item.id,
        });
      });
    } catch (error) {
      avisar('No se pudo actualizar el cosmético', error.message);
    } finally {
      setProcesando(false);
    }
  };

  const estaDesbloqueado = (item) => {
    const lista =
      item.tipo === 'color'
        ? perfil?.coloresDesbloqueados
        : perfil?.bannersDesbloqueados;
    return Array.isArray(lista) && lista.includes(item.id);
  };

  const estaEquipado = (item) =>
    perfil?.[item.tipo === 'color' ? 'colorActivo' : 'bannerActivo'] === item.id;

  return (
    <View style={[styles.pantalla, ESTILO_CURSOR]}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.insignia}>RECOMPENSAS DE ENTRENADOR</Text>
        <Text style={styles.titulo}>Tienda de recompensas</Text>
        <Text style={styles.descripcion}>
          Canjea tus puntos por colores y banners para tu nombre.
        </Text>

        <View style={styles.resumen}>
          <Text style={styles.puntos}>Puntos: {Number(perfil?.puntos || 0)}</Text>
          <Text style={styles.progreso}>
            Difíciles ganados: {Number(perfil?.dificilesCompletados || 0)}/15
          </Text>
        </View>

        <View style={styles.catalogo}>
          {COSMETICOS.map((item) => {
            const desbloqueado = estaDesbloqueado(item);
            const equipado = estaEquipado(item);
            const requiereVictorias =
              item.victoriasDificiles &&
              Number(perfil?.dificilesCompletados || 0) < item.victoriasDificiles;
            const faltaPuntos = Number(perfil?.puntos || 0) < item.precio;
            const inhabilitado =
              procesando ||
              (!desbloqueado &&
                (requiereVictorias || faltaPuntos || !perfil));

            return (
              <View key={item.id} style={styles.tarjeta}>
                <View
                  style={[
                    styles.muestra,
                    item.tipo === 'color' && {
                      borderColor: item.color,
                      shadowColor: item.color,
                    },
                    item.tipo === 'banner' && {
                      backgroundColor: item.fondo,
                      borderColor: item.borde,
                    },
                    item.brillo && styles.muestraDorada,
                  ]}
                >
                  <Text
                    style={[
                      styles.nombreMuestra,
                      item.tipo === 'color' && { color: item.color },
                      item.brillo && styles.textoDorado,
                    ]}
                  >
                    {item.brillo ? '✦ ' : ''}
                    {perfil?.nombre || 'Entrenador'}
                    {item.brillo ? ' ✦' : ''}
                  </Text>
                  {item.tipo === 'banner' && (
                    <Text style={styles.etiquetaMuestra}>BANNER</Text>
                  )}
                </View>

                <Text style={styles.nombreItem}>{item.nombre}</Text>
                <Text style={styles.textoItem}>{item.descripcion}</Text>
                <Text style={styles.precio}>
                  {item.precio === 0 ? 'Gratis' : `${item.precio} puntos`}
                </Text>

                {requiereVictorias && (
                  <Text style={styles.requisito}>
                    {item.victoriasDificiles} victorias en difícil
                  </Text>
                )}

                <BotonBrillante
                  compact
                  title={
                    equipado
                      ? 'Equipado'
                      : desbloqueado
                        ? 'Equipar'
                        : item.precio === 0
                          ? 'Desbloquear'
                          : 'Canjear'
                  }
                  variant={equipado ? 'secondary' : 'primary'}
                  disabled={inhabilitado || equipado}
                  onPress={() => actualizarCosmetico(item)}
                  style={styles.boton}
                />
              </View>
            );
          })}
        </View>
        <Text style={styles.nota}>
          El Dorado legendario se desbloquea al ganar 15 partidas difíciles y cuesta 1.200 puntos.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#182126',
  },
  contenido: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    paddingBottom: 34,
  },
  insignia: {
    color: '#E8B75A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
  titulo: {
    color: '#F5F1E8',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 5,
  },
  descripcion: {
    color: '#C4CCC9',
    textAlign: 'center',
    marginTop: 7,
    marginBottom: 17,
  },
  resumen: {
    width: '100%',
    maxWidth: 1000,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    padding: 15,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#53625F',
    backgroundColor: '#222F32',
  },
  puntos: {
    color: '#E8B75A',
    fontWeight: '900',
    fontSize: 16,
  },
  progreso: {
    color: '#C4CCC9',
    fontSize: 13,
    alignSelf: 'center',
  },
  catalogo: {
    width: '100%',
    maxWidth: 1000,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tarjeta: {
    width: 275,
    padding: 16,
    margin: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#53625F',
    backgroundColor: '#222F32',
  },
  muestra: {
    height: 65,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E8B75A',
    backgroundColor: '#1B272A',
    shadowOpacity: 0.45,
    shadowRadius: 11,
  },
  muestraDorada: {
    backgroundColor: 'rgba(111, 78, 20, 0.3)',
    borderWidth: 2,
    shadowOpacity: 0.95,
    shadowRadius: 18,
  },
  nombreMuestra: {
    color: '#E8B75A',
    fontSize: 18,
    fontWeight: '900',
    textShadowColor: '#E8B75A',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  textoDorado: {
    color: '#FFD76A',
    textShadowColor: '#FFD76A',
    textShadowRadius: 15,
  },
  etiquetaMuestra: {
    color: '#D5DBD7',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  nombreItem: {
    color: '#F5F1E8',
    fontSize: 16,
    fontWeight: '800',
  },
  textoItem: {
    minHeight: 38,
    color: '#C4CCC9',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  precio: {
    color: '#F0D38B',
    fontSize: 13,
    fontWeight: '800',
    marginVertical: 9,
  },
  requisito: {
    color: '#FFD76A',
    fontSize: 11,
    marginBottom: 8,
  },
  boton: {
    width: '100%',
  },
  nota: {
    maxWidth: 700,
    color: '#AEB8B4',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 17,
  },
});
