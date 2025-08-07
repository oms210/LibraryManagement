import { useEffect, useState } from 'react';

interface Book {
  id: number;
  isbn: string;
  title: string;
  coverUrl: string;
  status: number; // 0: Available, 1: Borrowed
}

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newIsbn, setNewIsbn] = useState('');

  const API_BASE = 'http://localhost:5000';

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const res = await fetch(`${API_BASE}/api/books`);
    const data = await res.json();
    setBooks(data);
  };

  const addBook = async () => {
    await fetch(`${API_BASE}/api/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isbn: newIsbn,
        title: newTitle,
        coverUrl: '',
        status: 'Available',
      }),
    });
    setNewTitle('');
    setNewIsbn('');
    fetchBooks();
  };

  const deleteBook = async (id: number) => {
    await fetch(`${API_BASE}/api/books/${id}`, { method: 'DELETE' });
    fetchBooks();
  };

  const borrowBook = async (bookId: number) => {
    await fetch(`${API_BASE}/api/loans/1/borrow/${bookId}`, { method: 'POST' });
    fetchBooks();
  };

  return (
    <>
      <h2 className="mb-3">📚 Books</h2>

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
              <strong>{book.title}</strong> ({book.status})
            </div>
            <div>
              <button
                className="btn btn-sm btn-danger me-2"
                onClick={() => deleteBook(book.id)}
              >
                🗑️ Delete
              </button>
              {book.status === 0 && (
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => borrowBook(book.id)}
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
