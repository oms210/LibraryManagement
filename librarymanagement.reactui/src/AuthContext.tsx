import { createContext, useContext, useState } from "react";

type Role = "manager" | "member";

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  memberId: number | null;
  setMemberId: (id: number | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>("member");
  const [memberId, setMemberId] = useState<number | null>(null);

  return (
    <AuthContext.Provider value={{ role, setRole, memberId, setMemberId }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
