import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { getDoc, onSnapshot, serverTimestamp, setDoc, Unsubscribe } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, UserRole } from '../types/schema';
import { userDoc } from '../lib/paths';

type AuthContextValue = {
  authUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  authUser: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let profileUnsub: Unsubscribe | undefined;

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (profileUnsub) {
        profileUnsub();
        profileUnsub = undefined;
      }

      setAuthUser(fbUser);
      if (!fbUser) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      const ref = userDoc(db, fbUser.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(
          ref,
          {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName ?? fbUser.email,
            role: UserRole.Manager,
            isDisabled: false,
            createdAt: serverTimestamp(),
          },
          { merge: true },
        );
      }

      profileUnsub = onSnapshot(userDoc(db, fbUser.uid), (docSnap) => {
        const data = docSnap.data() as User | undefined;
        setUserProfile(data ?? null);
        setLoading(false);
      });
    });

    return () => {
      unsub();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  const value = useMemo(
    () => ({
      authUser,
      userProfile,
      loading,
      signOut: () => firebaseSignOut(auth),
    }),
    [authUser, userProfile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
