import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { auth, db } from '../../firebase/config';
import { collection, doc, onSnapshot, runTransaction } from 'firebase/firestore';
import BotonBrillante from './BotonBrillante';
import FondoEspacial from './FondoEspacial';
import { ESTILO_CURSOR, PUNTOS_POR_DIFICULTAD } from './tema';
import avisar from '../avisar';

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const DIFICULTADES = {
  facil: { nombre: 'Fácil', intentos: 8, premio: PUNTOS_POR_DIFICULTAD.facil },
  medio: { nombre: 'Medio', intentos: 6, premio: PUNTOS_POR_DIFICULTAD.medio },
  dificil: { nombre: 'Difícil', intentos: 5, premio: PUNTOS_POR_DIFICULTAD.dificil },
};

function cantidadLetras(nombre) {
  return nombre.replace(/[^a-z]/g, '').length;
}

function obtenerId(url) {
  return url.split('/').filter(Boolean).pop();
}

export default function Original() {
  const usuario = auth.currentUser;
  const [pokemones, setPokemones] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [dificultad, setDificultad] = useState('facil');
  const [pokemon, setPokemon] = useState(null);
  const [letras, setLetras] = useState([]);
  const [fallos, setFallos] = useState(0);
  const [estado, setEstado] = useState('listo');
  const rondaGuardada = useRef(false);
  const uid = usuario?.uid;
  const configuracion = DIFICULTADES[dificultad];
  const palabra = pokemon?.name?.replace(/-/g, ' ').toUpperCase() || '';
  const maxPartes = configuracion.intentos;
  const partesDibujadas = pokemon
    ? Math.min(6, Math.ceil((fallos * 6) / maxPartes))
    : 0;

  useEffect(() => {
    let activa = true;
    const cargarPokemones = async () => {
      try {
        const respuesta = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        if (!respuesta.ok) {
          throw new Error(`PokeAPI respondió con estado ${respuesta.status}.`);
        }
        const datos = await respuesta.json();
        if (activa) setPokemones(datos.results || []);
      } catch (error) {
        console.error('Error al cargar los Pokémon:', error);
        avisar('No se pudo cargar el juego', error.message);
      } finally {
        if (activa) setCargando(false);
      }
    };

    cargarPokemones();
    return () => {
      activa = false;
    };
  }, []);

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
    const candidatos = pokemones.filter((item) => {
      const longitud = cantidadLetras(item.name);
      if (dificultad === 'facil') return longitud >= 3 && longitud <= 5;
      if (dificultad === 'medio') return longitud >= 6 && longitud <= 7;
      return longitud >= 8;
    });

    if (!candidatos.length) {
      avisar('No hay Pokémon disponibles', 'Intenta iniciar la partida de nuevo.');
      return;
    }

    const elegido = candidatos[Math.floor(Math.random() * candidatos.length)];
    setPokemon({ ...elegido, id: obtenerId(elegido.url) });
    setLetras([]);
    setFallos(0);
    rondaGuardada.current = false;
    setEstado('jugando');
  };

  const guardarResultado = async (gano) => {
    if (!uid || !pokemon) {
      throw new Error('No se encontró la sesión del entrenador.');
    }

    const usuarioRef = doc(db, 'usuarios', uid);
    const resultadoRef = doc(collection(db, 'resultados'));
    const puntosGanados = gano ? configuracion.premio : 0;

    await runTransaction(db, async (transaccion) => {
      const snapshot = await transaccion.get(usuarioRef);
      const datos = snapshot.exists() ? snapshot.data() : {};
      const estadisticas = {
        uid,
        ganados: Number(datos.ganados || 0) + (gano ? 1 : 0),
        perdidos: Number(datos.perdidos || 0) + (gano ? 0 : 1),
        puntos: Number(datos.puntos || 0) + puntosGanados,
        dificilesCompletados:
          Number(datos.dificilesCompletados || 0) +
          (gano && dificultad === 'dificil' ? 1 : 0),
      };

      if (snapshot.exists()) {
        transaccion.update(usuarioRef, estadisticas);
      } else {
        transaccion.set(usuarioRef, {
          ...estadisticas,
          nombre: usuario?.displayName || usuario?.email?.split('@')[0] || 'Entrenador',
          correo: usuario?.email || '',
          coloresDesbloqueados: ['celeste'],
          bannersDesbloqueados: [],
          colorActivo: 'celeste',
          bannerActivo: null,
        });
      }

      transaccion.set(resultadoRef, {
        uid,
        pokemon: pokemon.name,
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
      if (nuevosFallos >= maxPartes) await terminarPartida(false);
      return;
    }

    const completada = palabra
      .split('')
      .every((caracter) => caracter === ' ' || nuevasLetras.includes(caracter));
    if (completada) await terminarPartida(true);
  };

  return (
    <View style={[styles.pantalla, ESTILO_CURSOR]}>
      <FondoEspacial />
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.encabezado}>
          <Text style={styles.insignia}>DESAFÍO GALÁCTICO</Text>
          <Text style={styles.titulo}>Ahorcado Pokémon</Text>
          <Text style={styles.descripcion}>
            Adivina el nombre antes de que se agoten tus intentos.
          </Text>
        </View>

        <View style={styles.resumen}>
          <Text style={styles.dato}>✦ {Number(perfil?.puntos || 0)} puntos</Text>
          <Text style={styles.dato}>Ganadas: {Number(perfil?.ganados || 0)}</Text>
          <Text style={styles.dato}>
            Difíciles: {Number(perfil?.dificilesCompletados || 0)}/15
          </Text>
        </View>

        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>ELIGE LA DIFICULTAD</Text>
          <View style={styles.dificultades}>
            {Object.entries(DIFICULTADES).map(([id, item]) => (
              <BotonBrillante
                key={id}
                title={`${item.nombre}\n${item.premio} pts`}
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
            <ActivityIndicator size="large" color="#70E8FF" style={styles.cargando} />
          ) : !pokemon || estado === 'listo' ? (
            <View style={styles.inicio}>
              <Text style={styles.textoInicio}>
                Fácil: 8 intentos · Medio: 6 · Difícil: 5
              </Text>
              <BotonBrillante
                title="Iniciar partida"
                onPress={iniciarPartida}
                style={styles.botonInicio}
              />
            </View>
          ) : (
            <>
              <View style={styles.juego}>
                <View style={styles.panelPokemon}>
                  <Text style={styles.etiqueta}>POKÉMON #{pokemon.id}</Text>
                  <Image
                    source={{
                      uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
                    }}
                    style={[styles.imagen, estado === 'jugando' && styles.imagenOculta]}
                    accessibilityLabel={`Ilustración del Pokémon ${pokemon.name}`}
                  />
                  {estado === 'jugando' && (
                    <View style={styles.silueta}>
                      <Text style={styles.siluetaTexto}>?</Text>
                    </View>
                  )}
                  {estado !== 'jugando' && (
                    <Text style={styles.nombreRevelado}>{palabra}</Text>
                  )}
                </View>

                <View style={styles.ahorcado}>
                  <View style={styles.baseHorca} />
                  <View style={styles.posteHorca} />
                  <View style={styles.barraHorca} />
                  <View style={styles.cuerdaHorca} />
                  <View style={[styles.cabeza, partesDibujadas < 1 && styles.oculto]} />
                  <View style={[styles.cuerpo, partesDibujadas < 2 && styles.oculto]} />
                  <View style={[styles.brazoIzquierdo, partesDibujadas < 3 && styles.oculto]} />
                  <View style={[styles.brazoDerecho, partesDibujadas < 4 && styles.oculto]} />
                  <View style={[styles.piernaIzquierda, partesDibujadas < 5 && styles.oculto]} />
                  <View style={[styles.piernaDerecha, partesDibujadas < 6 && styles.oculto]} />
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
                  <Text style={styles.intentos}>
                    Fallos: {fallos}/{maxPartes}
                  </Text>
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
                      : 'Se acabaron los intentos. ¡Intenta otra vez!'}
                  </Text>
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
    backgroundColor: '#050B18',
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
    color: '#70E8FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  titulo: {
    color: '#F3FAFF',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 5,
  },
  descripcion: {
    color: '#A8B9D4',
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
    borderColor: 'rgba(112, 232, 255, 0.22)',
    backgroundColor: 'rgba(7, 17, 40, 0.75)',
  },
  dato: {
    color: '#BFEFFF',
    fontSize: 13,
    fontWeight: '700',
    marginHorizontal: 8,
  },
  tarjeta: {
    width: '100%',
    maxWidth: 850,
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(112, 232, 255, 0.38)',
    backgroundColor: 'rgba(8, 17, 40, 0.92)',
    shadowColor: '#34DFFF',
    shadowOpacity: 0.17,
    shadowRadius: 23,
    elevation: 6,
  },
  etiqueta: {
    color: '#8DA6CB',
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
    minWidth: 104,
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
    color: '#A8B9D4',
    textAlign: 'center',
    marginBottom: 18,
  },
  botonInicio: {
    minWidth: 190,
  },
  cargando: {
    marginVertical: 42,
  },
  juego: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'wrap',
    minHeight: 210,
  },
  panelPokemon: {
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
  silueta: {
    position: 'absolute',
    top: 43,
    width: 112,
    height: 112,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(3, 10, 26, 0.76)',
    borderWidth: 1,
    borderColor: '#456A9E',
  },
  siluetaTexto: {
    color: '#70E8FF',
    fontSize: 58,
    fontWeight: '900',
  },
  nombreRevelado: {
    color: '#70E8FF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: -4,
  },
  ahorcado: {
    width: 140,
    height: 150,
    position: 'relative',
    marginHorizontal: 28,
  },
  baseHorca: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    width: 104,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#70E8FF',
  },
  posteHorca: {
    position: 'absolute',
    left: 28,
    bottom: 10,
    width: 4,
    height: 127,
    backgroundColor: '#70E8FF',
  },
  barraHorca: {
    position: 'absolute',
    left: 28,
    top: 11,
    width: 79,
    height: 4,
    backgroundColor: '#70E8FF',
  },
  cuerdaHorca: {
    position: 'absolute',
    left: 103,
    top: 12,
    width: 3,
    height: 19,
    backgroundColor: '#70E8FF',
  },
  cabeza: {
    position: 'absolute',
    left: 91,
    top: 30,
    width: 27,
    height: 27,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#FF8DCB',
  },
  cuerpo: {
    position: 'absolute',
    left: 103,
    top: 56,
    width: 3,
    height: 39,
    backgroundColor: '#FF8DCB',
  },
  brazoIzquierdo: {
    position: 'absolute',
    left: 84,
    top: 63,
    width: 25,
    height: 3,
    backgroundColor: '#FF8DCB',
    transform: [{ rotate: '-35deg' }],
  },
  brazoDerecho: {
    position: 'absolute',
    left: 101,
    top: 63,
    width: 25,
    height: 3,
    backgroundColor: '#FF8DCB',
    transform: [{ rotate: '35deg' }],
  },
  piernaIzquierda: {
    position: 'absolute',
    left: 85,
    top: 99,
    width: 28,
    height: 3,
    backgroundColor: '#FF8DCB',
    transform: [{ rotate: '-48deg' }],
  },
  piernaDerecha: {
    position: 'absolute',
    left: 100,
    top: 99,
    width: 28,
    height: 3,
    backgroundColor: '#FF8DCB',
    transform: [{ rotate: '48deg' }],
  },
  oculto: {
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
    color: '#F5FBFF',
    fontSize: 26,
    fontWeight: '900',
    minWidth: 18,
    textAlign: 'center',
    marginHorizontal: 3,
  },
  intentos: {
    color: '#A8B9D4',
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
    color: '#90F6C8',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
  },
  perdiste: {
    color: '#FF9BAF',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
  },
});
