import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { authService } from "@/services/api";

export interface User {
  id?: number;
  email: string;
  name: string;
  role: "user" | "admin";
  balance?: number;
  phone?: string;
  avatar_url?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  /** Simpan user + token setelah register (backend mengembalikan JWT). */
  setSession: (userData: User) => void;
  /** Sinkronkan nama/saldo/dll dari GET /api/auth/profile. */
  refreshProfile: () => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  login: async () => false,
  setSession: () => {},
  refreshProfile: async () => {},
  logout: () => {},
  isAdmin: false,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check stored user on mount
  useEffect(() => {
    const saved = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (saved && token) {
      try {
        setUser(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse stored user:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });

      if (response.data?.success && response.data?.data) {
        const userData = response.data.data;
        const token = userData.token;

        if (!token) {
          return false;
        }

        setSession(userData);
        return true;
      }
      return false;
    } catch (error: any) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const setSession = (userData: User) => {
    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const refreshProfile = useCallback(async (): Promise<void> => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const { data } = await authService.getProfile();
      if (data?.success && data?.data) {
        const prevRaw = localStorage.getItem("user");
        const prev = prevRaw ? (JSON.parse(prevRaw) as User) : ({} as User);
        const merged: User = {
          ...prev,
          ...data.data,
          token: prev.token ?? token,
        };
        localStorage.setItem("user", JSON.stringify(merged));
        setUser(merged);
      }
    } catch {
      /* abaikan */
    }
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        setSession,
        refreshProfile,
        logout,
        isAdmin: user?.role === "admin",
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
