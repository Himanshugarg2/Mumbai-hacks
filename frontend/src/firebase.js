import { initializeApp } from "firebase/app";
import { getAuth , GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCSNmqvk_E3EG50GhtdhuOTi6NJ8Euc_ak",
  authDomain: "spendfriend-c20d6.firebaseapp.com",
  projectId: "spendfriend-c20d6",
  storageBucket: "spendfriend-c20d6.firebasestorage.app",
  messagingSenderId: "327192036148",
  appId: "1:327192036148:web:361de8bd278cc4f99f5b61",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);