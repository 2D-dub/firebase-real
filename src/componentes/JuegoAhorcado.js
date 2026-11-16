import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { collection, doc, onSnapshot, runTransaction } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { contarLetras, normalizarPalabra, obtenerPeliculas, obtenerPokemones } from '../catalogos';
import BotonBrillante from './BotonBrillante';
import { ESTILO_CURSOR, PUNTOS_POR_DIFICULTAD } from './tema';
import avisar from '../avisar';

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const DIFICULTADES = {
  facil: { nombre: 'Fácil', premio: PUNTOS_POR_DIFICULTAD.facil, maxErrores: 10, maxLetras: 7 },
  medio: { nombre: 'Medio', premio: PUNTOS_POR_DIFICULTAD.medio, maxErrores: 10, maxLetras: 13 },
  dificil: { nombre: 'Difícil', premio: PUNTOS_POR_DIFICULTAD.dificil, maxErrores: 10, maxLetras: Infinity },
};
const PARTES_AHORCADO = [
  'baseHorca',
  'posteHorca',
  'barraHorca',
  'cuerdaHorca',
  'cabeza',
  'cuerpo',
  'brazoIzquierdo',
  'brazoDerecho',
  'piernaIzquierda',
  'piernaDerecha',
];

export default function JuegoAhorcado({ navigation, route }) {
  const modo = route?.params?.modo === 'peliculas' ? 'peliculas' : 'pokemon';
  const usuario = auth.currentUser;
  const uid = usuario?.uid;
  const esJuegoPeliculas = modo === 'peliculas';
  const [contenidos, setContenidos] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [dificultad, setDificultad] = useState('facil');
  const [contenido, setContenido] = useState(null);
  const [letras, setLetras] = useState([]);
  const [fallos, setFallos] = useState(0);
  const [estado, setEstado] = useState('listo');
  const rondaGuardada = useRef(false);
  const configuracion = DIFICULTADES[dificultad];
  const palabra = contenido ? normalizarPalabra(contenido.nombre) : '';
  const ganadas = Number(perfil?.ganados || 0);
  const dificilGanadas = Number(perfil?.dificilesCompletados || 0);
  const desbloqueadas = Array.isArray(perfil?.peliculasDesbloqueadas)
    ? perfil.peliculasDesbloqueadas
    : [];
  const contenidosDisponibles = esJuegoPeliculas
    ? contenidos.filter((item) => !desbloqueadas.includes(item.id))
    : contenidos;
  const contenidosDeDificultad = contenidosDisponibles.filter((item) => {
    const longitud = contarLetras(item.nombre);
    if (dificultad === 'facil') return longitud <= DIFICULTADES.facil.maxLetras;
    if (dificultad === 'medio') {
      return longitud > DIFICULTADES.facil.maxLetras &&
        longitud <= DIFICULTADES.medio.maxLetras;
    }
    return longitud > DIFICULTADES.medio.maxLetras;
  });

  useEffect(() => {
    let activa = true;
    const cargar = esJuegoPeliculas ? obtenerPeliculas : obtenerPokemones;
    setCargando(true);
    setErrorCarga('');
    cargar()
      .then((datos) => {
        if (activa) setContenidos(datos);
      })
      .catch((error) => {
        console.error('Error al cargar las opciones del ahorcado:', error);
        if (activa) setErrorCarga(error.message);
      })
      .finally(() => {
        if (activa) setCargando(false);
      });

    return () => {
      activa = false;
    };
  }, [esJuegoPeliculas]);

  useEffect(() => {
    if (!uid) return undefined;
    return onSnapshot(
      doc(db, 'usuarios', uid),
      (snapshot) => setPerfil(snapshot.exists() ? snapshot.data() : null),
      (error) => {
        console.error('Error al cargar las estadísticas:', error);
        avisar('No se pudieron cargar tus estadísticas', error.message);
      }
    );
  }, [uid]);

  const iniciarPartida = () => {
    if (!contenidosDeDificultad.length) {
      avisar('No hay palabras disponibles', 'Elige otra dificultad para iniciar una partida.');
      return;
    }

    const elegido =
      contenidosDeDificultad[Math.floor(Math.random() * contenidosDeDificultad.length)];
    setContenido(elegido);
    setLetras([]);
    setFallos(0);
    rondaGuardada.current = false;
    setEstado('jugando');
  };

  const guardarResultado = async (gano) => {
    if (!uid || !contenido) {
      throw new Error('No se encontró la sesión del jugador.');
    }

    const usuarioRef = doc(db, 'usuarios', uid);
    const resultadoRef = doc(collection(db, 'resultados'));
    const puntosGanados = gano ? configuracion.premio : 0;

    await runTransaction(db, async (transaccion) => {
      const snapshot = await transaccion.get(usuarioRef);
      const datos = snapshot.exists() ? snapshot.data() : {};
      const actualizaciones = {
        uid,
        ganados: Number(datos.ganados || 0) + (gano ? 1 : 0),
        perdidos: Number(datos.perdidos || 0) + (gano ? 0 : 1),
        puntos: Number(datos.puntos || 0) + puntosGanados,
        dificilesCompletados:
          Number(datos.dificilesCompletados || 0) +
          (gano && dificultad === 'dificil' ? 1 : 0),
      };

      if (esJuegoPeliculas && gano) {
        const idsDesbloqueados = Array.isArray(datos.peliculasDesbloqueadas)
          ? datos.peliculasDesbloqueadas
          : [];
        actualizaciones.peliculasDesbloqueadas = idsDesbloqueados.includes(contenido.id)
          ? idsDesbloqueados
          : [...idsDesbloqueados, contenido.id];
      }

      if (snapshot.exists()) {
        transaccion.update(usuarioRef, actualizaciones);
      } else {
        transaccion.set(usuarioRef, {
          ...actualizaciones,
          nombre: usuario?.displayName || usuario?.email?.split('@')[0] || 'Jugador',
          correo: usuario?.email || '',
          coloresDesbloqueados: ['celeste'],
          bannersDesbloqueados: [],
          peliculasDesbloqueadas: esJuegoPeliculas && gano ? [contenido.id] : [],
          colorActivo: 'celeste',
          bannerActivo: null,
        });
      }

      transaccion.set(resultadoRef, {
        uid,
        modo,
        contenidoId: contenido.id,
        titulo: contenido.nombre,
        dificultad,
        gano,
        puntos: puntosGanados,
        fecha: new Date().toISOString(),
      });
    });
  };

  const terminarPartida = async (gano) => {
    if (rondaGuardada.current) return;
    rondaGuardada.current = true;
    setEstado(gano ? 'ganada' : 'perdida');

    try {
      await guardarResultado(gano);
    } catch (error) {
      console.error('Error al guardar la partida:', error);
      avisar('No se pudo guardar la partida', error.message);
    }
  };

  const elegirLetra = async (letra) => {
    if (estado !== 'jugando' || letras.includes(letra)) return;

    const nuevasLetras = [...letras, letra];
    setLetras(nuevasLetras);
    if (!palabra.includes(letra)) {
      const nuevosFallos = fallos + 1;
      setFallos(nuevosFallos);
      if (nuevosFallos >= configuracion.maxErrores) await terminarPartida(false);
      return;
    }

    const completada = palabra
      .split('')
      .every((caracter) => caracter === ' ' || nuevasLetras.includes(caracter));
    if (completada) await terminarPartida(true);
  };

  const tituloJuego = esJuegoPeliculas ? 'Ahorcado de películas' : 'Ahorcado de Pokémon';
  const coleccionDesbloqueada =
    esJuegoPeliculas &&
    contenidos.length > 0 &&
    contenidos.every((item) => desbloqueadas.includes(item.id));

  return (
    <View style={[styles.pantalla, ESTILO_CURSOR]}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.encabezado}>
          <Text style={styles.insignia}>JUEGO DE AHORCADO</Text>
          <Text style={styles.titulo}>{tituloJuego}</Text>
          <Text style={styles.descripcion}>
            Adivina la palabra. Tienes 10 errores antes de completar el dibujo.
          </Text>
        </View>

        <View style={styles.resumen}>
          <Text style={styles.dato}>Puntos: {Number(perfil?.puntos || 0)}</Text>
          <Text style={styles.dato}>Victorias: {ganadas}</Text>
          <Text style={styles.dato}>Difíciles: {dificilGanadas}/15</Text>
        </View>

        <View style={styles.tarjeta}>
          <View style={styles.acciones}>
            <BotonBrillante
              title="Cambiar juego"
              compact
              variant="secondary"
              onPress={() => navigation.navigate('Home')}
            />
            {esJuegoPeliculas && (
              <BotonBrillante
                title="Películas existentes"
                compact
                variant="secondary"
                onPress={() => navigation.navigate('ColeccionPeliculas')}
              />
            )}
          </View>

          <Text style={styles.etiqueta}>ELIGE LA DIFICULTAD</Text>
          <View style={styles.dificultades}>
            {Object.entries(DIFICULTADES).map(([id, item]) => (
              <BotonBrillante
                key={id}
                title={`${item.nombre}\n${item.premio} puntos`}
                compact
                variant={dificultad === id ? 'primary' : 'secondary'}
                disabled={estado === 'jugando'}
                onPress={() => setDificultad(id)}
                style={styles.botonDificultad}
                textStyle={styles.textoDificultad}
              />
            ))}
          </View>

          {cargando ? (
            <ActivityIndicator size="large" color="#E8B75A" style={styles.cargando} />
          ) : errorCarga ? (
            <View style={styles.inicio}>
              <Text style={styles.error}>No se pudieron cargar las palabras: {errorCarga}</Text>
              <BotonBrillante title="Reintentar" onPress={() => {
                setErrorCarga('');
                setCargando(true);
                const cargar = esJuegoPeliculas ? obtenerPeliculas : obtenerPokemones;
                cargar()
                  .then(setContenidos)
                  .catch((error) => setErrorCarga(error.message))
                  .finally(() => setCargando(false));
              }} />
            </View>
          ) : coleccionDesbloqueada && !contenido ? (
            <View style={styles.inicio}>
              <Text style={styles.resultadoCompletado}>
                Ya desbloqueaste todas las películas.
              </Text>
              <BotonBrillante
                title="Ver películas existentes"
                onPress={() => navigation.navigate('ColeccionPeliculas')}
              />
            </View>
          ) : !contenido || estado === 'listo' || estado === 'completado' ? (
            <View style={styles.inicio}>
              <Text style={styles.textoInicio}>
                {esJuegoPeliculas
                  ? `${contenidosDeDificultad.length} películas disponibles en esta dificultad.`
                  : 'Adivina el nombre del Pokémon.'}
              </Text>
              <BotonBrillante
                title="Iniciar partida"
                onPress={iniciarPartida}
                disabled={!perfil || !contenidosDeDificultad.length}
                style={styles.botonInicio}
              />
            </View>
          ) : (
            <>
              <View style={styles.juego}>
                <View style={styles.panelContenido}>
                  <Text style={styles.etiqueta}>
                    {esJuegoPeliculas ? 'PELÍCULA' : 'POKÉMON'}
                  </Text>
                  {contenido.imagen ? (
                    <Image
                      source={{ uri: contenido.imagen }}
                      style={[styles.imagen, estado === 'jugando' && styles.imagenOculta]}
                      accessibilityLabel={`Imagen de ${contenido.nombre}`}
                    />
                  ) : (
                    <View style={styles.imagenVacia}>
                      <Text style={styles.siluetaTexto}>?</Text>
                    </View>
                  )}
                  {estado === 'jugando' && contenido.imagen && (
                    <View style={styles.silueta}>
                      <Text style={styles.siluetaTexto}>?</Text>
                    </View>
                  )}
                  {estado !== 'jugando' && (
                    <Text style={styles.nombreRevelado}>{contenido.nombre}</Text>
                  )}
                </View>

                <View
                  style={styles.ahorcado}
                  accessibilityLabel={`Dibujo del ahorcado: ${fallos} de 10 errores`}
                >
                  {PARTES_AHORCADO.map((parte, index) => (
                    <View
                      key={parte}
                      style={[styles[parte], index < fallos && styles.parteVisible]}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.palabra}>
                {palabra.split('').map((caracter, index) => (
                  <Text key={`${caracter}-${index}`} style={styles.letraPalabra}>
                    {caracter === ' '
                      ? '\u00a0'
                      : letras.includes(caracter) || estado !== 'jugando'
                        ? caracter
                        : '_'}
                  </Text>
                ))}
              </View>

              {estado === 'jugando' ? (
                <>
                  <Text style={styles.intentos}>Errores: {fallos}/10</Text>
                  <View style={styles.teclado}>
                    {ALFABETO.map((letra) => (
                      <BotonBrillante
                        key={letra}
                        title={letra}
                        compact
                        disabled={letras.includes(letra)}
                        variant={letras.includes(letra) ? 'secondary' : 'primary'}
                        onPress={() => elegirLetra(letra)}
                        style={styles.tecla}
                        textStyle={styles.textoTecla}
                      />
                    ))}
                  </View>
                </>
              ) : (
                <View style={styles.resultado}>
                  <Text style={estado === 'ganada' ? styles.ganaste : styles.perdiste}>
                    {estado === 'ganada'
                      ? `¡Correcto! Ganaste ${configuracion.premio} puntos.`
                      : 'Se completó el dibujo. ¡Intenta otra vez!'}
                  </Text>
                  {estado === 'ganada' && esJuegoPeliculas && (
                    <Text style={styles.desbloqueo}>
                      Desbloqueaste: {contenido.nombre}
                    </Text>
                  )}
                  <BotonBrillante
                    title="Jugar otra vez"
                    onPress={iniciarPartida}
                    style={styles.botonInicio}
                  />
                </View>
              )}
            </>
          )}
        </View>
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
    padding: 18,
    paddingBottom: 32,
  },
  encabezado: {
    width: '100%',
    maxWidth: 850,
    alignItems: 'center',
    marginBottom: 18,
  },
  insignia: {
    color: '#E8B75A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
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
  },
  resumen: {
    width: '100%',
    maxWidth: 850,
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    padding: 12,
    marginBottom: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#53625F',
    backgroundColor: '#222F32',
  },
  dato: {
    color: '#F0D38B',
    fontSize: 13,
    fontWeight: '700',
    marginHorizontal: 8,
  },
  tarjeta: {
    width: '100%',
    maxWidth: 850,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#53625F',
    backgroundColor: '#222F32',
  },
  acciones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  etiqueta: {
    color: '#AEB8B4',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    textAlign: 'center',
  },
  dificultades: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 11,
    marginBottom: 18,
  },
  botonDificultad: {
    minWidth: 110,
    marginHorizontal: 5,
    marginBottom: 7,
  },
  textoDificultad: {
    lineHeight: 18,
  },
  inicio: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  textoInicio: {
    color: '#C4CCC9',
    textAlign: 'center',
    marginBottom: 18,
  },
  botonInicio: {
    minWidth: 190,
    marginTop: 12,
  },
  cargando: {
    marginVertical: 42,
  },
  error: {
    color: '#F0A5A5',
    textAlign: 'center',
    marginBottom: 16,
  },
  resultadoCompletado: {
    color: '#D5DBD7',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  juego: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'wrap',
    minHeight: 210,
  },
  panelContenido: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 180,
    height: 190,
  },
  imagen: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  imagenOculta: {
    opacity: 0.12,
  },
  imagenVacia: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderRadius: 56,
    backgroundColor: '#182126',
  },
  silueta: {
    position: 'absolute',
    top: 43,
    width: 112,
    height: 112,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(24, 33, 38, 0.82)',
    borderWidth: 1,
    borderColor: '#65736C',
  },
  siluetaTexto: {
    color: '#E8B75A',
    fontSize: 58,
    fontWeight: '900',
  },
  nombreRevelado: {
    color: '#E8B75A',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: -4,
  },
  ahorcado: {
    width: 160,
    height: 170,
    position: 'relative',
    marginHorizontal: 22,
  },
  parteVisible: {
    opacity: 1,
  },
  baseHorca: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    width: 115,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E8B75A',
    opacity: 0,
  },
  posteHorca: {
    position: 'absolute',
    left: 28,
    bottom: 12,
    width: 5,
    height: 142,
    backgroundColor: '#E8B75A',
    opacity: 0,
  },
  barraHorca: {
    position: 'absolute',
    left: 30,
    top: 12,
    width: 82,
    height: 5,
    backgroundColor: '#E8B75A',
    opacity: 0,
  },
  cuerdaHorca: {
    position: 'absolute',
    left: 108,
    top: 14,
    width: 4,
    height: 22,
    backgroundColor: '#E8B75A',
    opacity: 0,
  },
  cabeza: {
    position: 'absolute',
    left: 96,
    top: 34,
    width: 28,
    height: 28,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#E98975',
    opacity: 0,
  },
  cuerpo: {
    position: 'absolute',
    left: 108,
    top: 60,
    width: 4,
    height: 40,
    backgroundColor: '#E98975',
    opacity: 0,
  },
  brazoIzquierdo: {
    position: 'absolute',
    left: 88,
    top: 66,
    width: 26,
    height: 4,
    backgroundColor: '#E98975',
    transform: [{ rotate: '-35deg' }],
    opacity: 0,
  },
  brazoDerecho: {
    position: 'absolute',
    left: 106,
    top: 66,
    width: 26,
    height: 4,
    backgroundColor: '#E98975',
    transform: [{ rotate: '35deg' }],
    opacity: 0,
  },
  piernaIzquierda: {
    position: 'absolute',
    left: 88,
    top: 101,
    width: 29,
    height: 4,
    backgroundColor: '#E98975',
    transform: [{ rotate: '-48deg' }],
    opacity: 0,
  },
  piernaDerecha: {
    position: 'absolute',
    left: 106,
    top: 101,
    width: 29,
    height: 4,
    backgroundColor: '#E98975',
    transform: [{ rotate: '48deg' }],
    opacity: 0,
  },
  palabra: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 12,
    marginBottom: 17,
  },
  letraPalabra: {
    color: '#F5F1E8',
    fontSize: 25,
    fontWeight: '900',
    minWidth: 18,
    textAlign: 'center',
    marginHorizontal: 3,
  },
  intentos: {
    color: '#C4CCC9',
    textAlign: 'center',
    marginBottom: 10,
  },
  teclado: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  tecla: {
    minWidth: 39,
    width: 39,
    margin: 3,
    paddingHorizontal: 5,
  },
  textoTecla: {
    fontSize: 14,
  },
  resultado: {
    alignItems: 'center',
    paddingTop: 12,
  },
  ganaste: {
    color: '#9AD5A8',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
  },
  perdiste: {
    color: '#E98975',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
  },
  desbloqueo: {
    color: '#E8B75A',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
});
