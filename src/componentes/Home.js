import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import FondoEspacial from './FondoEspacial';
import avisar from '../avisar';

export default function Home() {
  const [pokemones, setPokemones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activa = true;
    const obtenerDatos = async () => {
      try {
        const respuesta = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        if (!respuesta.ok) {
          throw new Error(`PokeAPI respondió con estado ${respuesta.status}.`);
        }
        const datos = await respuesta.json();
        if (activa) setPokemones(datos.results || []);
      } catch (error) {
        console.error('Error al cargar la Pokédex:', error);
        avisar('No se pudo cargar la Pokédex', error.message);
      } finally {
        if (activa) setCargando(false);
      }
    };

    obtenerDatos();
    return () => {
      activa = false;
    };
  }, []);

  return (
    <View style={styles.pantalla}>
      <FondoEspacial />
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.insignia}>EXPLORA LA GALAXIA</Text>
        <Text style={styles.titulo}>Pokédex</Text>
        <Text style={styles.descripcion}>
          Conoce a los Pokémon que puedes encontrar en tu aventura.
        </Text>

        {cargando ? (
          <ActivityIndicator size="large" color="#70E8FF" style={styles.cargando} />
        ) : (
          <View style={styles.lista}>
            {pokemones.map((pokemon) => {
              const id = pokemon.url.split('/').filter(Boolean).pop();
              return (
                <View key={pokemon.name} style={styles.tarjeta}>
                  <Text style={styles.numero}>#{id}</Text>
                  <Image
                    source={{
                      uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
                    }}
                    style={styles.imagen}
                    accessibilityLabel={`Imagen de ${pokemon.name}`}
                  />
                  <Text style={styles.nombre}>{pokemon.name}</Text>
                </View>
              );
            })}
          </View>
        )}
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
    paddingBottom: 30,
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
    marginTop: 4,
  },
  descripcion: {
    color: '#A8B9D4',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 15,
  },
  lista: {
    width: '100%',
    maxWidth: 1050,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tarjeta: {
    width: 145,
    minHeight: 178,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 11,
    margin: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(112, 232, 255, 0.22)',
    backgroundColor: 'rgba(8, 17, 40, 0.9)',
  },
  numero: {
    alignSelf: 'flex-start',
    color: '#8296B8',
    fontSize: 10,
    fontWeight: '700',
  },
  imagen: {
    width: 108,
    height: 108,
    resizeMode: 'contain',
  },
  nombre: {
    color: '#E8F7FF',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  cargando: {
    marginTop: 60,
  },
});
