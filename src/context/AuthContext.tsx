import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { authService } from "@/services/api";

export interface User {
  id?: number;
  email: string;
  name: string;
  role: "user" | "admin";
  balance?: number;
  avatar_url?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  login: async () => false,
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
      console.log("Attempting login for:", email);
      const response = await authService.login({ email, password });

      console.log("Login response:", response.data);

      if (response.data?.success && response.data?.data) {
        const userData = response.data.data;
        const token = userData.token;

        if (!token) {
          console.error("Login successful but no token received");
          return false;
        }

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", token);

        console.log("Login success, user stored:", userData.email);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Login error detail:", error.response?.data || error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log("Logging out user:", user?.email);
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
        logout,
        isAdmin: user?.role === "admin",
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
