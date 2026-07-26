// js/config/firebase-config.js

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

// 1. Inicializamos la app global de Firebase si aún no existe
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// 2. Exportamos 'db' compatible con .collection() para todo el admin
export const db = firebase.firestore();