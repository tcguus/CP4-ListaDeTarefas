// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  deleteUser,
  updatePassword,
  signInWithCredential,
  GoogleAuthProvider,
  UserCredential,
} from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

// ====== CONFIG GOOGLE ======
// 1) Web Client ID do Google Cloud (o que termina com .apps.googleusercontent.com)
const WEB_CLIENT_ID =
  '819953021031-9lj6vdqvuhtv11l0ovh8df4guqm3ae2u.apps.googleusercontent.com';

// 2) Redirect fixo do Expo Proxy com SEU username + slug do app.json
const REDIRECT_URI = 'https://auth.expo.io/@tcguus/lista-tarefas-plus';
// ===========================

type AuthContextType = {
  user: any;
  loading: boolean;
  signInEmail: (email: string, pass: string) => Promise<UserCredential>;
  signUpEmail: (email: string, pass: string) => Promise<UserCredential>;
  signInGoogle: () => Promise<void>;
  resetPass: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  removeAccount: () => Promise<void>;
  changePassword: (newPass: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Hook do Google — usa o PROXY do Expo via redirect fixo
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: WEB_CLIENT_ID,            // sempre o Web Client ID
    responseType: 'id_token',           // Firebase precisa do id_token
    scopes: ['openid', 'email', 'profile'],
    redirectUri: REDIRECT_URI,          // força proxy do Expo
    extraParams: { prompt: 'select_account' }, // sempre mostrar seletor de contas
  });
  

  useEffect(() => {
    (async () => {
      if (response?.type === 'success') {
        const idToken = response.authentication?.idToken;
        if (idToken) {
          const cred = GoogleAuthProvider.credential(idToken);
          await signInWithCredential(auth, cred);
        }
      }
    })();
  }, [response]);

  const signInGoogle = async () => {
    // sessão efêmera evita grudar em conta errada no iOS
    await promptAsync({ preferEphemeralSession: true });
  };

  // Observa sessão (auto-login) + persistência própria
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        await AsyncStorage.setItem('@user', JSON.stringify({ uid: u.uid, email: u.email }));
      } else {
        await AsyncStorage.removeItem('@user');
      }
    });
    return unsub;
  }, []);

  const signInEmail = (email: string, pass: string) =>
    signInWithEmailAndPassword(auth, email.trim(), pass);

  const signUpEmail = (email: string, pass: string) =>
    createUserWithEmailAndPassword(auth, email.trim(), pass);

  const resetPass = (email: string) => sendPasswordResetEmail(auth, email.trim());

  const logout = () => signOut(auth);

  const removeAccount = async () => {
    if (!auth.currentUser) return;
    await deleteUser(auth.currentUser);
  };

  const changePassword = async (newPass: string) => {
    if (!auth.currentUser) return;
    await updatePassword(auth.currentUser, newPass);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signInEmail, signUpEmail, signInGoogle, resetPass, logout, removeAccount, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
