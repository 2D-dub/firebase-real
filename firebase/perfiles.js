import { doc, runTransaction } from 'firebase/firestore';
import { db } from './config';

export default async function asegurarPerfil(usuario, datosIniciales = {}) {
  if (!usuario?.uid) {
    throw new Error('No se encontró una sesión válida para crear el perfil.');
  }

  const usuarioRef = doc(db, 'usuarios', usuario.uid);

  return runTransaction(db, async (transaccion) => {
    const snapshot = await transaccion.get(usuarioRef);
    if (snapshot.exists()) return snapshot.data();

    const correo = usuario.email || '';
    const nombreCorreo = correo.split('@')[0];
    const perfil = {
      uid: usuario.uid,
      nombre:
        datosIniciales.nombre?.trim() ||
        usuario.displayName ||
        nombreCorreo ||
        'Entrenador',
      correo,
      fecha: datosIniciales.fecha || '',
      telefono: datosIniciales.telefono || '',
      ganados: 0,
      perdidos: 0,
      puntos: 0,
      dificilesCompletados: 0,
      coloresDesbloqueados: ['celeste'],
      bannersDesbloqueados: [],
      peliculasDesbloqueadas: [],
      colorActivo: 'celeste',
      bannerActivo: null,
    };

    transaccion.set(usuarioRef, perfil);
    return perfil;
  });
}
