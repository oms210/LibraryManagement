import { useEffect, useMemo, useState } from 'react';
import { LENDING_API_BASE_URL } from '../services/apis';
import { useAuth } from '../AuthContext';

interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

type Editable = Partial<Pick<Member, 'firstName' | 'lastName' | 'email'>>;

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft]         = useState<Editable>({});
  const { role } = useAuth();

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${LENDING_API_BASE_URL}/api/members`);
      if (!response.ok) throw new Error('Failed to fetch members');
      const data: Member[] = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const addMember = async () => {
    try {
      const response = await fetch(`${LENDING_API_BASE_URL}/api/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Role: role },
        body: JSON.stringify({ firstName, lastName, email }),
      });
      if (!response.ok) throw new Error('Failed to add member');
      setFirstName('');
      setLastName('');
      setEmail('');
      fetchMembers();
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add member.');
    }
  };

  const deleteMember = async (id: number) => {
    try {
      const response = await fetch(`${LENDING_API_BASE_URL}/api/members/${id}`, {
        method: 'DELETE',
        headers: { Role: role },
      });
      if (!response.ok) throw new Error('Failed to delete member');
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Failed to delete member.');
    }
  };

  const beginEdit = (m: Member) => {
    setEditingId(m.id);
    setDraft({ firstName: m.firstName, lastName: m.lastName, email: m.email });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
  };

  const updateMember = async (id: number) => {
    try {
      const response = await fetch(`${LENDING_API_BASE_URL}/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Role: role },
        body: JSON.stringify({ id, ...draft }),
      });
      if (!response.ok) throw new Error('Failed to update member');
      else
        fetchMembers();

      cancelEdit();
    } catch (error) {
      console.error('Error updating member:', error);
      //alert('Failed to update member.');
    }
  };

  const canSave = useMemo(() => {
    if (editingId == null) return false;
    const e = members.find(m => m.id === editingId);
    if (!e) return false;
    const firstName = (draft.firstName ?? '').trim();
    const lastName = (draft.lastName ?? '').trim();
    const emailAdd = (draft.email ?? '').trim();
    if (!firstName || !lastName || !emailAdd) return false;
    return firstName !== e.firstName || lastName !== e.lastName || emailAdd !== e.email;
  }, [editingId, draft, members]);

  return (
    <div className="container">
      <h2 className="mb-4">👥 Members</h2>
      {role !== 'manager' && (
        <div className="alert alert-warning">
          You do not have permission to manage members.
        </div>
      )}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="col-12 text-end">
          <button className="btn btn-primary" onClick={addMember}>
            ➕ Add Member
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-bordered align-middle">
          <thead className="table-secondary">
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th style={{ width: 200 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const isEditing = editingId === m.id;
              return (
                <tr key={m.id}>
                  <td>
                    {isEditing ? (
                      <div className="row g-2">
                        <div className="col">
                          <input
                            className="form-control form-control-sm"
                            value={draft.firstName ?? ''}
                            onChange={(e) =>
                              setDraft(d => ({ ...d, firstName: e.target.value }))
                            }
                            placeholder="First name"
                          />
                        </div>
                        <div className="col">
                          <input
                            className="form-control form-control-sm"
                            value={draft.lastName ?? ''}
                            onChange={(e) =>
                              setDraft(d => ({ ...d, lastName: e.target.value }))
                            }
                            placeholder="Last name"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        {m.firstName} {m.lastName}
                      </>
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        className="form-control form-control-sm"
                        type="email"
                        value={draft.email ?? ''}
                        onChange={(e) =>
                          setDraft(d => ({ ...d, email: e.target.value }))
                        }
                        placeholder="Email"
                      />
                    ) : (
                      m.email
                    )}
                  </td>

                  <td className="text-nowrap">
                    {!isEditing ? (
                      <>
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => beginEdit(m)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteMember(m.id)}
                        >
                          🗑️ Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-sm btn-success me-2"
                          onClick={() => updateMember(m.id)}
                          disabled={!canSave}
                          title={canSave ? 'Save changes' : 'No changes to save'}
                        >
                          ✅ Save
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={cancelEdit}
                        >
                          ✖️ Cancel
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}

            {members.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-muted">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
