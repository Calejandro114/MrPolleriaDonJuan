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
firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore();