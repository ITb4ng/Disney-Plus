import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext({
  userData: null,
  authLoading: true,
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(() => {
    try {
      const raw = localStorage.getItem("userData");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.__PW_E2E_AUTH_BYPASS__ === true
    ) {
      try {
        const raw = localStorage.getItem("userData");
        if (raw) {
          setUserData(JSON.parse(raw));
        } else {
          const fallback = {
            uid: "e2e-user",
            displayName: "E2E User",
            email: "e2e@local.test",
            photoURL: null,
          };
          localStorage.setItem("userData", JSON.stringify(fallback));
          setUserData(fallback);
        }
      } catch {
        setUserData(null);
      }
      setAuthLoading(false);
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const next = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        };
        localStorage.setItem("userData", JSON.stringify(next));
        setUserData(next);
      } else {
        localStorage.removeItem("userData");
        setUserData(null);
      }

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(() => ({ userData, authLoading }), [userData, authLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
