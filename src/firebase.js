import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyDDpjeidO4i_B78EOdwAwtkBZUoDz-7HXI",
  authDomain: "react-disney-project-6834d.firebaseapp.com",
  projectId: "react-disney-project-6834d",
  storageBucket: "react-disney-project-6834d.appspot.com",
  messagingSenderId: "779501495991",
  appId: "1:779501495991:web:17b69845c29d33e7f90f32",
  measurementId: "G-WB254MVN8Y"
};

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;