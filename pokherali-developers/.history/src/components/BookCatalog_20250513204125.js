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
  
  // Simplified filters - only the essential ones
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortDescending, setSortDescending] = useState(false);

  const navigate = useNavigate();
  const user = localStorage.getItem('user');
  const { addToCart } = useContext(CartContext);

  // Fetch books with simplified filters
  const fetchBooks = async () => {
    setLoading(true);
    try {
      // Simplified params object with only the essential filters
      const params = {
        pageNumber: page,
        pageSize: 10,
        searchTerm: searchTerm,
        genres: selectedGenre ? [selectedGenre] : [],
        sortBy: sortBy,
        sortDescending: sortDescending
      };
      
      const { data } = await axios.get('https://localhost:7126/api/Books', { params });
      
      setBooks(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching books:', error);
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

  // Fetch books when page or filters change
  useEffect(() => {
    fetchBooks();
  }, [page, searchTerm, selectedGenre, sortBy, sortDescending]);

  // Fetch bookmarks once on component mount
  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when search changes
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  // Handle sort direction change
  const handleSortDirectionChange = (e) => {
    setSortDescending(e.target.value === 'desc');
    setPage(1);
  };

  // Handle genre filter change
  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
    setPage(1);
  };

  // Clear all filters
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
      await addToCart(book.id, 1);
      alert(`${book.title} added to cart successfully!`);
    } catch (error) {
      console.error(`Error adding ${book.title} to cart:`, error);
      alert(`Failed to add ${book.title} to cart.`);
    } finally {
      setProcessingActions(prev => ({ ...prev, [`cart-${book.id}`]: false }));
    }
  };

  // View book details
  const handleViewDetails = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  // Check if a book is bookmarked
  const isBookmarked = (bookId) => {
    return bookmarks.some(b => b.id === bookId);
  };

  // Handle bookmarking
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
        await axios.delete(`https://localhost:7126/api/Bookmarks/${book.id}`, { withCredentials: true });
        setBookmarks(bookmarks.filter(b => b.id !== book.id));
        alert(`${book.title} removed from bookmarks!`);
      } else {
        await axios.post('https://localhost:7126/api/Bookmarks', book.id, {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        });
        setBookmarks([...bookmarks, book]);
        alert(`${book.title} added to your bookmarks!`);
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
        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search for books by title, author, or ISBN..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Genre and Sort Options */}
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
              <option value="Romance">Romance</option>
              <option value="Biography">Biography</option>
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
              <option value="publicationdate">Publication Date</option>
              <option value="popularity">Popularity</option>
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
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Book Grid */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-2">Loading books...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {books && books.length > 0 ? (
            books.map((book) => (
              <div key={book.id} className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                <div className="relative pb-[60%] overflow-hidden mb-4">
                  <img 
                    src={book.imageUrl ? `https://localhost:7126${book.imageUrl}` : "/placeholder-book.jpg"} 
                    alt={book.title} 
                    className="absolute inset-0 w-full h-full object-cover rounded-md"
                  />
                </div>
                <h3 className="text-xl font-medium truncate">{book.title}</h3>
                <p className="text-gray-600">{book.author}</p>
                <p className="text-lg font-bold text-blue-700 mt-2">${book.price.toFixed(2)}</p>
                <div className="flex flex-col mt-4 space-y-2">
                  <button
                    onClick={() => handleViewDetails(book.id)}
                    className="text-blue-600 hover:text-blue-800 text-center py-2 border border-blue-600 rounded-lg transition-colors hover:bg-blue-50"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleAddToCart(book)}
                    disabled={processingActions[`cart-${book.id}`] || book.stockQuantity <= 0}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingActions[`cart-${book.id}`] ? "Adding..." : book.stockQuantity <= 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                  <button
                    onClick={() => handleBookmark(book)}
                    disabled={processingActions[`bookmark-${book.id}`]}
                    className={`${
                      isBookmarked(book.id) 
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    } px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {processingActions[`bookmark-${book.id}`] 
                      ? "Processing..." 
                      : isBookmarked(book.id) 
                        ? "Bookmarked" 
                        : "Bookmark"}
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
            className="bg-gray-200 px-4 py-2 rounded mx-2 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="bg-gray-200 px-4 py-2 rounded mx-2 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BookCatalog;