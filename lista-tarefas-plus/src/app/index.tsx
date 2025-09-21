// app/index.tsx
import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import i18n from "../../src/i18n/i18n"; // 👈 importe o instance diretamente
import { useThemeMode } from "../../src/contexts/ThemeContext";

export default function LoginScreen() {
  const { t } = useTranslation(); // 👈 pegue só o t
  const { mode, toggle } = useThemeMode();
  const { signInEmail, signUpEmail, signInGoogle, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const router = useRouter();
  const isValidEmail = (s: string) => /^\S+@\S+\.\S+$/.test(s.trim());

  useEffect(() => {
    if (!loading && user) router.replace("(app)/tasks");
  }, [user, loading]);

  function mapAuthError(err: any) {
    const code = err?.code || "";
    switch (code) {
      case "auth/invalid-email":
        return "E-mail inválido.";
      case "auth/missing-password":
        return "Senha não informada.";
      case "auth/invalid-credential":
      case "auth/wrong-password":
        return "Senha incorreta.";
      case "auth/user-not-found":
        return "Usuário não encontrado.";
      case "auth/email-already-in-use":
        return "E-mail já cadastrado.";
      default:
        return `Erro de autenticação: ${code || "desconhecido"}`;
    }
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        justifyContent: "center",
        backgroundColor: mode === "dark" ? "#000" : "#fff",
      }}
    >
      <Text style={{ fontSize: 28, marginBottom: 16 }}>{t("login")}</Text>
      <TextInput
        placeholder={t("email")}
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 12, marginBottom: 8 }}
      />
      <TextInput
        placeholder={t("password")}
        value={pass}
        onChangeText={setPass}
        secureTextEntry
        style={{ borderWidth: 1, padding: 12, marginBottom: 8 }}
      />
      <Button
        title={t("login")}
        onPress={async () => {
          const e = email.trim();
          if (!isValidEmail(e)) {
            alert("E-mail inválido. Ex: nome@dominio.com");
            return;
          }
          if (!pass) {
            alert("Preencha a senha.");
            return;
          }
          try {
            await signInEmail?.(e, pass);
          } catch (err: any) {
            alert(mapAuthError(err));
          }
        }}
      />
      <View style={{ height: 8 }} />
      <Button
        title={t("signup")}
        onPress={async () => {
          const e = email.trim();
          if (!isValidEmail(e)) {
            alert("E-mail inválido. Ex: nome@dominio.com");
            return;
          }
          if (!pass || pass.length < 6) {
            alert("Senha deve ter no mínimo 6 caracteres.");
            return;
          }
          try {
            await signUpEmail?.(e, pass);
          } catch (err: any) {
            alert(mapAuthError(err));
          }
        }}
      />
      <View style={{ height: 8 }} />
      <Button title={t("google")} onPress={() => signInGoogle?.()} />
      <View style={{ height: 8 }} />
      <Button title={t("toggleTheme")} onPress={toggle} />
      <View style={{ height: 8 }} />
      <Button
        title={t("toggleLang")}
        onPress={() =>
          i18n.changeLanguage(i18n.language === "pt" ? "en" : "pt")
        }
      />
    </View>
  );
}
