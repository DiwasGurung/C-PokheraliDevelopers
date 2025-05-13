import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Bookmarks = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadBookmarks();
  }, [isAuthenticated, navigate]);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getBookmarks();
      setBookmarks(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (bookId) => {
    try {
      await bookService.removeBookmark(bookId);
      setBookmarks(bookmarks.filter(book => book.id !== bookId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove bookmark');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No Bookmarks Yet</h2>
        <p className="text-gray-600 mb-8">
          Save your favorite books to access them later
        </p>
        <button
          onClick={() => navigate('/books')}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Browse Books
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookmarks</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {bookmarks.map(book => (
          <div
            key={book.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <img
              src={book.imageUrl || '/placeholder-book.jpg'}
              alt={book.title}
              className="w-full h-48 object-cover cursor-pointer"
              onClick={() => navigate(`/books/${book.id}`)}
            />
            <div className="p-4">
              <h3
                className="font-semibold text-lg mb-2 cursor-pointer hover:text-blue-600"
                onClick={() => navigate(`/books/${book.id}`)}
              >
                {book.title}
              </h3>
              <p className="text-gray-600 mb-2">{book.author}</p>
              <div className="flex justify-between items-center">
                <div>
                  {book.isOnSale && book.discountPercentage ? (
                    <div className="flex items-center gap-2">
                      <span className="text-red-500 font-bold">
                        ${(book.price * (1 - book.discountPercentage / 100)).toFixed(2)}
                      </span>
                      <span className="text-gray-500 line-through">
                        ${book.price.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="font-bold">${book.price.toFixed(2)}</span>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveBookmark(book.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bookmarks; 