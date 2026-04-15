import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type UserRole = 'donor' | 'receiver' | 'admin';

interface AuthContextType {
  user: any | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('as_user');
    const savedRole = localStorage.getItem('as_role') as UserRole;
    if (savedUser && savedRole) {
      setUser({ email: savedUser });
      setRole(savedRole);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (email: string, userRole: UserRole) => {
    localStorage.setItem('as_user', email);
    localStorage.setItem('as_role', userRole);
    setUser({ email });
    setRole(userRole);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('as_user');
    localStorage.removeItem('as_role');
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
