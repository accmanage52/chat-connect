import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDNmHeVVpBdsAjhlSF2F7Au6x2A5-wRfJI",
  authDomain: "client-chat-support.firebaseapp.com",
  projectId: "client-chat-support",
  storageBucket: "client-chat-support.firebasestorage.app",
  messagingSenderId: "84411906042",
  appId: "1:84411906042:web:d1b211260fe58b3bf91643"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
