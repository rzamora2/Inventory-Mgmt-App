// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDHnGsugTiN22bb2TG0mOFWYtVdBfwuepc",
  authDomain: "inventory-management-cb7b0.firebaseapp.com",
  projectId: "inventory-management-cb7b0",
  storageBucket: "inventory-management-cb7b0.appspot.com",
  messagingSenderId: "479952732127",
  appId: "1:479952732127:web:2616d1452639cfd5524e6a",
  measurementId: "G-428JV2K1V2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);

export {firestore};