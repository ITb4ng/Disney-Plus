// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import "firebase/auth";

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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);