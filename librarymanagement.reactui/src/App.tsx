import { Routes, Route, Link } from 'react-router-dom';
import Books from './pages/Books';
import Members from './pages/Members';
import Loans from './pages/Loans';
import Notifications from './pages/Notifications';
import FinesPage from './pages/Fines';

export default function App() {
  return (
    <div className="bg-light min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
        <div className="container">
          <a className="navbar-brand" href="/">Library</a>
          <div className="navbar-nav">
            <Link className="nav-link" to="/books">Books</Link>
            <Link className="nav-link" to="/members">Members</Link>
            <Link className="nav-link" to="/loans">Loans</Link>
            <Link className="nav-link" to="/fines">Fines</Link>
            <Link className="nav-link" to="/notifications">Notifications</Link>
          </div>
        </div>
      </nav>

      <main className="d-flex justify-content-center">
        <div className="bg-white shadow-sm rounded p-4" style={{ width: "100%" }}>
          <Routes>
            <Route path="/books" element={<Books />} />
            <Route path="/members" element={<Members />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/fines" element={<FinesPage />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
