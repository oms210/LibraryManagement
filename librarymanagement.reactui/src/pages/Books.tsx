// src/pages/Books.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { LENDING_API_BASE_URL } from '../services/apis';

interface Book {
  id: number;
  isbn: string;
  title: string;
  coverUrl: string;
  status: number; // 0=Available, 1=Borrowed
}

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newIsbn, setNewIsbn] = useState('');
  const { role, memberId } = useAuth(); 

  useEffect(() => {
    fetchBooks();
  }, [role]);

  const fetchBooks = async () => {
    const response = await fetch(`${LENDING_API_BASE_URL}/api/books`, {
      headers: { Role: role }
    });
    const data = await response.json();
    setBooks(data);
  };

  const addBook = async () => {
    const response = await fetch(`${LENDING_API_BASE_URL}/api/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Role: role },
      body: JSON.stringify({
        isbn: newIsbn,
        title: newTitle,
        coverUrl: '',
        status: 0,
      }),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      alert(`Create failed: ${response.status} ${text}`);
      return;
    }
    setNewTitle('');
    setNewIsbn('');
    fetchBooks();
  };

  const deleteBook = async (id: number) => {
    await fetch(`${LENDING_API_BASE_URL}/api/books/${id}`, {
      method: 'DELETE',
      headers: { Role: role }
    });
    fetchBooks();
  };
const updateBook = async (updatedBook: Book) => {
  const response = await fetch(`${LENDING_API_BASE_URL}/api/books/${updatedBook.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Role: role
    },
    body: JSON.stringify(updatedBook)
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    alert(`Update failed: ${response.status} ${text}`);
    return;
  }
  fetchBooks();
};
  const borrowBook = async (bookId: number) => {
    if (!memberId) {
      alert('Please choose a member to impersonate in the navbar.');
      return;
    }
    const response = await fetch(
      `${LENDING_API_BASE_URL}/api/loans/${memberId}/borrow/${bookId}`,
      { method: 'POST', headers: { Role: role } }
    );
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      alert(`Borrow failed: ${response.status} ${text}`);
    }
    fetchBooks();
  };

  return (
    <>
      <h2 className="mb-3">📚 Books</h2>

      {role === 'manager' && (
        <div className="mb-4 row g-2 align-items-center">
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="ISBN"
              value={newIsbn}
              onChange={(e) => setNewIsbn(e.target.value)}
            />
          </div>
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <div className="col-auto">
            <button className="btn btn-primary" onClick={addBook}>
              ➕ Add Book
            </button>
          </div>
        </div>
      )}

      <ul className="list-group">
        {books.map((book) => (
          <li
            key={book.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              {book.coverUrl && (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  width={50}
                  className="me-3"
                />
              )}
              <strong>{book.title}</strong> — {book.status === 0 ? 'Available' : 'Borrowed'}
            </div>

            <div>
              {role === 'manager' && (
                <button
                  className="btn btn-sm btn-danger me-2"
                  onClick={() => deleteBook(book.id)}
                >
                  🗑️ Delete
                </button>
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
          </li>
        ))}
      </ul>
    </>
  );
}
