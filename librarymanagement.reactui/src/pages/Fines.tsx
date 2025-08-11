import { useEffect, useState } from "react";
import { useAuth } from '../AuthContext';
import { FINES_API_BASE_URL } from '../services/apis';

interface Fine {
  id: number;
  memberId: number;
  bookId: number;
  amount: number;
  collected: boolean;
}

export default function Fines() {
  const [fines, setFines] = useState<Fine[]>([]);
    const { role } = useAuth();
  useEffect(() => {
    fetchFines();
  }, []);
  
  const fetchFines = async () => {
    const response = await fetch(`${FINES_API_BASE_URL}/api/fines`,{ headers: { Role: role }});
    const data = await response.json();
    setFines(data);
  };
 const collectFine =async (id: number) => {
    await fetch(`${FINES_API_BASE_URL}/fines/${id}/collect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
  
    });
   setFines(fines.map(f => f.id === id ? { ...f, collected: true } : f));
  };

  return (
    <div className="container">
      <h2 className="mb-4">💰 Fines Management</h2>
  {role !== 'manager' && (
        <div className="alert alert-warning">
          You do not have permission to manage fines.
        </div>
      )}
      {fines.length === 0 ? (
        <div className="alert alert-info">No fines found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered align-middle table-striped">
            <thead className="table-primary">
              <tr>
                <th scope="col">Member ID</th>
                <th scope="col">Book ID</th>
                <th scope="col">Amount</th>
                <th scope="col">Status</th>
                <th scope="col" style={{ width: '120px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {fines.map(f => (
                <tr key={f.id}>
                  <td>{f.memberId}</td>
                  <td>{f.bookId}</td>
                  <td>${f.amount.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${f.collected ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {f.collected ? "Collected" : "Pending"}
                    </span>
                  </td>
                  <td>
                    {!f.collected ? (
                      <button
                        onClick={() => collectFine(f.id)}
                        className="btn btn-sm btn-success"
                      >
                        ✅ Collect
                      </button>
                    ) : (
                      <span className="text-muted">✔️</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
