import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import asegurarPerfil from '../../firebase/perfiles';
import { useNavigation } from '@react-navigation/native';
import BotonBrillante from './BotonBrillante';
import FondoEspacial from './FondoEspacial';
import { ESTILO_CURSOR } from './tema';
import avisar from '../avisar';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [enviando, setEnviando] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!correo.trim() || !contrasena) {
      avisar('Faltan datos', 'Escribe tu correo y contraseña para continuar.');
      return;
    }

    setEnviando(true);
    let sesionIniciada = false;
    try {
      const { user } = await signInWithEmailAndPassword(auth, correo.trim(), contrasena);
      sesionIniciada = true;
      await asegurarPerfil(user);
    } catch (error) {
      if (sesionIniciada) {
        console.error('Sesión iniciada, pero no se pudo cargar el perfil:', error);
      }
      avisar(
        sesionIniciada
          ? 'Sesión iniciada, pero no se pudo cargar el perfil'
          : 'No se pudo iniciar sesión',
        error.message
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View style={[styles.pantalla, ESTILO_CURSOR]}>
      <FondoEspacial />
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <View style={styles.tarjeta}>
          <Text style={styles.insignia}>✦ PORTAL DE ENTRENADORES ✦</Text>
          <Text style={styles.titulo}>Vuelve a las estrellas</Text>
          <Text style={styles.descripcion}>
            Inicia sesión para continuar tu aventura Pokémon.
          </Text>

          <Text style={styles.etiqueta}>CORREO ELECTRÓNICO</Text>
          <TextInput
            placeholder="entrenador@correo.com"
            placeholderTextColor="#8296B8"
            value={correo}
            onChangeText={setCorreo}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
          />

          <Text style={styles.etiqueta}>CONTRASEÑA</Text>
          <TextInput
            placeholder="Tu contraseña"
            placeholderTextColor="#8296B8"
            value={contrasena}
            onChangeText={setContrasena}
            style={styles.input}
            secureTextEntry
            textContentType="password"
            onSubmitEditing={handleLogin}
          />

          <BotonBrillante
            title={enviando ? 'Abriendo portal…' : 'Entrar al universo'}
            onPress={handleLogin}
            disabled={enviando}
            style={styles.boton}
          />

          <Text style={styles.pie}>¿Aún no tienes cuenta?</Text>
          <BotonBrillante
            title="Crear cuenta de entrenador"
            variant="secondary"
            onPress={() => navigation.navigate('Registro')}
          />
        </View>
        <Text style={styles.frase}>Una galaxia entera te espera.</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
  },
  tarjeta: {
    width: '100%',
    maxWidth: 470,
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(112, 232, 255, 0.48)',
    backgroundColor: 'rgba(8, 17, 40, 0.93)',
    shadowColor: '#34DFFF',
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  insignia: {
    color: '#70E8FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 12,
  },
  titulo: {
    color: '#F3FAFF',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  descripcion: {
    color: '#A8B9D4',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 27,
  },
  etiqueta: {
    color: '#8DA6CB',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    minHeight: 50,
    paddingHorizontal: 15,
    marginBottom: 19,
    borderWidth: 1,
    borderColor: '#293E62',
    borderRadius: 13,
    backgroundColor: 'rgba(3, 10, 26, 0.92)',
    color: '#F2FAFF',
    fontSize: 15,
  },
  boton: {
    marginTop: 4,
  },
  pie: {
    color: '#A8B9D4',
    textAlign: 'center',
    fontSize: 13,
    marginTop: 25,
    marginBottom: 10,
  },
  frase: {
    color: '#7392BD',
    fontSize: 12,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 18,
  },
});
