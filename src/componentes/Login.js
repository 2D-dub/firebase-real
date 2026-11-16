import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import asegurarPerfil from '../../firebase/perfiles';
import { useNavigation } from '@react-navigation/native';
import BotonBrillante from './BotonBrillante';
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
    let perfilAsegurado = false;
    try {
      const { user } = await signInWithEmailAndPassword(auth, correo.trim(), contrasena);
      sesionIniciada = true;
      await asegurarPerfil(user);
      perfilAsegurado = true;
      if (!user.emailVerified) {
        await sendEmailVerification(user);
        avisar('Verifica tu correo', 'Te enviamos un enlace para activar tu cuenta.');
      }
    } catch (error) {
      if (sesionIniciada && !perfilAsegurado) {
        console.error('Sesión iniciada, pero no se pudo cargar el perfil:', error);
      }
      avisar(
        !sesionIniciada
          ? 'No se pudo iniciar sesión'
          : perfilAsegurado
            ? 'No se pudo enviar el correo de verificación'
            : 'Sesión iniciada, pero no se pudo cargar el perfil',
        error.message
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View style={[styles.pantalla, ESTILO_CURSOR]}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <View style={styles.tarjeta}>
          <Text style={styles.titulo}>Iniciar sesión</Text>
          <Text style={styles.descripcion}>Ingresa con tu correo y contraseña.</Text>

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
            title={enviando ? 'Ingresando…' : 'Iniciar sesión'}
            onPress={handleLogin}
            disabled={enviando}
            style={styles.boton}
          />

          <Text style={styles.pie}>¿No tienes cuenta?</Text>
          <BotonBrillante
            title="Registrarse"
            variant="secondary"
            onPress={() => navigation.navigate('Registro')}
          />
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
    borderColor: '#53625F',
    backgroundColor: '#222F32',
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  titulo: {
    color: '#F5F1E8',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  descripcion: {
    color: '#C4CCC9',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 27,
  },
  etiqueta: {
    color: '#AEB8B4',
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
    borderColor: '#53625F',
    borderRadius: 13,
    backgroundColor: '#182126',
    color: '#F5F1E8',
    fontSize: 15,
  },
  boton: {
    marginTop: 4,
  },
  pie: {
    color: '#C4CCC9',
    textAlign: 'center',
    fontSize: 13,
    marginTop: 25,
    marginBottom: 10,
  },
});
