import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import BotonBrillante from './BotonBrillante';
import FondoEspacial from './FondoEspacial';
import { ESTILO_CURSOR } from './tema';

export default function Home({ navigation }) {
  return (
    <View style={[styles.pantalla, ESTILO_CURSOR]}>
      <FondoEspacial />
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.encabezado}>
          <Text style={styles.titulo}>¿Quieres jugar?</Text>
          <Text style={styles.descripcion}>Elige tu próximo desafío.</Text>
          <BotonBrillante
            title="Volver al Pokédex"
            compact
            variant="secondary"
            onPress={() => navigation.navigate('Pokedex')}
          />
        </View>

        <View style={styles.opciones}>
          <View style={styles.tarjeta}>
            <Text style={styles.icono}>P</Text>
            <Text style={styles.nombre}>Pokédex</Text>
            <Text style={styles.descripcionTarjeta}>Adivina nombres de Pokémon.</Text>
            <BotonBrillante
              title="Jugar Pokémon"
              onPress={() => navigation.navigate('JuegoPokemon')}
            />
          </View>

          <View style={styles.tarjeta}>
            <Text style={styles.icono}>F</Text>
            <Text style={styles.nombre}>Películas</Text>
            <Text style={styles.descripcionTarjeta}>Adivina títulos de Studio Ghibli.</Text>
            <BotonBrillante
              title="Jugar películas"
              variant="secondary"
              onPress={() => navigation.navigate('JuegoPeliculas')}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#050B18',
  },
  contenido: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  encabezado: {
    alignItems: 'center',
    marginBottom: 26,
  },
  titulo: {
    color: '#F3FAFF',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  descripcion: {
    color: '#A8B9D4',
    textAlign: 'center',
    marginTop: 8,
  },
  opciones: {
    width: '100%',
    maxWidth: 850,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tarjeta: {
    width: 320,
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    margin: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(86, 185, 241, 0.32)',
    backgroundColor: 'rgba(8, 18, 43, 0.93)',
    shadowColor: '#147EC2',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 3,
  },
  icono: {
    color: '#70E8FF',
    fontSize: 42,
    fontWeight: '900',
    marginBottom: 8,
  },
  nombre: {
    color: '#F3FAFF',
    fontSize: 23,
    fontWeight: '800',
    marginBottom: 5,
  },
  descripcionTarjeta: {
    color: '#A8B9D4',
    textAlign: 'center',
    marginBottom: 18,
  },
});
