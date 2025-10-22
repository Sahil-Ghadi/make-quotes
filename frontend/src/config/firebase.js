import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBmF4JbkanZbJ2wivwgXJk3QNyuSAJ28J0",
  authDomain: "minifast-508d4.firebaseapp.com",
  projectId: "minifast-508d4",
  storageBucket: "minifast-508d4.firebasestorage.app",
  messagingSenderId: "506438406367",
  appId: "1:506438406367:web:a37d62029362581d3ad96a",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;