import { useEffect, useState } from 'react';
import axios from 'axios';

interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const res = await axios.get<Member[]>(`${API_BASE}/api/members`);
    setMembers(res.data);
  };

  const addMember = async () => {
    await axios.post(`${API_BASE}/api/members`, { firstName, lastName, email });
    setFirstName('');
    setLastName('');
    setEmail('');
    fetchMembers();
  };

  const deleteMember = async (id: number) => {
    await axios.delete(`${API_BASE}/api/members/${id}`);
    fetchMembers();
  };

  return (
    <div className="container">
      <h2 className="mb-4">👥 Members</h2>

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
              <th style={{ width: '100px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td>{member.firstName} {member.lastName}</td>
                <td>{member.email}</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteMember(member.id)}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
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
