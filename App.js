import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase/config';

import BotonBrillante from './src/componentes/BotonBrillante';
import Cabecera from './src/componentes/Cabecera';
import ColeccionPeliculas from './src/componentes/ColeccionPeliculas';
import Home from './src/componentes/Home';
import JuegoAhorcado from './src/componentes/JuegoAhorcado';
import Login from './src/componentes/Login';
import Logout from './src/componentes/Logout';
import Perfil from './src/componentes/perfil';
import Registro from './src/componentes/Registro';
import Tienda from './src/componentes/Tienda';
import VerificarCorreo from './src/componentes/VerificarCorreo';
import { ESTILO_CURSOR } from './src/componentes/tema';
import avisar from './src/avisar';

const Tab = createBottomTabNavigator();

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [correoVerificado, setCorreoVerificado] = useState(false);
  const [perfilCargando, setPerfilCargando] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCorreoVerificado(Boolean(user?.emailVerified));
      setPerfil(null);
      setErrorPerfil('');
      setPerfilCargando(Boolean(user?.emailVerified));
      setCargando(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!usuario || !correoVerificado) {
      setPerfil(null);
      setPerfilCargando(false);
      setErrorPerfil('');
      return undefined;
    }

    setPerfilCargando(true);
    setErrorPerfil('');
    const timeout = setTimeout(() => {
      setPerfilCargando(false);
      setErrorPerfil('No apareció el perfil en Firestore después de iniciar sesión.');
    }, 10000);

    const unsubscribe = onSnapshot(
      doc(db, 'usuarios', usuario.uid),
      (snapshot) => {
        if (!snapshot.exists()) return;
        clearTimeout(timeout);
        setPerfil(snapshot.data());
        setPerfilCargando(false);
        setErrorPerfil('');
      },
      (error) => {
        clearTimeout(timeout);
        console.error('Error al cargar el perfil:', error);
        setPerfilCargando(false);
        setErrorPerfil(error.message);
      }
    );
    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [usuario, correoVerificado]);

  if (cargando || (usuario && correoVerificado && perfilCargando)) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color="#E8B75A" />
      </View>
    );
  }

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      avisar('No se pudo cerrar sesión', error.message);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.aplicacion, ESTILO_CURSOR]}
        edges={['top', 'left', 'right']}
      >
        <StatusBar style="light" />
        <Cabecera usuario={usuario} perfil={perfil} />
        {usuario && !correoVerificado ? (
          <VerificarCorreo
            correo={usuario.email}
            onVerificado={() => setCorreoVerificado(true)}
          />
        ) : usuario && errorPerfil ? (
          <View style={styles.errorPerfil}>
            <Text style={styles.tituloError}>No se pudo cargar tu perfil</Text>
            <Text style={styles.mensajeError}>{errorPerfil}</Text>
            <BotonBrillante title="Cerrar sesión" onPress={cerrarSesion} />
          </View>
        ) : (
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#E8B75A',
                tabBarInactiveTintColor: '#AEB8B4',
                tabBarLabelStyle: styles.etiquetaPestana,
                tabBarStyle: styles.barPestanas,
              }}
            >
              {usuario ? (
                <>
                  <Tab.Screen name="Home" component={Home} options={{ tabBarLabel: 'Jugar' }} />
                  <Tab.Screen
                    name="JuegoPokemon"
                    component={JuegoAhorcado}
                    initialParams={{ modo: 'pokemon' }}
                    options={{ tabBarButton: () => null }}
                  />
                  <Tab.Screen
                    name="JuegoPeliculas"
                    component={JuegoAhorcado}
                    initialParams={{ modo: 'peliculas' }}
                    options={{ tabBarButton: () => null }}
                  />
                  <Tab.Screen
                    name="ColeccionPeliculas"
                    component={ColeccionPeliculas}
                    options={{ tabBarButton: () => null }}
                  />
                  <Tab.Screen name="Tienda" component={Tienda} options={{ tabBarLabel: 'Tienda' }} />
                  <Tab.Screen name="Perfil" component={Perfil} options={{ tabBarLabel: 'Perfil' }} />
                  <Tab.Screen name="Logout" component={Logout} options={{ tabBarLabel: 'Salir' }} />
                </>
              ) : (
                <>
                  <Tab.Screen name="Login" component={Login} options={{ tabBarLabel: 'Iniciar sesión' }} />
                  <Tab.Screen name="Registro" component={Registro} options={{ tabBarLabel: 'Registrarse' }} />
                </>
              )}
            </Tab.Navigator>
          </NavigationContainer>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  aplicacion: {
    flex: 1,
    backgroundColor: '#182126',
  },
  cargando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#182126',
  },
  errorPerfil: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  tituloError: {
    color: '#F5F1E8',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  mensajeError: {
    color: '#E98975',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  etiquetaPestana: {
    fontSize: 10,
    fontWeight: '700',
  },
  barPestanas: {
    backgroundColor: '#182126',
    borderTopColor: '#53625F',
    height: 62,
    paddingTop: 6,
    paddingBottom: 5,
  },
});
