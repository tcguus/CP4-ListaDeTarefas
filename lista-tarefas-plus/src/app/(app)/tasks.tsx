// app/(app)/tasks.tsx
import React from 'react';
import { View, Text, FlatList, TextInput, Button, Switch } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { listenTasks, createTask, updateTask, deleteTask, Task } from '@/services/tasks';
import { scheduleTaskNotification, ensureNotificationPermissions } from '@/lib/notifications';
import { useMotivation } from '@/hooks/useMotivation';
import { useTranslation } from 'react-i18next';

export default function TasksScreen() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [dueDate, setDueDate] = React.useState(''); // ISO string yyyy-mm-ddThh:mm:ssZ
  const { data: quote } = useMotivation();

  React.useEffect(() => {
    if (!user) return;
    ensureNotificationPermissions();
    return listenTasks(user.uid, setTasks); // onSnapshot (tempo real)
  }, [user?.uid]);

  const add = async () => {
    if (!user) return;
    await createTask(user.uid, { title, description, dueDate });
    if (dueDate) await scheduleTaskNotification(title, dueDate);
    setTitle(''); setDescription(''); setDueDate('');
  };

  return (
    <View style={{ flex:1, padding:16 }}>
      {!!quote && <Text style={{ marginBottom:8 }}>{`“${quote.content}” — ${quote.author}`}</Text>}
      <Text style={{ fontSize:22, marginBottom:8 }}>{t('tasks')}</Text>

      <TextInput placeholder={t('title')} value={title} onChangeText={setTitle} style={{ borderWidth:1, padding:8, marginBottom:6 }} />
      <TextInput placeholder={t('description')} value={description} onChangeText={setDescription} style={{ borderWidth:1, padding:8, marginBottom:6 }} />
      <TextInput placeholder={`${t('dueDate')} (2025-09-10T14:00:00Z)`} value={dueDate} onChangeText={setDueDate} style={{ borderWidth:1, padding:8, marginBottom:6 }} />
      <Button title={t('newTask')} onPress={add} />

      <FlatList
        style={{ marginTop:12 }}
        data={tasks}
        keyExtractor={(i) => i.id!}
        renderItem={({ item }) => (
          <View style={{ padding:12, borderWidth:1, marginBottom:8 }}>
            <Text style={{ fontWeight:'bold' }}>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text>{item.dueDate}</Text>
            <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
              <Switch value={item.completed} onValueChange={(v) => updateTask(user!.uid, item.id!, { completed: v })} />
              <Button title="✏️" onPress={() => updateTask(user!.uid, item.id!, { title: item.title + ' *' })} />
              <Button title="🗑️" onPress={() => deleteTask(user!.uid, item.id!)} />
            </View>
          </View>
        )}
      />

      <View style={{ marginTop:8 }}>
        <Button title="Sair" onPress={logout} />
      </View>
    </View>
  );
}
