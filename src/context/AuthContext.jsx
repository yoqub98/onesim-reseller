import { createContext, useContext, useEffect, useState } from "react";

/**
 * AuthContext - Mock authentication state management
 *
 * This provides a simple authentication context for the prototype.
 * In production, this will be replaced with Supabase auth.
 *
 * Backend Integration Notes:
 * - Replace localStorage mock with Supabase session management
 * - Use supabase.auth.getSession() on initialization
 * - Subscribe to supabase.auth.onAuthStateChange()
 * - Implement proper token refresh logic (Supabase handles auto refresh if enabled)
 * - Add partner profile bootstrap from `partners` table by `user_id`
 *
 * Expected user shape consumed by UI:
 * {
 *   id: string,            // auth user id
 *   email: string,
 *   company_name: string,  // used by topbar/sidebar
 *   approval_status?: 'pending'|'approved',
 *   registered_at?: string, // ISO date string
 *   partner_id?: string,   // useful for scoped writes
 *   role?: 'partner'|'admin'
 * }
 *
 * Usage:
 * const { user, isAuthenticated, login, logout } = useAuth();
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      // TODO: Replace with Supabase session check
      // const { data: { session } } = await supabase.auth.getSession();
      const mockUser = localStorage.getItem("mockUser");
      if (mockUser) {
        setUser(JSON.parse(mockUser));
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    // TODO: Replace with actual Supabase authentication
    // This is just mock data for prototype
    const user = {
      id: "mock-user-id",
      email: userData.email || "partner@example.com",
      company_name: userData.company_name || "Example Company",
      approval_status: userData.approval_status || "approved",
      ...userData
    };
    setUser(user);
    localStorage.setItem("mockUser", JSON.stringify(user));
  };

  const logout = () => {
    // TODO: Replace with Supabase signOut
    // await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem("mockUser");
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isPendingApproval: user?.approval_status === "pending",
    isLoading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
