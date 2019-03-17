// import firebase from "firebase";
import firebase from "firebase/app";

export const appName = "react-adv-learnjavascript";

export const firebaseConfig = {
  apiKey: "AIzaSyBraPe4UaUFHd__Lgkvsqt96PFVsViqe50",
  authDomain: `${appName}.firebaseapp.com`,
  databaseURL: `https://${appName}.firebaseio.com`,
  projectId: appName,
  storageBucket: `${appName}.appspot.com`,
  messagingSenderId: "74184295268"
};

firebase.initializeApp(firebaseConfig);
