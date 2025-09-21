import React, { useState, useEffect } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { useThemeMode } from "../../src/contexts/ThemeContext";
import i18n from "../../src/i18n/i18n";
import { useTranslation } from "react-i18next";
import {
  Appbar,
  Text,
  TextInput,
  Button,
  Divider,
  Snackbar,
  useTheme,
  Portal,
} from "react-native-paper";

export default function LoginScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { mode, toggle } = useThemeMode();
  const { user, loading, signInEmail, signUpEmail, signInGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (user) router.replace("(app)/tasks");
  }, [user, loading]);

  const isValidEmail = (s: string) => /^\S+@\S+\.\S+$/.test(s.trim());
  const mapAuthError = (err: any) => {
    const code = err?.code || "";
    switch (code) {
      case "auth/invalid-email":
        return t("errors.invalidEmail");
      case "auth/missing-password":
        return t("errors.missingPassword");
      case "auth/invalid-credential":
      case "auth/wrong-password":
        return t("errors.wrongPassword");
      case "auth/user-not-found":
        return t("errors.userNotFound");
      case "auth/email-already-in-use":
        return t("errors.emailInUse");
      default:
        return t("errors.generic", { code });
    }
  };
  const switchLang = () =>
    i18n.changeLanguage(i18n.language === "pt" ? "en" : "pt");

  return (
    <>
      <Appbar.Header mode="center-aligned">
        <Appbar.Content title={t("titles.app")} />
        <Appbar.Action
          icon={mode === "dark" ? "weather-sunny" : "moon-waning-crescent"}
          onPress={toggle}
          accessibilityLabel={t("a11y.toggleTheme")}
        />
        <Appbar.Action
          icon="translate"
          onPress={switchLang}
          accessibilityLabel={t("a11y.toggleLang")}
        />
      </Appbar.Header>

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        behavior={Platform.select({ ios: "padding" })}
      >
        <View
          style={{ flex: 1, padding: 24, justifyContent: "center", gap: 12 }}
        >
          <Text variant="headlineSmall" style={{ marginBottom: 8 }}>
            {t("titles.login")}
          </Text>

          <TextInput
            mode="outlined"
            label={t("fields.email")}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            mode="outlined"
            label={t("fields.password")}
            value={pass}
            onChangeText={setPass}
            secureTextEntry={!showPass}
            right={
              <TextInput.Icon
                icon={showPass ? "eye-off" : "eye"}
                onPress={() => setShowPass((v) => !v)}
              />
            }
          />

          <Button
            mode="contained"
            onPress={async () => {
              const e = email.trim();
              if (!isValidEmail(e))
                return setSnack(t("errors.invalidEmailExample"));
              if (!pass) return setSnack(t("errors.missingPassword"));
              try {
                await signInEmail?.(e, pass);
              } catch (err: any) {
                setSnack(mapAuthError(err));
              }
            }}
          >
            {t("actions.login")}
          </Button>

          <Button
            mode="outlined"
            onPress={async () => {
              const e = email.trim();
              if (!isValidEmail(e))
                return setSnack(t("errors.invalidEmailExample"));
              if (!pass || pass.length < 6)
                return setSnack(t("errors.passwordMin"));
              try {
                await signUpEmail?.(e, pass);
              } catch (err: any) {
                setSnack(mapAuthError(err));
              }
            }}
          >
            {t("actions.signup")}
          </Button>

          <Divider style={{ marginVertical: 8 }} />

          <Button
            icon="google"
            mode="elevated"
            onPress={() => signInGoogle?.()}
          >
            {t("actions.google")}
          </Button>
        </View>
      </KeyboardAvoidingView>
      <Portal>
        <Snackbar
          visible={!!snack}
          onDismiss={() => setSnack(null)}
          duration={1800}
          wrapperStyle={{ top: "40%", bottom: undefined }}
        >
          {snack}
        </Snackbar>
      </Portal>
    </>
  );
}
