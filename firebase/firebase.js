import { initializeApp ,getApp,getApps} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDs4qfELZe0BfoG-qQetmnVrfp16rfiKOo",
  authDomain: "botscout-b3152.firebaseapp.com",
  projectId: "botscout-b3152",
  storageBucket: "botscout-b3152.firebasestorage.app",
  messagingSenderId: "234921529504",
  appId: "1:234921529504:web:89b7219246e9adc92b79c5",
  measurementId: "G-92SP40R7MK"
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);
export {auth,firestore,app};