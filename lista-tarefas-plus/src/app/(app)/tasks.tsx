import React, { useEffect, useMemo, useState } from "react";
import { FlatList, View, Keyboard } from "react-native";
import {
  Appbar,
  ActivityIndicator,
  Text,
  Portal,
  Modal,
  TextInput,
  Button,
  Snackbar,
  Card,
  Checkbox,
  IconButton,
  Chip,
  useTheme,
  Dialog,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuth } from "../../../src/contexts/AuthContext";
import { useThemeMode } from "../../../src/contexts/ThemeContext";
import i18n from "../../../src/i18n/i18n";
import { useTranslation } from "react-i18next";
import { db } from "../../../src/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import { useQuery } from "@tanstack/react-query";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  dueDate?: string | null;
  createdAt?: any;
  updatedAt?: any;
  notifId?: string | null;
};

type FormState = { id?: string; title: string; description?: string; dueDate?: string };

function useMotivation() {
  return useQuery({
    queryKey: ['motivation'],
    queryFn: async () => {
      const r = await fetch('https://api.adviceslip.com/advice', { cache: 'no-store' });
      const j = await r.json();
      return j?.slip?.advice ?? 'Keep going!';
    },
    staleTime: 60_000,
  });
}

export default function TasksScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { mode, toggle } = useThemeMode();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const motivation = useMotivation();

  const [open, setOpen] = useState(false);
  const [f, setF] = useState<FormState>({ title: "" });
  const [snack, setSnack] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    if (loading && user === null) setLoading(false);
    if (user === null) router.replace("/");
  }, [user, loading]);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, "users", user.uid, "tasks"), orderBy("dueDate", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: Task[] = [];
        snap.forEach((d) => rows.push({ id: d.id, ...(d.data() as any) }));
        setTasks(rows);
        setLoading(false);
      },
      (err) => {
        console.log("onSnapshot error", err);
        setLoading(false);
        setSnack(t("errors.loadTasks"));
      }
    );
    return unsub;
  }, [user?.uid]);

  const sorted = useMemo(() => {
    const arr = [...tasks];
    arr.sort((a, b) => {
      const da = a.dueDate ? +new Date(a.dueDate) : Number.MAX_SAFE_INTEGER;
      const dbb = b.dueDate ? +new Date(b.dueDate) : Number.MAX_SAFE_INTEGER;
      return da - dbb;
    });
    return arr;
  }, [tasks]);

  const schedule = async (title: string, body?: string | null, due?: string | null) => {
    try {
      if (!due) return null;
      const when = new Date(due);
      if (isNaN(when.getTime()) || when.getTime() <= Date.now()) return null;
      const trigger = { type: SchedulableTriggerInputTypes.DATE, date: when } as any;
      return await Notifications.scheduleNotificationAsync({
        content: { title, body: body || "" },
        trigger,
      });
    } catch (e) {
      console.log("schedule error", e);
      return null;
    }
  };

  const create = async () => {
    if (!user?.uid) return;
    if (!f.title.trim()) return setSnack(t("errors.missingTitle"));
    try {
      const notifId = await schedule(f.title.trim(), f.description?.trim(), f.dueDate || null);
      await addDoc(collection(db, "users", user.uid, "tasks"), {
        title: f.title.trim(),
        description: f.description?.trim() || null,
        completed: false,
        dueDate: f.dueDate || null,
        notifId: notifId ?? null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      Keyboard.dismiss();
      setOpen(false);
      setF({ title: "" });
      setSnack(t("toast.saved"));
    } catch (e) {
      console.log("create error", e);
      setSnack(t("errors.saveTask"));
    }
  };

  const updateTask = async (id: string, patch: Partial<Task>) => {
    if (!user?.uid) return;
    try {
      await updateDoc(doc(db, "users", user.uid, "tasks", id), { ...patch, updatedAt: serverTimestamp() });
    } catch (e) {
      console.log("update error", e);
      setSnack(t("errors.updateTask"));
    }
  };

  const remove = async (id: string) => {
    if (!user?.uid) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "tasks", id));
      setSnack(t("toast.deleted") || "Excluída!");
    } catch (e) {
      console.log("delete error", e);
      setSnack(t("errors.deleteTask"));
    }
  };

  const switchLang = () => i18n.changeLanguage(i18n.language === "pt" ? "en" : "pt");

  const TaskItem = ({ item }: { item: Task }) => (
    <Card mode="elevated" style={{ marginBottom: 12, borderRadius: 16 }}>
      <Card.Content style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
        <Checkbox
          status={item.completed ? "checked" : "unchecked"}
          onPress={() => updateTask(item.id, { completed: !item.completed })}
        />
        <View style={{ flex: 1 }}>
          <Text
            variant="titleMedium"
            style={{ textDecorationLine: item.completed ? "line-through" : "none" }}
          >
            {item.title}
          </Text>
          {!!item.description && (
            <Text variant="bodyMedium" style={{ opacity: 0.8, marginTop: 2 }}>
              {item.description}
            </Text>
          )}
          <View style={{ marginTop: 8, flexDirection: "row", gap: 8 }}>
            {item.dueDate && (
              <Chip compact icon="calendar" elevated>
                {new Date(item.dueDate).toLocaleString()}
              </Chip>
            )}
            {item.completed && (
              <Chip compact icon="check" style={{ backgroundColor: theme.colors.secondaryContainer }}>
                {t("labels.done")}
              </Chip>
            )}
          </View>
        </View>
        <IconButton
          icon="pencil"
          onPress={() => {
            setF({
              id: item.id,
              title: item.title,
              description: item.description || "",
              dueDate: item.dueDate || "",
            });
            setOpen(true);
          }}
        />
        <IconButton icon="delete" onPress={() => setConfirmDelete({ id: item.id, title: item.title })} />
      </Card.Content>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header mode="center-aligned">
        <Appbar.Content title={t("titles.tasks")} />
        <Appbar.Action
          icon={mode === "dark" ? "weather-sunny" : "moon-waning-crescent"}
          onPress={toggle}
          accessibilityLabel={t("a11y.toggleTheme")}
        />
        <Appbar.Action icon="translate" onPress={switchLang} accessibilityLabel={t("a11y.toggleLang")} />
        <Appbar.Action icon="logout" onPress={() => setConfirmLogout(true)} accessibilityLabel={t("actions.logout")} />
      </Appbar.Header>

      {/* === Card da API: AGORA abaixo do header (sem ListHeader) === */}
      {motivation.data ? (
        <Card mode="elevated" style={{ marginHorizontal: 16, marginTop: 12, borderRadius: 16 }}>
          <Card.Content style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <IconButton icon="lightbulb-on-outline" disabled />
            <Text style={{ flex: 1 }}>{motivation.data}</Text>
            <IconButton icon="refresh" onPress={() => motivation.refetch()} />
          </Card.Content>
        </Card>
      ) : null}

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      ) : !user?.uid ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text variant="titleLarge" style={{ marginBottom: 8 }}>{t("texts.notLogged")}</Text>
          <Button mode="contained" onPress={() => router.replace("/")}>{t("actions.goToLogin")}</Button>
        </View>
      ) : sorted.length === 0 ? (
        <View style={{ padding: 24, alignItems: "center" }}>
          <Text variant="titleLarge" style={{ marginBottom: 8 }}>{t("empty.title")}</Text>
          <Text variant="bodyMedium" style={{ opacity: 0.7, textAlign: "center" }}>{t("empty.subtitle")}</Text>
          <Button mode="contained" style={{ marginTop: 16 }} onPress={() => { setF({ title: "" }); setOpen(true); }}>
            {t("actions.addTask")}
          </Button>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          data={sorted}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => <TaskItem item={item} />}
        />
      )}

      <Button
        icon="plus"
        mode="contained"
        onPress={() => { setF({ title: "" }); setOpen(true); }}
        style={{ position: "absolute", right: 16, bottom: 24, borderRadius: 24 }}
      >
        {t("actions.new")}
      </Button>

      <Portal>
        <Modal
          visible={open}
          onDismiss={() => setOpen(false)}
          contentContainerStyle={{
            margin: 16,
            backgroundColor: theme.colors.elevation.level2,
            padding: 16,
            borderRadius: 16,
          }}
        >
          <TextInput
            mode="outlined"
            label={t("fields.title")}
            value={f.title}
            onChangeText={(v) => setF((s) => ({ ...s, title: v }))}
            style={{ marginBottom: 8 }}
          />
          <TextInput
            mode="outlined"
            label={t("fields.description")}
            value={f.description || ""}
            onChangeText={(v) => setF((s) => ({ ...s, description: v }))}
            style={{ marginBottom: 8 }}
            multiline
          />
          <TextInput
            mode="outlined"
            label={t("fields.datetime")}
            placeholder="2025-09-10T14:00"
            value={f.dueDate || ""}
            onChangeText={(v) => setF((s) => ({ ...s, dueDate: v }))}
          />
          <Button
            mode="contained"
            style={{ marginTop: 12 }}
            onPress={async () => {
              if (f.id) {
                await updateTask(f.id, {
                  title: f.title.trim(),
                  description: f.description?.trim() || null,
                  dueDate: f.dueDate || null,
                });
                Keyboard.dismiss();
                setSnack(t("toast.updated"));
                setOpen(false);
              } else {
                await create();
              }
            }}
          >
            {f.id ? t("actions.saveChanges") : t("actions.save")}
          </Button>
        </Modal>

        {/* Confirmar exclusão */}
        <Dialog visible={!!confirmDelete} onDismiss={() => setConfirmDelete(null)}>
          <Dialog.Title>{t("dialogs.deleteTitle")}</Dialog.Title>
          <Dialog.Content>
            <Text>{t("dialogs.deleteMessage", { title: confirmDelete?.title ?? "" })}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDelete(null)}>{t("actions.cancel")}</Button>
            <Button
              onPress={async () => {
                if (confirmDelete?.id) await remove(confirmDelete.id);
                setConfirmDelete(null);
              }}
            >
              {t("actions.delete")}
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Confirmar logout */}
        <Dialog visible={confirmLogout} onDismiss={() => setConfirmLogout(false)}>
          <Dialog.Title>{t("dialogs.logoutTitle")}</Dialog.Title>
          <Dialog.Content>
            <Text>{t("dialogs.logoutMessage", { email: user?.email ?? "" })}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmLogout(false)}>{t("actions.cancel")}</Button>
            <Button
              onPress={async () => {
                try { await logout(); } catch {}
                setConfirmLogout(false);
                router.replace("/");
              }}
            >
              {t("actions.logout")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Snackbar
          visible={!!snack}
          onDismiss={() => setSnack(null)}
          duration={2000}
          wrapperStyle={{ top: "40%", bottom: undefined }}
        >
          {snack}
        </Snackbar>
      </Portal>
    </View>
  );
}
