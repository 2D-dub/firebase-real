import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
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
    try {
      const { user } = await createUserWithEmailAndPassword(auth, correo.trim(), contrasena);
      cuentaCreada = true;
      await asegurarPerfil(user, {
        nombre: nombre.trim(),
        fecha,
        telefono,
      });

      avisar('¡Bienvenido!', 'Tu cuenta de entrenador está lista.');
    } catch (error) {
      if (cuentaCreada) {
        console.error('La cuenta se creó, pero no se pudo guardar el perfil:', error);
      }
      avisar(
        cuentaCreada ? 'La cuenta se creó, pero no se pudo guardar el perfil' : 'No se pudo crear la cuenta',
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
          <Text style={styles.insignia}>✦ NUEVO VIAJERO ✦</Text>
          <Text style={styles.titulo}>Crea tu cuenta</Text>
          <Text style={styles.descripcion}>Tu aventura y tus recompensas quedarán guardadas.</Text>

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
            title={enviando ? 'Creando cuenta…' : 'Unirme a la aventura'}
            onPress={handleRegistro}
            disabled={enviando}
          />
          <Text style={styles.pie}>¿Ya tienes una cuenta?</Text>
          <BotonBrillante
            title="Volver a iniciar sesión"
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
    borderColor: 'rgba(112, 232, 255, 0.42)',
    backgroundColor: 'rgba(8, 17, 40, 0.94)',
    shadowColor: '#34DFFF',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  insignia: {
    color: '#70E8FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 10,
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
    borderColor: '#293E62',
    borderRadius: 12,
    backgroundColor: 'rgba(3, 10, 26, 0.92)',
    color: '#F2FAFF',
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
