import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../contexts/CartContext';

const BookCatalog = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bookmarks, setBookmarks] = useState([]);
  const [processingActions, setProcessingActions] = useState({});

  // Simple filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortDescending, setSortDescending] = useState(false);

  const navigate = useNavigate();
  const user = localStorage.getItem('user');
  const { addToCart } = useContext(CartContext);

  // Fetch books with parameters that match the backend's expectations
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://localhost:7126/api/Books', {
        params: {
          page: page,
          pageSize: 10,
          search: searchTerm || '',
          genre: selectedGenre || '',
          sort: sortBy || 'title'
          // Backend doesn't handle sortDescending directly - we can implement this if needed
        }
      });

      // Ensure we're parsing the response correctly
      if (response.data && response.data.books) {
        setBooks(response.data.books || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        console.error('Unexpected API response format:', response.data);
        setBooks([]);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookmarks when user is logged in
  const fetchBookmarks = async () => {
    if (user) {
      try {
        const response = await axios.get('https://localhost:7126/api/Bookmarks', {
          withCredentials: true
        });
        setBookmarks(response.data || []);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
      }
    }
  };

  // Fetch books when any filter changes
  useEffect(() => {
    fetchBooks();
  }, [page, searchTerm, selectedGenre, sortBy, sortDescending]);

  // Fetch bookmarks once on mount or when user changes
  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  // Simple handlers for filter changes
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const handleSortDirectionChange = (e) => {
    setSortDescending(e.target.value === 'desc');
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGenre('');
    setSortBy('title');
    setSortDescending(false);
    setPage(1);
  };

  // Add to cart functionality
  const handleAddToCart = async (book) => {
    if (!user) {
      alert("Please log in to add items to your cart.");
      navigate('/login', { state: { redirectTo: '/' } });
      return;
    }
    setProcessingActions(prev => ({ ...prev, [`cart-${book.id}`]: true }));
    try {
      await addToCart({ bookId: book.id, quantity: 1 });
      alert(`${book.title} added to cart successfully!`);
    } catch (error) {
      console.error(`Error adding ${book.title} to cart:`, error);
      alert(`Failed to add ${book.title} to cart.`);
    } finally {
      setProcessingActions(prev => ({ ...prev, [`cart-${book.id}`]: false }));
    }
  };

  const handleViewDetails = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  const isBookmarked = (bookId) => {
    return bookmarks.some(b => b.id === bookId);
  };

  const handleBookmark = async (book) => {
    if (!user) {
      alert("Please log in to bookmark books.");
      navigate('/login', { state: { redirectTo: '/' } });
      return;
    }

    const bookmarked = isBookmarked(book.id);
    setProcessingActions(prev => ({ ...prev, [`bookmark-${book.id}`]: true }));

    try {
      if (bookmarked) {
        await axios.delete(`https://localhost:7126/api/Bookmarks/${book.id}`, {
          withCredentials: true
        });
        setBookmarks(bookmarks.filter(b => b.id !== book.id));
      } else {
        await axios.post('https://localhost:7126/api/Bookmarks', book.id, {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        });
        setBookmarks([...bookmarks, book]);
      }
    } catch (error) {
      console.error(`Error ${bookmarked ? 'removing' : 'adding'} bookmark:`, error);
      alert(`Failed to ${bookmarked ? 'remove' : 'add'} bookmark.`);
    } finally {
      setProcessingActions(prev => ({ ...prev, [`bookmark-${book.id}`]: false }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10">
      <h2 className="text-3xl font-semibold mb-6">Book Catalog</h2>

      {/* Simple Filter UI */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search books by title, author, or ISBN..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Genre Filter */}
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
            <select
              value={selectedGenre}
              onChange={handleGenreChange}
              className="border rounded p-2 w-full md:w-auto"
            >
              <option value="">All Genres</option>
              <option value="Fiction">Fiction</option>
              <option value="Non-Fiction">Non-Fiction</option>
              <option value="Mystery">Mystery</option>
              <option value="Science Fiction">Science Fiction</option>
              <option value="Fantasy">Fantasy</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="border rounded p-2 w-full md:w-auto"
            >
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="price">Price</option>
            </select>
          </div>

          {/* Sort Direction */}
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              value={sortDescending ? 'desc' : 'asc'}
              onChange={handleSortDirectionChange}
              className="border rounded p-2 w-full md:w-auto"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="w-full md:w-auto flex items-end">
            <button
              onClick={clearFilters}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Books Display */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-2">Loading books...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {books.length > 0 ? (
            books.map((book) => (
              <div key={book.id} className="border rounded-lg p-4 shadow-md">
                <img
                  src={book.imageUrl ? `https://localhost:7126${book.imageUrl}` : "/placeholder-book.jpg"}
                  alt={book.title}
                  className="w-full h-48 object-cover rounded-md mb-3"
                />
                <h3 className="text-xl font-medium truncate">{book.title}</h3>
                <p className="text-gray-600">{book.author}</p>
                <p className="text-lg font-bold text-blue-700 mt-2">${book.price.toFixed(2)}</p>
                <div className="flex flex-col mt-4 space-y-2">
                  <button
                    onClick={() => handleViewDetails(book.id)}
                    className="text-blue-600 border border-blue-600 py-2 rounded-lg"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleAddToCart(book)}
                    disabled={processingActions[`cart-${book.id}`] || book.stockQuantity <= 0}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    {processingActions[`cart-${book.id}`] ? "Adding..." : "Add to Cart"}
                  </button>
                  <button
                    onClick={() => handleBookmark(book)}
                    disabled={processingActions[`bookmark-${book.id}`]}
                    className={`${
                      isBookmarked(book.id)
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    } px-4 py-2 rounded-lg`}
                  >
                    {isBookmarked(book.id) ? "Bookmarked" : "Bookmark"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-500">No books found matching your criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="bg-gray-200 px-4 py-2 rounded mx-2 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="bg-gray-200 px-4 py-2 rounded mx-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BookCatalog;
