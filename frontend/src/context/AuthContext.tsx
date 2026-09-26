"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  initFirebaseWithConfig,
  User,
  Auth
} from "@/lib/firebase";
import { setApiBaseUrl } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  authId: string;
  userName: string;
  userEmail: string | null;
  isGuest: boolean;
  loading: boolean;
  signingIn: boolean;
  authNotice: string | null;
  dismissNotice: () => void;
  signInWithGoogle: () => Promise<void>;
  signInGuest: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  authId: "guest_citizen_default",
  userName: "Citizen Client",
  userEmail: null,
  isGuest: false,
  loading: true,
  signingIn: false,
  authNotice: null,
  dismissNotice: () => {},
  signInWithGoogle: async () => {},
  signInGuest: async () => {},
  signOutUser: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [activeAuth, setActiveAuth] = useState<Auth>(auth);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [guestId, setGuestId] = useState<string>("guest_citizen_default");
  const [isGuest, setIsGuest] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  useEffect(() => {
    // Generate or restore a persistent local guest ID for unauthenticated visitors
    let activeGuestId = localStorage.getItem("satta_thozhan_guest_id");
    if (!activeGuestId) {
      activeGuestId = "guest_" + Math.random().toString(36).substring(2, 10);
      localStorage.setItem("satta_thozhan_guest_id", activeGuestId);
    }
    setGuestId(activeGuestId);

    const storedIsGuest = localStorage.getItem("satta_thozhan_is_guest");
    if (storedIsGuest === "true") {
      setIsGuest(true);
    }

    let unsub: () => void = () => {};

    async function bootstrapAuth() {
      let liveAuth = auth;
      try {
        const res = await fetch("/api/auth-config");
        if (res.ok) {
          const cfg = await res.json();
          if (cfg.apiUrl) {
            setApiBaseUrl(cfg.apiUrl);
          }
          if (cfg.apiKey && cfg.apiKey !== "demo-api-key") {
            liveAuth = await initFirebaseWithConfig(cfg);
            setActiveAuth(liveAuth);
          }
        }
      } catch (e) {
        console.warn("Could not load runtime auth config:", e);
      }

      unsub = onAuthStateChanged(liveAuth, (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          setIsGuest(false);
          localStorage.removeItem("satta_thozhan_is_guest");
        }
        setLoading(false);
      });
    }

    bootstrapAuth();

    return () => unsub();
  }, []);

  const dismissNotice = () => setAuthNotice(null);

  const signInWithGoogle = async () => {
    setSigningIn(true);
    setAuthNotice(null);

    try {
      await signInWithPopup(activeAuth, googleProvider);
      setIsGuest(false);
      localStorage.removeItem("satta_thozhan_is_guest");
    } catch (error: unknown) {
      console.warn("Google Popup sign-in notice:", error);
      const errCode = (error as { code?: string })?.code;
      let message = "Google Sign-In was unsuccessful. Continuing in Citizen Guest Session.";
      if (errCode === "auth/unauthorized-domain") {
        message = "Cloud Run domain is not authorized in Firebase Console. Switched to Citizen Guest Session.";
      } else if (errCode === "auth/popup-blocked") {
        message = "Browser blocked Google Sign-In popup. Switched to Citizen Guest Session.";
      } else if (errCode === "auth/popup-closed-by-user") {
        message = "Google Sign-In cancelled. Continuing in Citizen Guest Session.";
      } else if (errCode === "auth/api-key-not-valid" || errCode === "auth/invalid-api-key") {
        message = "Firebase API key not configured for this build. Operating in Citizen Guest Session.";
      }
      setIsGuest(true);
      localStorage.setItem("satta_thozhan_is_guest", "true");
      setAuthNotice(message);
    } finally {
      setSigningIn(false);
    }
  };

  const signInGuest = async () => {
    setSigningIn(true);
    setAuthNotice(null);
    try {
      await signInAnonymously(activeAuth);
      setIsGuest(true);
      localStorage.setItem("satta_thozhan_is_guest", "true");
      setAuthNotice("Connected to Firebase Anonymous Session.");
    } catch (error) {
      console.info("Firebase Anonymous Auth unavailable; using persistent Local Citizen Session:", error);
      setIsGuest(true);
      localStorage.setItem("satta_thozhan_is_guest", "true");
      setAuthNotice("Active in Citizen Guest Session. Consultation records will persist safely.");
    } finally {
      setSigningIn(false);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(activeAuth);
    } catch (error) {
      console.error("Sign out error", error);
    }
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem("satta_thozhan_is_guest");
    setAuthNotice(null);
  };

  const authId = user ? user.uid : guestId;
  const userName = user?.displayName
    ? user.displayName
    : isGuest
    ? `Citizen (${guestId.replace("guest_", "").slice(0, 6)})`
    : user
    ? `Citizen (${user.uid.slice(0, 6)})`
    : "Citizen Client";
  const userEmail = user?.email || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        authId,
        userName,
        userEmail,
        isGuest,
        loading,
        signingIn,
        authNotice,
        dismissNotice,
        signInWithGoogle,
        signInGuest,
        signOutUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
