import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/api';

const Books = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
      return;
    }
    loadBooks();
  }, [isAdmin, navigate, currentPage, searchTerm]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await adminService.getBooks(currentPage, 10, searchTerm);
      setBooks(response.data.items);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (book) => {
    setSelectedBook(book);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminService.deleteBook(selectedBook.id);
      setShowDeleteModal(false);
      setSelectedBook(null);
      loadBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete book');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadBooks();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Books</h1>
        <button
          onClick={() => navigate('/admin/books/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Book
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search books..."
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
          >
            Search
          </button>
        </div>
      </form>

      {/* Books Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {books.map(book => (
                <tr key={book.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={book.imageUrl || '/placeholder-book.jpg'}
                        alt={book.title}
                        className="w-10 h-14 object-cover rounded mr-3"
                      />
                      <div>
                        <p className="font-medium">{book.title}</p>
                        <p className="text-sm text-gray-500">{book.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {book.isOnSale ? (
                      <div>
                        <span className="text-red-500 font-medium">
                          ${(book.price * (1 - book.discountPercentage / 100)).toFixed(2)}
                        </span>
                        <span className="text-gray-500 line-through ml-2">
                          ${book.price.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-medium">${book.price.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        book.stock <= book.minStock
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {book.stock} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        book.isOnSale
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {book.isOnSale ? 'On Sale' : 'Regular'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => navigate(`/admin/books/${book.id}`)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(book)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-6">
              Are you sure you want to delete "{selectedBook.title}"? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books; 