import { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Books from './pages/Books';
import Members from './pages/Members';
import Loans from './pages/Loans';
import Notifications from './pages/Notifications';
import Fines from './pages/Fines';
import { useAuth } from './AuthContext';
import { LENDING_API_BASE_URL } from './services/apis';

interface Member {
  id: number;
  firstName: string;
  lastName: string;
}

export default function App() {
  const { role, setRole, memberId, setMemberId } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (role !== 'member') return;

    let cancelled = false;
    (async () => {
      try {
        setLoadingMembers(true);
        const res = await fetch(`${LENDING_API_BASE_URL}/api/members`);
        const data: Member[] = await res.json();
        if (cancelled) return;

        setMembers(data);
        if ((!memberId || !data.some(m => m.id === memberId)) && data.length > 0) {
          setMemberId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load members', err);
        setMembers([]);
      } finally {
        if (!cancelled) setLoadingMembers(false);
      }
    })();

    return () => { cancelled = true; };
  }, [role]); 

  return (
    <div className="bg-light min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
        <div className="container">
          <a className="navbar-brand" href="/">Library</a>

          <div className="navbar-nav me-auto">
            <Link className="nav-link" to="/books">Books</Link>
            {role === 'manager' && <Link className="nav-link" to="/members">Members</Link>}
            <Link className="nav-link" to="/loans">Loans</Link>
            {role === 'member' && <Link className="nav-link" to="/notifications">Notifications</Link>}
            {role === 'manager' && <Link className="nav-link" to="/fines">Fines</Link>}
          </div>

          <div className="d-flex ms-auto align-items-center gap-2">\
            <select
              className="form-select form-select-sm"
              value={role}
              onChange={(e) => {
                const r = e.target.value as 'manager' | 'member';
                setRole(r);
                if (r === 'manager') setMemberId(null); 
              }}
            >
              <option value="member">Member</option>
              <option value="manager">Manager</option>
            </select>

            {/* member immpersonation dropdown  */}
            {role === 'member' && (
              <select
                className="form-select form-select-sm"
                value={memberId ?? ''}
                onChange={(e) => setMemberId(e.target.value ? Number(e.target.value) : null)}
                disabled={loadingMembers || members.length === 0}
                title={loadingMembers ? 'Loading members…' : undefined}
              >
                {loadingMembers && <option value="">Loading…</option>}
                {!loadingMembers && members.length === 0 && <option value="">No members</option>}
                {!loadingMembers && members.length > 0 && (
                  <>
                    {!memberId && <option value="">Select Member…</option>}
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.firstName} {m.lastName}
                      </option>
                    ))}
                  </>
                )}
              </select>
            )}
          </div>
        </div>
      </nav>

      <main className="d-flex justify-content-center">
        <div className="bg-white shadow-sm rounded p-4" style={{ width: '100%' }}>
          <Routes>
            <Route path="/books" element={<Books />} />
            {role === 'manager' && <Route path="/members" element={<Members />} />}
            <Route path="/loans" element={<Loans />} />
            {role === 'member' && <Route path="/notifications" element={<Notifications />} />}
            {role === 'manager' && <Route path="/fines" element={<Fines />} />}
          </Routes>
        </div>
      </main>
    </div>
  );
}
