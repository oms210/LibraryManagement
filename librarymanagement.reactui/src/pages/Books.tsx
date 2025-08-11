import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { LENDING_API_BASE_URL } from '../services/apis';

interface Book {
  id: number;
  isbn: string;
  title: string;
  coverUrl: string;
  status: number; // 0 = Available, 1 = Borrowed
}

export default function Books() {
  const { role, memberId } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newIsbn, setNewIsbn] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Partial<Book>>({});

  useEffect(() => {
    fetchBooks();
  }, [role]);

  const fetchBooks = async () => {
    const res = await fetch(`${LENDING_API_BASE_URL}/api/books`, { headers: { Role: role } });
    const data = await res.json();
    setBooks(data);
  };
  const addBook = async () => {
    const res = await fetch(`${LENDING_API_BASE_URL}/api/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Role: role },
      body: JSON.stringify({
        isbn: newIsbn.trim(),
        title: newTitle.trim(),
        coverUrl: '',
        status: 0
      })
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      alert(`Create failed: ${res.status} ${txt}`);
      return;
    }
    setNewTitle('');
    setNewIsbn('');
    fetchBooks();
  };
  const startEdit = (b: Book) => {
    setEditId(b.id);
    setDraft({ ...b });
  };

  const cancelEdit = () => {
    setEditId(null);
    setDraft({});
  };

  const saveEdit = async () => {
    if (!editId) return;
    const payload: Book = {
      id: editId,
      isbn: (draft.isbn ?? '').trim(),
      title: (draft.title ?? '').trim(),
      coverUrl: draft.coverUrl ?? '',
      status: typeof draft.status === 'number' ? draft.status : 0
    };

    const res = await fetch(`${LENDING_API_BASE_URL}/api/books/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Role: role },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      alert(`Update failed: ${res.status} ${txt}`);
      return;
    }
    cancelEdit();
    fetchBooks();
  };
  const deleteBook = async (id: number) => {
    if (!confirm('Delete this book?')) return;
    const res = await fetch(`${LENDING_API_BASE_URL}/api/books/${id}`, {
      method: 'DELETE',
      headers: { Role: role }
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      alert(`Delete failed: ${res.status} ${txt}`);
      return;
    }
    fetchBooks();
  };

  const borrowBook = async (bookId: number) => {
    if (!memberId) {
      alert('Please choose a member to impersonate in the navbar.');
      return;
    }
    const res = await fetch(`${LENDING_API_BASE_URL}/api/loans/${memberId}/borrow/${bookId}`, {
      method: 'POST',
      headers: { Role: role }
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      alert(`Borrow failed: ${res.status} ${txt}`);
    }
    fetchBooks();
  };

  return (
    <>
      <h2 className="mb-3">📚 Books</h2>
      {role === 'manager' && (
        <div className="mb-4 row g-2 align-items-center">
          <div className="col-12 col-md-3">
            <input
              className="form-control"
              placeholder="ISBN"
              value={newIsbn}
              onChange={(e) => setNewIsbn(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-5">
            <input
              className="form-control"
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <div className="col-auto">
            <button className="btn btn-primary" onClick={addBook} disabled={!newIsbn.trim() || !newTitle.trim()}>
              ➕ Add Book
            </button>
          </div>
        </div>
      )}

      <ul className="list-group">
        {books.map((book) => {
          const isEditing = editId === book.id;
          return (
            <li key={book.id} className="list-group-item">
              <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                <div className="d-flex align-items-center gap-3">
                  {book.coverUrl && (
                    <img src={book.coverUrl} alt={book.title} width={50} height={70} style={{ objectFit: 'cover' }} />
                  )}
                  {!isEditing ? (
                    <div>
                      <div className="fw-semibold">{book.title}</div>
                      <div className="text-muted small">ISBN: {book.isbn}</div>
                      <span className={`badge ${book.status === 0 ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {book.status === 0 ? 'Available' : 'Borrowed'}
                      </span>
                    </div>
                  ) : (
                    <div className="row g-2 align-items-center">
                      <div className="col-12 col-md-5">
                        <input
                          className="form-control form-control-sm"
                          value={draft.title ?? ''}
                          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                          placeholder="Title"
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <input
                          className="form-control form-control-sm"
                          value={draft.isbn ?? ''}
                          onChange={(e) => setDraft((d) => ({ ...d, isbn: e.target.value }))}
                          placeholder="ISBN"
                        />
                      </div>
                      <div className="col-12 col-md-3">
                        <input
                          className="form-control form-control-sm"
                          value={draft.coverUrl ?? ''}
                          onChange={(e) => setDraft((d) => ({ ...d, coverUrl: e.target.value }))}
                          placeholder="Cover URL (optional)"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="d-flex align-items-center gap-2 ms-auto">
                  {role === 'manager' && !isEditing && (
                    <>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => startEdit(book)}>
                        ✏️ Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteBook(book.id)}>
                        🗑️ Delete
                      </button>
                    </>
                  )}

                  {role === 'manager' && isEditing && (
                    <>
                      <button className="btn btn-sm btn-success" onClick={saveEdit}>
                        💾 Save
                      </button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={cancelEdit}>
                        ✖ Cancel
                      </button>
                    </>
                  )}

                  {role === 'member' && book.status === 0 && (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => borrowBook(book.id)}
                      disabled={!memberId}
                      title={!memberId ? 'Select a member in the navbar' : undefined}
                    >
                      📥 Borrow
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}

        {books.length === 0 && (
          <li className="list-group-item text-center text-muted">No books found.</li>
        )}
      </ul>
    </>
  );
}
