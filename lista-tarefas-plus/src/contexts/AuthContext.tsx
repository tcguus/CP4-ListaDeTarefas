import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "@/lib/firebase";
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
} from "firebase/auth";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID =
  "819953021031-9lj6vdqvuhtv11l0ovh8df4guqm3ae2u.apps.googleusercontent.com";
const REDIRECT_URI = "https://auth.expo.io/@tcguus/lista-tarefas-plus";

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: WEB_CLIENT_ID,
    responseType: "id_token",
    scopes: ["openid", "email", "profile"],
    redirectUri: REDIRECT_URI,
    extraParams: { prompt: "select_account" },
  });

  useEffect(() => {
    (async () => {
      if (response?.type === "success") {
        const idToken = response.authentication?.idToken;
        if (idToken) {
          const cred = GoogleAuthProvider.credential(idToken);
          await signInWithCredential(auth, cred);
        }
      }
    })();
  }, [response]);

  const signInGoogle = async () => {
    await promptAsync({ preferEphemeralSession: true });
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        await AsyncStorage.setItem(
          "@user",
          JSON.stringify({ uid: u.uid, email: u.email })
        );
      } else {
        await AsyncStorage.removeItem("@user");
      }
    });
    return unsub;
  }, []);

  const signInEmail = (email: string, pass: string) =>
    signInWithEmailAndPassword(auth, email.trim(), pass);

  const signUpEmail = (email: string, pass: string) =>
    createUserWithEmailAndPassword(auth, email.trim(), pass);

  const resetPass = (email: string) =>
    sendPasswordResetEmail(auth, email.trim());

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
      value={{
        user,
        loading,
        signInEmail,
        signUpEmail,
        signInGoogle,
        resetPass,
        logout,
        removeAccount,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
