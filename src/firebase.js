import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD9ZtHQbZo5OCRjWAxGCpcAoql-VxTdIrY",
  authDomain: "expense-tracker-signup-2636e.firebaseapp.com",
  projectId: "expense-tracker-signup-2636e",
  storageBucket: "expense-tracker-signup-2636e.firebasestorage.app",
  messagingSenderId: "556684472867",
  appId: "1:556684472867:web:765cc4ea563b302923b796",
  measurementId: "G-49Q4JC777E",
  databaseURL: "https://expense-tracker-signup-2636e-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);