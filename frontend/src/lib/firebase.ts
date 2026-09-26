import { initializeApp, getApps, getApp, deleteApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User,
  Auth
} from "firebase/auth";

export interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const firebaseConfig: FirebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""
};

// Initialize default app for build or initial fallback
let app: FirebaseApp = !getApps().length
  ? initializeApp(
      firebaseConfig.apiKey && firebaseConfig.apiKey !== "demo-api-key"
        ? (firebaseConfig as Record<string, string>)
        : { apiKey: "demo-api-key", projectId: "demo-project" }
    )
  : getApp();

let auth: Auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export async function initFirebaseWithConfig(config: FirebaseClientConfig): Promise<Auth> {
  if (config.apiKey && config.apiKey !== "demo-api-key") {
    try {
      const existingApps = getApps();
      for (const a of existingApps) {
        await deleteApp(a);
      }
      app = initializeApp(config as Record<string, string>);
      auth = getAuth(app);
    } catch (e) {
      console.warn("Firebase re-initialization notice:", e);
    }
  }
  return auth;
}

export {
  app,
  auth,
  googleProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged
};
export type { User, Auth };
