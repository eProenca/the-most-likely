// Importando as funções necessárias para inicializar o Firebase e o Firestore
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDocs, getDoc, setDoc, collection, onSnapshot, deleteDoc, updateDoc, writeBatch, addDoc, increment } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);

// Obter o Firestore
const db = getFirestore(app);

// Exportando a referência para o Firestore
export { db, doc, getDocs, getDoc, setDoc, collection, onSnapshot, deleteDoc, updateDoc, writeBatch, addDoc, increment };
