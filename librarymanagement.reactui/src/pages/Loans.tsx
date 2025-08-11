import { useEffect, useState } from 'react';
import { LENDING_API_BASE_URL } from '../services/apis';
import { useAuth } from '../AuthContext';

interface Loan {
  id: number;
  borrowedAt: string;
  dueDate: string;
  returned: boolean;
  book?: { id: number; title: string }|null;
  member?: { id: number; firstName: string; lastName: string } | null;
}

export default function Loans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const { role,  memberId } = useAuth();

  useEffect(() => {
    if (role === 'member' && !memberId) {
      setLoans([]);
      return;
    }
    fetchLoans();
  }, [role, memberId]);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const url =
        role === 'member' && memberId
          ? `${LENDING_API_BASE_URL}/api/loans?memberId=${memberId}`
          : `${LENDING_API_BASE_URL}/api/loans`;

      const response = await fetch(url, { headers: { Role: role } });
      if (!response.ok) throw new Error(`Fetch loans failed: ${response.status}`);
      const data: Loan[] = await response.json();
      setLoans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const returnBook = async (loanId: number) => {
    try {
      const res = await fetch(
        `${LENDING_API_BASE_URL}/api/loans/${loanId}/return`,
        { method: 'POST', headers: { Role: role } }
      );
      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        alert(`Return failed: ${res.status} ${msg}`);
        return;
      }
      fetchLoans();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h2 className="mb-4">📖 Loans</h2>

      {role === 'member' && memberId && (
        <div className="alert alert-info py-2">
          Showing loans for member #{memberId}.
        </div>
      )}

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
            {loading && (
              <tr>
                <td colSpan={6} className="text-center">
                  Loading…
                </td>
              </tr>
            )}

            {!loading &&
              loans.map((loan) => (
                <tr key={loan.id}>
                  <td>{loan.book?.title ?? "(Unknown book)"}</td>

                 <td>{loan.member ? `${loan.member.firstName} ${loan.member.lastName}` : "(Unknown member)"}</td>

                  <td>{new Date(loan.borrowedAt).toLocaleString()}</td>
                  <td>{new Date(loan.dueDate).toLocaleString()}</td>
                  <td>
                    {loan.returned ? (
                      <span className="badge bg-success">Returned</span>
                    ) : (
                      <span className="badge bg-warning text-dark">
                        Borrowed
                      </span>
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

            {!loading && loans.length === 0 && (
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
