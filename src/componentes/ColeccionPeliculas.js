import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { obtenerPeliculas } from '../catalogos';
import BotonBrillante from './BotonBrillante';
import { ESTILO_CURSOR } from './tema';
import avisar from '../avisar';

export default function ColeccionPeliculas({ navigation }) {
  const uid = auth.currentUser?.uid;
  const [peliculas, setPeliculas] = useState([]);
  const [desbloqueadas, setDesbloqueadas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activa = true;
    obtenerPeliculas()
      .then((datos) => {
        if (activa) setPeliculas(datos);
      })
      .catch((error) => {
        console.error('Error al cargar las películas:', error);
        avisar('No se pudieron cargar las películas', error.message);
      })
      .finally(() => {
        if (activa) setCargando(false);
      });

    return () => {
      activa = false;
    };
  }, []);

  useEffect(() => {
    if (!uid) return undefined;
    return onSnapshot(
      doc(db, 'usuarios', uid),
      (snapshot) => {
        setDesbloqueadas(
          snapshot.exists() && Array.isArray(snapshot.data().peliculasDesbloqueadas)
            ? snapshot.data().peliculasDesbloqueadas
            : []
        );
      },
      (error) => {
        console.error('Error al cargar las películas desbloqueadas:', error);
        avisar('No se pudo cargar tu colección', error.message);
      }
    );
  }, [uid]);

  return (
    <View style={[styles.pantalla, ESTILO_CURSOR]}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>Películas existentes</Text>
        <Text style={styles.descripcion}>
          Gana partidas en el modo películas para descubrir cada título.
        </Text>
        <Text style={styles.progreso}>
          Desbloqueadas: {desbloqueadas.length}/{peliculas.length}
        </Text>

        {cargando ? (
          <ActivityIndicator size="large" color="#E8B75A" style={styles.cargando} />
        ) : (
          <View style={styles.lista}>
            {peliculas.map((pelicula) => {
              const desbloqueada = desbloqueadas.includes(pelicula.id);
              return (
                <View
                  key={pelicula.id}
                  style={[styles.tarjeta, !desbloqueada && styles.tarjetaBloqueada]}
                >
                  <View style={styles.marcoImagen}>
                    <Image
                      source={{ uri: pelicula.imagen }}
                      style={[
                        styles.imagen,
                        !desbloqueada && styles.imagenBloqueada,
                      ]}
                      accessibilityLabel={
                        desbloqueada ? pelicula.nombre : 'Película bloqueada'
                      }
                    />
                    {!desbloqueada && (
                      <View style={styles.capaBloqueada}>
                        <Text style={styles.candado}>?</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.nombre,
                      !desbloqueada && styles.textoBloqueado,
                    ]}
                  >
                    {pelicula.nombre}
                  </Text>
                  {desbloqueada ? (
                    <>
                      <Text style={styles.detalle}>Director: {pelicula.director}</Text>
                      <Text style={styles.detalle}>Año: {pelicula.anio}</Text>
                    </>
                  ) : (
                    <Text style={styles.detalleBloqueado}>Gana una partida para verla</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <BotonBrillante
          title="Volver a jugar"
          variant="secondary"
          onPress={() => navigation.navigate('JuegoPeliculas')}
          style={styles.botonVolver}
        />
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
    paddingBottom: 32,
  },
  titulo: {
    color: '#F5F1E8',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  descripcion: {
    color: '#C4CCC9',
    textAlign: 'center',
    marginTop: 8,
  },
  progreso: {
    color: '#E8B75A',
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 16,
  },
  lista: {
    width: '100%',
    maxWidth: 1050,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tarjeta: {
    width: 220,
    minHeight: 340,
    padding: 12,
    margin: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#65736C',
    backgroundColor: '#253236',
  },
  tarjetaBloqueada: {
    borderColor: '#4A5353',
    backgroundColor: '#202728',
  },
  marcoImagen: {
    position: 'relative',
    height: 245,
    marginBottom: 10,
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#151B1D',
  },
  imagen: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagenBloqueada: {
    opacity: 0.18,
    tintColor: '#777777',
  },
  capaBloqueada: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  candado: {
    color: '#C0C3C0',
    fontSize: 44,
    fontWeight: '900',
  },
  nombre: {
    color: '#F5F1E8',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  textoBloqueado: {
    color: '#858B89',
  },
  detalle: {
    color: '#C4CCC9',
    fontSize: 11,
    marginTop: 5,
  },
  detalleBloqueado: {
    color: '#747B79',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
  },
  cargando: {
    marginVertical: 45,
  },
  botonVolver: {
    width: '100%',
    maxWidth: 260,
    marginTop: 20,
  },
});
