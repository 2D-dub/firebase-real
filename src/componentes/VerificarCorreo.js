import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { reload, sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import BotonBrillante from './BotonBrillante';
import FondoEspacial from './FondoEspacial';
import { ESTILO_CURSOR } from './tema';
import avisar from '../avisar';

export default function VerificarCorreo({ correo, onVerificado }) {
  const [procesando, setProcesando] = useState(false);

  const reenviarCorreo = async () => {
    setProcesando(true);
    try {
      const usuario = auth.currentUser;
      if (!usuario) throw new Error('Vuelve a iniciar sesión para solicitar otro correo.');
      await sendEmailVerification(usuario);
      avisar('Correo enviado', 'Revisa tu bandeja de entrada y la carpeta de correo no deseado.');
    } catch (error) {
      console.error('Error al reenviar la verificación:', error);
      avisar('No se pudo enviar el correo', error.message);
    } finally {
      setProcesando(false);
    }
  };

  const comprobarVerificacion = async () => {
    setProcesando(true);
    try {
      const usuario = auth.currentUser;
      if (!usuario) throw new Error('Vuelve a iniciar sesión para comprobar tu cuenta.');
      await reload(usuario);
      if (auth.currentUser?.emailVerified) {
        onVerificado();
      } else {
        avisar('Aún falta verificar', 'Abre el enlace que enviamos a tu correo y vuelve a comprobar.');
      }
    } catch (error) {
      console.error('Error al comprobar el correo:', error);
      avisar('No se pudo comprobar el correo', error.message);
    } finally {
      setProcesando(false);
    }
  };

  const cerrarSesion = async () => {
    setProcesando(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      avisar('No se pudo cerrar sesión', error.message);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <View style={[styles.pantalla, ESTILO_CURSOR]}>
      <FondoEspacial />
      <View style={styles.tarjeta}>
        <Text style={styles.titulo}>Verifica tu correo</Text>
        <Text style={styles.descripcion}>
          Enviamos un enlace a {correo || 'tu correo electrónico'}. Ábrelo para activar tu cuenta.
        </Text>
        <Text style={styles.ayuda}>
          Si no lo ves, revisa correo no deseado o solicita otro.
        </Text>
        <BotonBrillante
          title={procesando ? 'Procesando…' : 'Ya verifiqué mi correo'}
          onPress={comprobarVerificacion}
          disabled={procesando}
          style={styles.boton}
        />
        <BotonBrillante
          title="Reenviar correo"
          variant="secondary"
          onPress={reenviarCorreo}
          disabled={procesando}
          style={styles.boton}
        />
        <BotonBrillante
          title="Cerrar sesión"
          variant="secondary"
          onPress={cerrarSesion}
          disabled={procesando}
          style={styles.boton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
    overflow: 'hidden',
    backgroundColor: '#050B18',
  },
  tarjeta: {
    width: '100%',
    maxWidth: 480,
    padding: 26,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#456A9E',
    backgroundColor: 'rgba(8, 17, 40, 0.94)',
  },
  titulo: {
    color: '#F3FAFF',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  descripcion: {
    color: '#C2D3E8',
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 14,
  },
  ayuda: {
    color: '#8CA0C2',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  boton: {
    marginTop: 9,
  },
});
