import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../contexts/CartContext';
import { Heart, ShoppingCart, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

const BookCatalog = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bookmarks, setBookmarks] = useState([]);
  const [processingActions, setProcessingActions] = useState({});
  const [genres, setGenres] = useState([]);

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
          sort: sortBy || 'title',
          desc: sortDescending
        },
        withCredentials: true
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

  // Fetch available genres
  const fetchGenres = async () => {
    try {
      const response = await axios.get('https://localhost:7126/api/Books/genres');
      if (response.data) {
        setGenres(response.data);
      }
    } catch (error) {
      console.error('Error fetching genres:', error);
      // Default genres as fallback
      setGenres([
        'Fiction', 'Non-fiction', 'Science', 'Mystery', 
        'Fantasy', 'Biography', 'History', 'Self-Help', 
        'Business', 'Romance', 'Thriller'
      ]);
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

  // Fetch bookmarks and genres once on mount or when user changes
  useEffect(() => {
    fetchBookmarks();
    fetchGenres();
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
    return bookmarks.some(b => b.id === bookId || b.bookId === bookId);
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
        // Remove bookmark
        await axios.delete(`https://localhost:7126/api/Bookmarks/${book.id}`, {
          withCredentials: true
        });
        // Update local state
        setBookmarks(bookmarks.filter(b => b.id !== book.id && b.bookId !== book.id));
      } else {
        // Add bookmark - send bookId as a JSON payload
        await axios.post('https://localhost:7126/api/Bookmarks', book.id, {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        });
        // Update local state with minimal information needed
        setBookmarks([...bookmarks, { 
          id: book.id,
          bookId: book.id,
          title: book.title
        }]);
      }
    } catch (error) {
      console.error(`Error ${bookmarked ? 'removing' : 'adding'} bookmark:`, error);
      alert(`Failed to ${bookmarked ? 'remove' : 'add'} bookmark.`);
    } finally {
      setProcessingActions(prev => ({ ...prev, [`bookmark-${book.id}`]: false }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h2 className="text-3xl font-semibold mb-6">Book Catalog</h2>

      {/* Filter UI */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search books by title, author, or ISBN..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Genre Filter */}
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
            <select
              value={selectedGenre}
              onChange={handleGenreChange}
              className="border rounded p-2 w-full md:w-auto focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Genres</option>
              {genres.map((genre, index) => (
                <option key={index} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="border rounded p-2 w-full md:w-auto focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="border rounded p-2 w-full md:w-auto focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {/* Books Display */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-2">Loading books...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {books.length > 0 ? (
            books.map((book) => (
              <div key={book.id} className="border rounded-lg overflow-hidden shadow-md bg-white transition-transform hover:shadow-lg hover:-translate-y-1">
                <div className="relative h-48">
                  <img
                    src={book.imageUrl ? (book.imageUrl.startsWith('http') ? book.imageUrl : `https://localhost:7126${book.imageUrl}`) : "/placeholder-book.jpg"}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleBookmark(book)}
                    disabled={processingActions[`bookmark-${book.id}`]}
                    className={`absolute top-2 right-2 p-2 rounded-full shadow-md ${
                      isBookmarked(book.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-600'
                    }`}
                    title={isBookmarked(book.id) ? "Remove bookmark" : "Add bookmark"}
                  >
                    <Heart size={18} fill={isBookmarked(book.id) ? "currentColor" : "none"} />
                  </button>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold truncate">{book.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-lg font-bold text-blue-700">${book.price.toFixed(2)}</p>
                    {book.stockQuantity <= 0 && (
                      <span className="text-xs text-red-600 font-medium px-2 py-1 bg-red-100 rounded">Out of stock</span>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleViewDetails(book.id)}
                      className="flex items-center justify-center gap-1 text-blue-600 border border-blue-600 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <BookOpen size={16} />
                      <span>View Details</span>
                    </button>
                    
                    <button
                      onClick={() => handleAddToCart(book)}
                      disabled={processingActions[`cart-${book.id}`] || book.stockQuantity <= 0}
                      className="flex items-center justify-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {processingActions[`cart-${book.id}`] ? (
                        <span>Adding...</span>
                      ) : (
                        <>
                          <ShoppingCart size={16} />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
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
        <div className="flex justify-center items-center mt-8">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 bg-white border border-gray-300 px-4 py-2 rounded-lg mx-2 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>
          
          <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
            <span>Page {page} of {totalPages}</span>
          </div>
          
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 bg-white border border-gray-300 px-4 py-2 rounded-lg mx-2 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default BookCatalog;