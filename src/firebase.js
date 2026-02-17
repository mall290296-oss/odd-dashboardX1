// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA1JYXMX88AakzKdfJhlU7Gy_oYnVDEpVM",
  authDomain: "odd-x-11eb5.firebaseapp.com",
  projectId: "odd-x-11eb5",
  storageBucket: "odd-x-11eb5.firebasestorage.app",
  messagingSenderId: "706867582900",
  appId: "1:706867582900:web:fe281a3995268ca80004e1",
  measurementId: "G-K3HC6MWG3S"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
