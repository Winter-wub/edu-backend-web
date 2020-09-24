import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";
import config from "../config.json";

export const firebaseApp = firebase.initializeApp(config.firebase);
export const firestore = firebaseApp.firestore();
firebase.analytics();
export const auth = firebaseApp.auth();

if (process.env.NODE_ENV === "development") {
  firestore.settings({
    host: "localhost:8080",
    ssl: false
  });
}
