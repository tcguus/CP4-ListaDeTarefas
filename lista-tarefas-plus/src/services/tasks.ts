// services/tasks.ts
import { db } from '@/lib/firebase';
import {
  addDoc, collection, serverTimestamp, onSnapshot, orderBy, query,
  updateDoc, deleteDoc, doc
} from 'firebase/firestore';

export type Task = {
  id?: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string; // ISO 8601
  createdAt?: any;
  updatedAt?: any;
};

export const tasksCol = (uid: string) => collection(db, 'users', uid, 'tasks');

export const listenTasks = (uid: string, cb: (tasks: Task[]) => void) => {
  const q = query(tasksCol(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const list: Task[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as Task) }));
    cb(list);
  });
};

export const createTask = (uid: string, t: Omit<Task,'id'|'createdAt'|'updatedAt'|'completed'>) =>
  addDoc(tasksCol(uid), {
    ...t,
    completed: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const updateTask = (uid: string, id: string, data: Partial<Task>) =>
  updateDoc(doc(db, 'users', uid, 'tasks', id), { ...data, updatedAt: serverTimestamp() });

export const deleteTask = (uid: string, id: string) =>
  deleteDoc(doc(db, 'users', uid, 'tasks', id));
