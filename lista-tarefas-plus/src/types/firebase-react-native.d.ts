// src/types/firebase-react-native.d.ts
declare module 'firebase/auth/react-native' {
  import type { Persistence } from 'firebase/auth';
  const getReactNativePersistence: (storage: any) => Persistence;
  export { getReactNativePersistence };
}
