import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { auth } from '../../firebase/config';
import { obtenerDetallePokemon, obtenerPeliculas, obtenerPokemones } from '../catalogos';
import BotonBrillante from './BotonBrillante';
import FondoEspacial from './FondoEspacial';
import { CURSOR_AZUL, ESTILO_CURSOR } from './tema';
import avisar from '../avisar';

const NOMBRES_TIPO = {
  bug: 'Bicho',
  dark: 'Siniestro',
  dragon: 'Dragón',
  electric: 'Eléctrico',
  fairy: 'Hada',
  fighting: 'Lucha',
  fire: 'Fuego',
  flying: 'Volador',
  ghost: 'Fantasma',
  grass: 'Planta',
  ground: 'Tierra',
  ice: 'Hielo',
  normal: 'Normal',
  poison: 'Veneno',
  psychic: 'Psíquico',
  rock: 'Roca',
  steel: 'Acero',
  water: 'Agua',
};

const NOMBRES_ESTADISTICA = {
  hp: 'PS',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'At. especial',
  'special-defense': 'Def. especial',
  speed: 'Velocidad',
};

export default function Pokedex({ navigation }) {
  const uid = auth.currentUser?.uid;
  const [pokemones, setPokemones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError('');
    obtenerPeliculas(uid).catch((cargaError) => {
      console.error('Error al guardar el catálogo de películas:', cargaError);
      if (activo) avisar('No se pudieron sincronizar las películas', cargaError.message);
    });
    obtenerPokemones(uid)
      .then((datos) => {
        if (activo) setPokemones(datos);
      })
      .catch((cargaError) => {
        console.error('Error al cargar el Pokédex:', cargaError);
        if (activo) setError(cargaError.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [uid]);

  useEffect(() => {
    if (!seleccionado) return undefined;
    let activo = true;
    setDetalle(null);
    setCargandoDetalle(true);
    obtenerDetallePokemon(uid, seleccionado.id)
      .then((datos) => {
        if (activo) setDetalle(datos);
      })
      .catch((cargaError) => {
        console.error('Error al cargar el detalle del Pokémon:', cargaError);
        if (activo) avisar('No se pudo cargar la información', cargaError.message);
      })
      .finally(() => {
        if (activo) setCargandoDetalle(false);
      });

    return () => {
      activo = false;
    };
  }, [seleccionado, uid]);

  const resultados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase();
    if (!termino) return pokemones;
    return pokemones.filter(
      (pokemon) =>
        pokemon.nombre.toLocaleLowerCase().includes(termino) ||
        pokemon.id.includes(termino)
    );
  }, [busqueda, pokemones]);

  const encabezado = (
    <View style={styles.encabezado}>
      <Text style={styles.insignia}>POKÉMON Y PELÍCULAS EN FIREBASE</Text>
      <Text style={styles.titulo}>Pokédex</Text>
      <Text style={styles.descripcion}>
        Consulta Pokémon y sus datos. La información del catálogo queda guardada en tu cuenta.
      </Text>

      <View style={styles.acciones}>
        <BotonBrillante
          title="Jugar ahorcado"
          onPress={() => navigation.navigate('JuegoPokemon')}
          style={styles.botonAccion}
        />
        <BotonBrillante
          title="Películas"
          variant="secondary"
          onPress={() => navigation.navigate('ColeccionPeliculas')}
          style={styles.botonAccion}
        />
        <BotonBrillante
          title="Otros juegos"
          variant="secondary"
          onPress={() => navigation.navigate('Home')}
          style={styles.botonAccion}
        />
      </View>

      <TextInput
        value={busqueda}
        onChangeText={setBusqueda}
        placeholder="Buscar por nombre o número…"
        placeholderTextColor="#8296B8"
        style={styles.buscador}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="Buscar Pokémon"
      />
      {!cargando && !error && (
        <Text style={styles.conteo}>
          {resultados.length} Pokémon {busqueda.trim() ? 'encontrados' : 'guardados'}
        </Text>
      )}
    </View>
  );

  return (
    <View style={[styles.pantalla, ESTILO_CURSOR]}>
      <FondoEspacial />
      {cargando ? (
        <View style={styles.estado}>
          <ActivityIndicator size="large" color="#70E8FF" />
          <Text style={styles.textoEstado}>          Cargando el Pokédex y sincronizando los catálogos…</Text>
        </View>
      ) : error ? (
        <View style={styles.estado}>
          <Text style={styles.error}>No se pudo cargar el Pokédex: {error}</Text>
          <BotonBrillante
            title="Reintentar"
            onPress={() => {
              setError('');
              setCargando(true);
              obtenerPokemones(uid)
                .then(setPokemones)
                .catch((cargaError) => setError(cargaError.message))
                .finally(() => setCargando(false));
            }}
          />
        </View>
      ) : (
        <FlatList
          data={resultados}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.fila}
          contentContainerStyle={styles.lista}
          ListHeaderComponent={encabezado}
          ListEmptyComponent={
            <Text style={styles.vacio}>No hay Pokémon que coincidan con la búsqueda.</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ver información de ${item.nombre}`}
              onPress={() => setSeleccionado(item)}
              style={({ pressed }) => [
                styles.tarjeta,
                pressed && styles.tarjetaPresionada,
                Platform.OS === 'web' && { cursor: CURSOR_AZUL },
              ]}
            >
              <Image
                source={{ uri: item.imagen }}
                style={styles.imagenTarjeta}
                accessibilityLabel={item.nombre}
              />
              <Text style={styles.numero}>N.º {item.id.padStart(3, '0')}</Text>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.verDetalle}>Ver información</Text>
            </Pressable>
          )}
        />
      )}

      <Modal
        visible={Boolean(seleccionado)}
        transparent
        animationType="fade"
        onRequestClose={() => setSeleccionado(null)}
      >
        <View style={styles.fondoModal}>
          <View style={styles.modal}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar información"
              onPress={() => setSeleccionado(null)}
              style={styles.cerrarModal}
            >
              <Text style={styles.cerrarTexto}>×</Text>
            </Pressable>
            {seleccionado && (
              <ScrollView contentContainerStyle={styles.contenidoModal}>
                <Text style={styles.insignia}>N.º {seleccionado.id.padStart(3, '0')}</Text>
                <Text style={styles.tituloModal}>{seleccionado.nombre}</Text>
                {cargandoDetalle ? (
                  <ActivityIndicator size="large" color="#70E8FF" />
                ) : detalle ? (
                  <>
                    <Image source={{ uri: detalle.imagen }} style={styles.imagenDetalle} />
                    <Text style={styles.etiquetaDetalle}>
                      {detalle.tipos.map((tipo) => NOMBRES_TIPO[tipo] || tipo).join(' · ')}
                    </Text>
                    <Text style={styles.datoDetalle}>
                      Altura: {(detalle.altura / 10).toFixed(1)} m · Peso:{' '}
                      {(detalle.peso / 10).toFixed(1)} kg
                    </Text>
                    <Text style={styles.subtituloDetalle}>Estadísticas base</Text>
                    {detalle.estadisticas.map((estadistica) => (
                      <View key={estadistica.nombre} style={styles.filaEstadistica}>
                        <Text style={styles.nombreEstadistica}>
                          {NOMBRES_ESTADISTICA[estadistica.nombre] || estadistica.nombre}
                        </Text>
                        <Text style={styles.valorEstadistica}>{estadistica.valor}</Text>
                      </View>
                    ))}
                    <Text style={styles.notaDetalle}>
                      Datos guardados en la base de datos de tu usuario.
                    </Text>
                  </>
                ) : (
                  <Text style={styles.error}>No se pudo obtener el detalle. Cierra e inténtalo otra vez.</Text>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#050B18',
  },
  lista: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 30,
  },
  encabezado: {
    width: '100%',
    maxWidth: 1050,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 22,
    paddingBottom: 14,
  },
  insignia: {
    color: '#70E8FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    textAlign: 'center',
  },
  titulo: {
    color: '#F3FAFF',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 4,
  },
  descripcion: {
    color: '#A8B9D4',
    textAlign: 'center',
    maxWidth: 590,
    marginTop: 6,
  },
  acciones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 15,
  },
  botonAccion: {
    marginHorizontal: 5,
    marginBottom: 7,
  },
  buscador: {
    width: '100%',
    maxWidth: 580,
    minHeight: 46,
    paddingHorizontal: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#315578',
    borderRadius: 13,
    backgroundColor: 'rgba(5, 14, 33, 0.93)',
    color: '#F3FAFF',
  },
  conteo: {
    color: '#83F0FF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 5,
  },
  fila: {
    width: '100%',
    maxWidth: 1020,
    justifyContent: 'center',
  },
  tarjeta: {
    flex: 1,
    maxWidth: 235,
    minHeight: 205,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 13,
    margin: 6,
    borderWidth: 1,
    borderColor: 'rgba(86, 185, 241, 0.32)',
    borderRadius: 17,
    backgroundColor: 'rgba(8, 18, 43, 0.93)',
    shadowColor: '#147EC2',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 3,
  },
  tarjetaPresionada: {
    borderColor: '#8EEBFF',
    backgroundColor: 'rgba(15, 42, 75, 0.98)',
  },
  imagenTarjeta: {
    width: 125,
    height: 125,
    resizeMode: 'contain',
  },
  numero: {
    color: '#7AB9E7',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
  },
  nombre: {
    color: '#F3FAFF',
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  verDetalle: {
    color: '#70E8FF',
    fontSize: 11,
    marginTop: 5,
  },
  estado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },
  textoEstado: {
    color: '#A8B9D4',
    marginTop: 12,
    textAlign: 'center',
  },
  error: {
    color: '#FF9BAF',
    textAlign: 'center',
    marginBottom: 16,
  },
  vacio: {
    color: '#A8B9D4',
    padding: 20,
  },
  fondoModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    backgroundColor: 'rgba(1, 5, 16, 0.83)',
  },
  modal: {
    width: '100%',
    maxWidth: 470,
    maxHeight: '90%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#337FAE',
    borderRadius: 22,
    backgroundColor: '#07142B',
  },
  cerrarModal: {
    position: 'absolute',
    zIndex: 1,
    right: 12,
    top: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cerrarTexto: {
    color: '#BCEFFF',
    fontSize: 30,
  },
  contenidoModal: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 28,
  },
  tituloModal: {
    color: '#F3FAFF',
    fontSize: 25,
    fontWeight: '900',
    textTransform: 'capitalize',
    marginTop: 5,
  },
  imagenDetalle: {
    width: 190,
    height: 190,
    resizeMode: 'contain',
    marginTop: 10,
  },
  etiquetaDetalle: {
    color: '#83F0FF',
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'capitalize',
    marginTop: 5,
  },
  datoDetalle: {
    color: '#C2D3E8',
    fontSize: 13,
    marginTop: 7,
  },
  subtituloDetalle: {
    width: '100%',
    color: '#70E8FF',
    fontWeight: '800',
    marginTop: 17,
    marginBottom: 5,
  },
  filaEstadistica: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(92, 145, 190, 0.18)',
  },
  nombreEstadistica: {
    color: '#A8B9D4',
    fontSize: 12,
  },
  valorEstadistica: {
    color: '#F3FAFF',
    fontSize: 12,
    fontWeight: '800',
  },
  notaDetalle: {
    color: '#8296B8',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 14,
  },
});
