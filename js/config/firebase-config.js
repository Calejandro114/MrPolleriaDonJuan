import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuración de tu proyecto
const firebaseConfig = {
  apiKey: "AIzaSyBRcBfAe76yPG790rotS_sDagasj568PWM",
  authDomain: "mrpolleriadonjuan-calejandro.firebaseapp.com",
  projectId: "mrpolleriadonjuan-calejandro",
  storageBucket: "mrpolleriadonjuan-calejandro.firebasestorage.app",
  messagingSenderId: "159298306787",
  appId: "1:159298306787:web:903aa60fa20fca6a297bd6",
  measurementId: "G-MZCL3J1X6W"
};

// Inicializamos
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);