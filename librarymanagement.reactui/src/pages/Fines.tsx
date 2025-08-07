import { useEffect, useState } from "react";
import finesApi from "../services/finesApi";

interface Fine {
  id: number;
  memberId: number;
  bookId: number;
  amount: number;
  collected: boolean;
}

export default function FinesPage() {
  const [fines, setFines] = useState<Fine[]>([]);

  useEffect(() => {
    finesApi.get("/fines").then(response => setFines(response.data));
  }, []);

  const collectFine = (id: number) => {
    finesApi.post(`/fines/${id}/collect`).then(() => {
      setFines(fines.map(f => f.id === id ? { ...f, collected: true } : f));
    });
  };

  return (
    <div className="container">
      <h2 className="mb-4">💰 Fines Management</h2>

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
