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
import FondoEspacial from './src/componentes/FondoEspacial';
import Home from './src/componentes/Home';
import Login from './src/componentes/Login';
import Logout from './src/componentes/Logout';
import Original from './src/componentes/Original';
import Perfil from './src/componentes/perfil';
import Registro from './src/componentes/Registro';
import Tienda from './src/componentes/Tienda';
import { ESTILO_CURSOR } from './src/componentes/tema';
import avisar from './src/avisar';

const Tab = createBottomTabNavigator();

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [perfilCargando, setPerfilCargando] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setPerfil(null);
      setErrorPerfil('');
      setPerfilCargando(Boolean(user));
      setCargando(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!usuario) {
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
  }, [usuario]);

  if (cargando || (usuario && perfilCargando)) {
    return (
      <View style={styles.cargando}>
        <FondoEspacial />
        <ActivityIndicator size="large" color="#70E8FF" />
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
        <FondoEspacial />
        <StatusBar style="light" />
        {usuario && errorPerfil ? (
          <View style={styles.errorPerfil}>
            <Text style={styles.tituloError}>No se pudo cargar tu perfil</Text>
            <Text style={styles.mensajeError}>{errorPerfil}</Text>
            <BotonBrillante title="Cerrar sesión" onPress={cerrarSesion} />
          </View>
        ) : (
          <>
            <Cabecera usuario={usuario} perfil={perfil} />
            <NavigationContainer>
              <Tab.Navigator
                screenOptions={{
                  headerShown: false,
                  tabBarActiveTintColor: '#70E8FF',
                  tabBarInactiveTintColor: '#8CA0C2',
                  tabBarLabelStyle: styles.etiquetaPestana,
                  tabBarStyle: styles.barPestanas,
                }}
              >
                {usuario ? (
                  <>
                    <Tab.Screen name="Home" component={Home} options={{ tabBarLabel: 'Pokédex' }} />
                    <Tab.Screen name="Original" component={Original} options={{ tabBarLabel: 'Ahorcado' }} />
                    <Tab.Screen name="Tienda" component={Tienda} options={{ tabBarLabel: 'Tienda' }} />
                    <Tab.Screen name="Perfil" component={Perfil} options={{ tabBarLabel: 'Perfil' }} />
                    <Tab.Screen name="Logout" component={Logout} options={{ tabBarLabel: 'Salir' }} />
                  </>
                ) : (
                  <>
                    <Tab.Screen name="Login" component={Login} options={{ tabBarLabel: 'Iniciar sesión' }} />
                    <Tab.Screen name="Registro" component={Registro} options={{ tabBarLabel: 'Crear cuenta' }} />
                  </>
                )}
              </Tab.Navigator>
            </NavigationContainer>
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  aplicacion: {
    flex: 1,
    backgroundColor: '#050B18',
  },
  cargando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050B18',
  },
  errorPerfil: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  tituloError: {
    color: '#F3FAFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  mensajeError: {
    color: '#FFB7C7',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  etiquetaPestana: {
    fontSize: 10,
    fontWeight: '700',
  },
  barPestanas: {
    backgroundColor: 'rgba(5, 12, 31, 0.98)',
    borderTopColor: 'rgba(101, 218, 255, 0.28)',
    height: 62,
    paddingTop: 6,
    paddingBottom: 5,
  },
});
