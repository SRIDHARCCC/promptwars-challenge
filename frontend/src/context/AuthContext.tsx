"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User
} from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  authId: string;
  userName: string;
  userEmail: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInGuest: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  authId: "guest_citizen_default",
  userName: "Citizen Client",
  userEmail: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInGuest: async () => {},
  signOutUser: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestId, setGuestId] = useState<string>("guest_citizen_default");

  useEffect(() => {
    // Generate or restore a persistent local guest ID for unauthenticated visitors
    const stored = localStorage.getItem("satta_thozhan_guest_id");
    if (stored) {
      setGuestId(stored);
    } else {
      const newGuest = "guest_" + Math.random().toString(36).substring(2, 10);
      localStorage.setItem("satta_thozhan_guest_id", newGuest);
      setGuestId(newGuest);
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.warn("Google Popup sign-in error, trying anonymous auth fallback:", error);
      await signInGuest();
    }
  };

  const signInGuest = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.warn("Anonymous Firebase sign-in failed, continuing in guest mode:", error);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  const authId = user ? user.uid : guestId;
  const userName = user?.displayName || (user ? `Citizen (${user.uid.slice(0, 6)})` : "Citizen Client");
  const userEmail = user?.email || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        authId,
        userName,
        userEmail,
        loading,
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
