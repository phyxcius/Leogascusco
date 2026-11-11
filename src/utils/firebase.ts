import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Configuración web de Firebase (no es secreta: la seguridad real está en las reglas de la base de datos).
const firebaseConfig = {
  apiKey: 'AIzaSyCnYaUN-aZYzEip9z3wsuKnbwdfYscFZkY',
  authDomain: 'leogas-cusco.firebaseapp.com',
  databaseURL: 'https://leogas-cusco-default-rtdb.firebaseio.com',
  projectId: 'leogas-cusco',
  storageBucket: 'leogas-cusco.firebasestorage.app',
  messagingSenderId: '1042930313066',
  appId: '1:1042930313066:web:ce6c424afe606f63322713'
};

export const FIREBASE_ENABLED = true;

export const fbApp = initializeApp(firebaseConfig);
export const fbAuth = getAuth(fbApp);
export const fbDb = getDatabase(fbApp);

/**
 * Convierte el usuario escrito en el login a un correo de Firebase Auth.
 * "admin"  -> admin@leogas.pe
 * "edwin"  -> edwin@leogas.pe
 * Si ya trae @, se usa tal cual.
 */
export function toEmail(user: string): string {
  const u = (user || '').trim().toLowerCase();
  if (u.includes('@')) return u;
  return `${u.replace(/\s+/g, '')}@leogas.pe`;
}
