import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../firebase/config';
import asegurarPerfil from '../../firebase/perfiles';
import { useNavigation } from '@react-navigation/native';
import BotonBrillante from './BotonBrillante';
import FondoEspacial from './FondoEspacial';
import { ESTILO_CURSOR } from './tema';
import avisar from '../avisar';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [fecha, setFecha] = useState('');
  const [telefono, setTelefono] = useState('');
  const [enviando, setEnviando] = useState(false);
  const navigation = useNavigation();

  const handleRegistro = async () => {
    if (!nombre.trim() || !correo.trim() || contrasena.length < 6) {
      avisar('Revisa tus datos', 'Escribe tu nombre, correo y una contraseña de 6 caracteres o más.');
      return;
    }

    setEnviando(true);
    let cuentaCreada = false;
    let perfilGuardado = false;
    try {
      const { user } = await createUserWithEmailAndPassword(auth, correo.trim(), contrasena);
      cuentaCreada = true;
      await asegurarPerfil(user, {
        nombre: nombre.trim(),
        fecha,
        telefono,
      });
      perfilGuardado = true;
      await sendEmailVerification(user);

      avisar('Revisa tu correo', 'Te enviamos un enlace para verificar tu cuenta.');
    } catch (error) {
      if (cuentaCreada) {
        console.error('La cuenta se creó, pero falló el perfil o el correo de verificación:', error);
      }
      avisar(
        !cuentaCreada
          ? 'No se pudo crear la cuenta'
          : perfilGuardado
            ? 'La cuenta se creó, pero no se pudo enviar el correo de verificación'
            : 'La cuenta se creó, pero no se pudo guardar el perfil',
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
          <Text style={styles.titulo}>Registrarse</Text>
          <Text style={styles.descripcion}>Crea una cuenta para guardar tu progreso.</Text>

          <TextInput
            placeholder="Nombre de entrenador"
            placeholderTextColor="#8296B8"
            value={nombre}
            onChangeText={setNombre}
            style={styles.input}
            autoCapitalize="words"
          />
          <TextInput
            placeholder="Correo electrónico"
            placeholderTextColor="#8296B8"
            value={correo}
            onChangeText={setCorreo}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          <TextInput
            placeholder="Contraseña (mínimo 6 caracteres)"
            placeholderTextColor="#8296B8"
            value={contrasena}
            onChangeText={setContrasena}
            secureTextEntry
            style={styles.input}
          />
          <TextInput
            placeholder="Fecha de nacimiento (opcional)"
            placeholderTextColor="#8296B8"
            value={fecha}
            onChangeText={setFecha}
            style={styles.input}
          />
          <TextInput
            placeholder="Teléfono (opcional)"
            placeholderTextColor="#8296B8"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
            style={styles.input}
          />

          <BotonBrillante
            title={enviando ? 'Registrando…' : 'Registrarse'}
            onPress={handleRegistro}
            disabled={enviando}
          />
          <Text style={styles.pie}>¿Ya tienes una cuenta?</Text>
          <BotonBrillante
            title="Iniciar sesión"
            variant="secondary"
            onPress={() => navigation.navigate('Login')}
          />
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tarjeta: {
    width: '100%',
    maxWidth: 500,
    padding: 25,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(86, 185, 241, 0.38)',
    backgroundColor: 'rgba(8, 17, 40, 0.94)',
    shadowColor: '#147EC2',
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  titulo: {
    color: '#F3FAFF',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  descripcion: {
    color: '#A8B9D4',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#315578',
    borderRadius: 12,
    backgroundColor: 'rgba(3, 10, 26, 0.92)',
    color: '#F3FAFF',
    fontSize: 14,
  },
  pie: {
    color: '#A8B9D4',
    textAlign: 'center',
    fontSize: 13,
    marginTop: 20,
    marginBottom: 9,
  },
});
