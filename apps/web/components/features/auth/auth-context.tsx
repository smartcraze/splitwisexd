"use client";

import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import {
  createContext,
  Suspense,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

function AuthRedirectGuard({
  user,
  loading,
}: {
  user: User | null;
  loading: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      const isAuthPage = pathname === "/login" || pathname === "/register";
      if (!user && !isAuthPage) {
        router.replace("/login");
      } else if (user && isAuthPage) {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, pathname, router]);

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (error) {
          console.error("Failed to load user:", error);
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login({ email, password });
    localStorage.setItem("token", data.token);
    document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
    setToken(data.token);
    setUser(data.user);
    router.replace("/dashboard");
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api.register({ name, email, password });
    localStorage.setItem("token", data.token);
    document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
    setToken(data.token);
    setUser(data.user);
    router.replace("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setToken(null);
    setUser(null);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
      <Suspense fallback={null}>
        <AuthRedirectGuard user={user} loading={loading} />
      </Suspense>
    </AuthContext.Provider>
  );
}
