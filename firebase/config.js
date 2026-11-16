import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCashPD2lskijwAdK-KkBc4R4XmNh28fZs',
  authDomain: 'fir-api-d4698.firebaseapp.com',
  projectId: 'fir-api-d4698',
  storageBucket: 'fir-api-d4698.firebasestorage.app',
  messagingSenderId: '702982802267',
  appId: '1:702982802267:web:8d343856f611527e95a87e',
};

const app = initializeApp(firebaseConfig);

export const auth =
  Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

export const db = getFirestore(app);
