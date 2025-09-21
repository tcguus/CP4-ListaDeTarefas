# Lista Tarefas Plus (Expo + Firebase)

Aplicativo mobile de lista de tarefas com autenticação (Firebase Auth), Firestore por usuário, sincronização em tempo real, tema claro/escuro com persistência, internacionalização PT/EN, notificações locais agendadas e consumo de API externa via TanStack Query.

## ✨ Funcionalidades
- **Autenticação (Firebase Auth)**: Email/Senha com persistência.
- **Firestore por usuário**: CRUD completo em `users/{uid}/tasks`, com **tempo real** via `onSnapshot`.
- **Tema claro/escuro**: troca dinâmica com persistência (AsyncStorage).
- **Internacionalização (i18n)**: PT/EN com troca em tempo real.
- **Notificações locais**: agendamento por data/hora da tarefa.
- **TanStack Query**: consumo de API externa (frases motivacionais) com cache/refetch.
- **UX**: diálogos de confirmação (excluir & logout), “mostrar/ocultar senha”, Snackbars posicionadas acima do teclado (Portal).

## 🧱 Stack
- **Expo** (Router), **React Native** e **React Native Paper**
- **Firebase**: Auth + Firestore
- **@tanstack/react-query**
- **i18n**: react-i18next
- **expo-notifications**
- **AsyncStorage**

## 📁 Estrutura (trechos relevantes)
```
app/
  _layout.tsx           # Providers, handler & permissão de notificações
  index.tsx             # Login (Email/Senha, tema, idioma)
  (app)/tasks.tsx       # Lista + CRUD + Query (banner), diálogos, notificações
src/
  contexts/             # AuthContext, ThemeContext
  i18n/                 # i18n.ts + pt.json / en.json
  lib/firebase.ts       # Config Firebase (app, auth, db)
  components/           # Card/FAB/itens (se aplicável)
```
**Firestore**
```
users/{uid}/tasks/{taskId}
  title: string
  description: string | null
  completed: boolean
  dueDate: string | null (ISO)
  notifId: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
```

## ⚙️ Pré‑requisitos
- Node.js LTS
- Conta Firebase (projeto criado, Auth + Firestore habilitados)
- Expo CLI (`npx expo` já incluso via `expo` no projeto)
- (Android) Android Studio / Emulador ou dispositivo físico
- (iOS) Xcode/simulador ou dispositivo + Expo Go

## 🔐 Configuração do Firebase
Edite `src/lib/firebase.ts` com as credenciais do seu projeto:
```ts
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔰 copie do console Firebase (App Web)
const firebaseConfig = { /* ... */ };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); // ou initializeAuth com persistência RN, se preferir
```
No **Console Firebase** ative:
- **Authentication** → Sign-in method → **Email/Password**
- **Firestore** → Regras adequadas para testes desenv. (ou regras seguras para produção)

## ▶️ Rodando o projeto
```bash
npm install
npx expo start
```
- Abra no **Expo Go** (dispositivo) ou no **emulador**.
- Permita notificações quando solicitado.

## 🧪 Testes manuais sugeridos
1. **Cadastro e login** por email/senha.
2. **Auto-login** (feche/abra o app).
3. **Criar tarefa** com data futura (30–60s) → receba **notificação local**.
4. **Editar** (título/descrição/data) e **concluir** (checkbox).
5. **Excluir** com **confirmação**.
6. Trocar **tema** e **idioma** (PT/EN).
7. Ver **banner motivacional** (TanStack Query) e dar **refresh**.
8. Conferir no **Firestore Console** (`users/{uid}/tasks`) as mudanças em tempo real.

## 📦 Gerar APK (Android)
> Requer conta gratuita no **EAS** (Expo Application Services).

```bash
npm install -g eas-cli
eas login
eas build:configure               # cria eas.json (se não existir)
eas build -p android --profile preview
```
- Aguarde o link de download no terminal (ou painel do EAS).
- Para **.apk** diretamente, crie um profile `preview` do tipo `apk` no `eas.json`:
```json
{
  "build": {
    "preview": {
      "android": { "buildType": "apk" }
    }
  }
}
```
Depois rode: `eas build -p android --profile preview`

---

## Nossos integrantes
- **Gustavo Camargo de Andrade**
- RM555562
- 2TDSPF
-------------------------------------------
- **Rodrigo Souza Mantovanello**
- RM555451
- 2TDSPF
-------------------------------------------
- **Leonardo Cesar Rodrigues Nascimento**
- RM558373
- 2TDSPF


