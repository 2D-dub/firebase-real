import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth, db } from '../../firebase/config';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import BotonBrillante from './BotonBrillante';
import { ESTILO_CURSOR } from './tema';
import avisar from '../avisar';

export default function Perfil() {
  const usuario = auth.currentUser;
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [telefono, setTelefono] = useState('');
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!usuario) {
      setCargando(false);
      return undefined;
    }

    return onSnapshot(
      doc(db, 'usuarios', usuario.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          const datos = snapshot.data();
          setPerfil(datos);
          setNombre(datos.nombre || '');
          setFecha(datos.fecha || '');
          setTelefono(datos.telefono || '');
        }
        setCargando(false);
      },
      (error) => {
        console.error('Error al cargar el perfil:', error);
        avisar('No se pudo cargar el perfil', error.message);
        setCargando(false);
      }
    );
  }, [usuario]);

  const actualizarDatos = async () => {
    if (!usuario) return;
    setGuardando(true);
    try {
      await updateDoc(doc(db, 'usuarios', usuario.uid), {
        uid: usuario.uid,
        nombre: nombre.trim(),
        fecha,
        telefono,
      });
      avisar('Perfil actualizado', 'Tus datos se guardaron correctamente.');
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      avisar('No se pudo actualizar el perfil', error.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={[styles.pantalla, ESTILO_CURSOR]}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.tarjeta}>
          <Text style={styles.insignia}>MI CUENTA</Text>
          <Text style={styles.titulo}>Perfil</Text>

          {cargando ? (
            <ActivityIndicator size="large" color="#E8B75A" style={styles.cargando} />
          ) : !perfil ? (
            <Text style={styles.error}>No encontramos el perfil asociado a esta cuenta.</Text>
          ) : (
            <>
              <View style={styles.estadisticas}>
                <View style={styles.estadistica}>
                  <Text style={styles.valor}>{Number(perfil.puntos || 0)}</Text>
                  <Text style={styles.etiquetaEstadistica}>PUNTOS</Text>
                </View>
                <View style={styles.estadistica}>
                  <Text style={styles.valor}>{Number(perfil.ganados || 0)}</Text>
                  <Text style={styles.etiquetaEstadistica}>VICTORIAS</Text>
                </View>
                <View style={styles.estadistica}>
                  <Text style={styles.valor}>
                    {Number(perfil.dificilesCompletados || 0)}/15
                  </Text>
                  <Text style={styles.etiquetaEstadistica}>DIFÍCIL</Text>
                </View>
              </View>

              <Text style={styles.etiqueta}>NOMBRE</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                placeholderTextColor="#8296B8"
                value={nombre}
                onChangeText={setNombre}
              />
              <Text style={styles.etiqueta}>FECHA DE NACIMIENTO</Text>
              <TextInput
                style={styles.input}
                placeholder="AAAA-MM-DD"
                placeholderTextColor="#8296B8"
                value={fecha}
                onChangeText={setFecha}
              />
              <Text style={styles.etiqueta}>TELÉFONO</Text>
              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                placeholderTextColor="#8296B8"
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
              />
              <BotonBrillante
                title={guardando ? 'Guardando…' : 'Guardar cambios'}
                onPress={actualizarDatos}
                disabled={guardando}
              />
            </>
          )}
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  tarjeta: {
    width: '100%',
    maxWidth: 560,
    padding: 24,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#53625F',
    backgroundColor: '#222F32',
  },
  insignia: {
    color: '#E8B75A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    textAlign: 'center',
  },
  titulo: {
    color: '#F5F1E8',
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
  estadisticas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    marginBottom: 20,
    borderRadius: 14,
    backgroundColor: '#1B272A',
  },
  estadistica: {
    alignItems: 'center',
  },
  valor: {
    color: '#E8B75A',
    fontSize: 20,
    fontWeight: '900',
  },
  etiquetaEstadistica: {
    color: '#AEB8B4',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 3,
  },
  etiqueta: {
    color: '#AEB8B4',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 7,
  },
  input: {
    minHeight: 46,
    paddingHorizontal: 13,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#53625F',
    borderRadius: 12,
    backgroundColor: '#1B272A',
    color: '#F5F1E8',
  },
  cargando: {
    marginVertical: 35,
  },
  error: {
    color: '#E98975',
    textAlign: 'center',
    padding: 20,
  },
});
