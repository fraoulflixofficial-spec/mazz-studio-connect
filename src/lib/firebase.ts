import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCubWt3XNsHsSsN1VmEvihmrac7wLhu_1s",
  authDomain: "mazze-loveable.firebaseapp.com",
  databaseURL: "https://mazze-loveable-default-rtdb.firebaseio.com",
  projectId: "mazze-loveable",
  storageBucket: "mazze-loveable.firebasestorage.app",
  messagingSenderId: "1021415939770",
  appId: "1:1021415939770:web:3173904619fd5d71e6ac83",
  measurementId: "G-VW47CPR126"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;
