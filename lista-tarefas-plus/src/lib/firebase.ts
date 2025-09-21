// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth } from 'firebase/auth';
// 👇 importa o módulo inteiro e pega a função via any (compat com várias versões)
import * as Auth from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAPQ0NOm-tMt6Y1X50fKa5ioz305nLKhJQ',
  authDomain: 'lista-de-tarefas-4478b.firebaseapp.com',
  projectId: 'lista-de-tarefas-4478b',
  storageBucket: 'lista-de-tarefas-4478b.firebasestorage.app',
  messagingSenderId: '605975487624',
  appId: '1:605975487624:web:e0f6b962a987746e97eb3d',
};

const app = initializeApp(firebaseConfig);

// Pega getReactNativePersistence mesmo que os tipos não exponham
const getRNPersistence = (Auth as any).getReactNativePersistence;
export const auth = initializeAuth(app, {
  // se por algum motivo não existir nessa versão, ainda funciona (memória)
  persistence: getRNPersistence ? getRNPersistence(AsyncStorage) : undefined,
});

export const db = getFirestore(app);
