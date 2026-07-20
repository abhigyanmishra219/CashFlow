"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  brandScope?: string;
  phone?: string;
  photoUrl?: string;
  brandLogo?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export default function UserProvider({
  children,
  user: initialUser = null,
}: {
  children: ReactNode;
  user?: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading] = useState(false);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        window.location.href = "/login"; // Force full page reload redirect
      }
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
