import { useEffect, useState } from 'react';
import axios from 'axios';

interface Loan {
  id: number;
  borrowedAt: string;
  dueDate: string;
  returned: boolean;
  book: { id: number; title: string };
  member: { id: number; firstName: string; lastName: string };
}

export default function Loans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    const res = await axios.get<Loan[]>(`${API_BASE}/api/loans`);
    setLoans(res.data);
  };

  const returnBook = async (loanId: number) => {
    await axios.post(`${API_BASE}/api/loans/${loanId}/return`);
    fetchLoans();
  };

  return (
    <div className="container">
      <h2 className="mb-4">📖 Loans</h2>

      <div className="table-responsive">
        <table className="table table-striped table-bordered align-middle">
          <thead className="table-primary">
            <tr>
              <th>Book</th>
              <th>Borrower</th>
              <th>Borrowed At</th>
              <th>Due Date</th>
              <th>Status</th>
              <th style={{ width: '100px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.book.title}</td>
                <td>{loan.member.firstName} {loan.member.lastName}</td>
                <td>{new Date(loan.borrowedAt).toLocaleDateString()}</td>
                <td>{new Date(loan.dueDate).toLocaleDateString()}</td>
                <td>
                  {loan.returned ? (
                    <span className="badge bg-success">Returned</span>
                  ) : (
                    <span className="badge bg-warning text-dark">Borrowed</span>
                  )}
                </td>
                <td>
                  {!loan.returned && (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => returnBook(loan.id)}
                    >
                      Return
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {loans.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted">
                  No loans found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
