import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LENDING_API_BASE_URL } from "./services/apis";

type Role = "manager" | "member";
export interface Member { id: number; firstName: string; lastName: string; email: string; }

interface AuthContextType {
  role: Role;
  setRole: (r: Role) => void;
  members: Member[];
  memberId?: number | null;
  setMemberId: (id: number | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>(() => (localStorage.getItem("role") as Role) || "member");
  const [members, setMembers] = useState<Member[]>([]);
  const [memberId, setMemberIdState] = useState<number | null>(() => {
    const raw = localStorage.getItem("memberId");
    return raw ? Number(raw) : null;
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${LENDING_API_BASE_URL}/api/members`);
        const data: Member[] = await res.json();
        setMembers(data);
      } catch (e) {
        console.error("Failed to load members", e);
      }
    })();
  }, []);
  useEffect(() => {
    if (role === "member" && (!memberId || !members.some(m => m.id === memberId))) {
      const first = members[0];
      if (first) {
        setMemberIdState(first.id);
        localStorage.setItem("memberId", String(first.id));
      }
    }
    localStorage.setItem("role", role);
  }, [role, members]); 

  const setMemberId = (id: number | null) => {
    setMemberIdState(id);
    if (id == null) localStorage.removeItem("memberId");
    else localStorage.setItem("memberId", String(id));
  };

  const value = useMemo(() => ({ role, setRole, members, memberId, setMemberId }), [role, members, memberId]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
