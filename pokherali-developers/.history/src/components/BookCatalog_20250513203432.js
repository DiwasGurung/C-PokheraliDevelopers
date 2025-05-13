import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../contexts/CartContext';
import Filters from './Filter'; // Import Filters component

const BookCatalog = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bookmarks, setBookmarks] = useState([]);
  const [processingActions, setProcessingActions] = useState({});
  const [filters, setFilters] = useState({
    searchTerm: "",
    authors: [],
    genres: [],
    languages: [],
    publishers: [],
    minPrice: null,
    maxPrice: null,
    minRating: null,
    inStock: null,
    onSale: null,
    newRelease: null,
    newArrival: null,
    comingSoon: null,
    awardWinner: null,
    sortBy: "title",
    sortDescending: false
  }); 

  const navigate = useNavigate();
  
  const user = localStorage.getItem('user');
  const { addToCart } = useContext(CartContext);

  // For BookCatalog.js
const fetchBooks = async () => {
  setLoading(true);
  try {
    // Create all the required params based on the BookFilterDto
    const params = {
      pageNumber: page,
      pageSize: 10,
      searchTerm: filters.searchTerm || "",
      authors: filters.authors || [],
      genres: filters.genres || [],
      languages: filters.languages || [],
      formats: filters.formats || [],
      publishers: filters.publishers || [],
      sortBy: filters.sortBy || "title",
      sortDescending: filters.sortDescending === true
    };
    
    // Only add optional parameters if they have values
    if (filters.minPrice !== null && filters.minPrice !== undefined) 
      params.minPrice = filters.minPrice;
    if (filters.maxPrice !== null && filters.maxPrice !== undefined) 
      params.maxPrice = filters.maxPrice;
    if (filters.minRating !== null && filters.minRating !== undefined) 
      params.minRating = filters.minRating;
    if (filters.inStock !== null && filters.inStock !== undefined) 
      params.inStock = filters.inStock;
    if (filters.onSale !== null && filters.onSale !== undefined) 
      params.onSale = filters.onSale;
    if (filters.newRelease !== null && filters.newRelease !== undefined) 
      params.newRelease = filters.newRelease;
    if (filters.newArrival !== null && filters.newArrival !== undefined) 
      params.newArrival = filters.newArrival;
    if (filters.comingSoon !== null && filters.comingSoon !== undefined) 
      params.comingSoon = filters.comingSoon;
    if (filters.awardWinner !== null && filters.awardWinner !== undefined) 
      params.awardWinner = filters.awardWinner;
    
    console.log("Sending params:", params);
    
    const { data } = await axios.get('https://localhost:7126/api/Books', { 
      params,
      paramsSerializer: params => {
        const searchParams = new URLSearchParams();
        
        // Handle each parameter appropriately
        for (const key in params) {
          if (Array.isArray(params[key])) {
            // Handle arrays by adding multiple entries with the same key
            if (params[key].length > 0) {
              params[key].forEach(value => {
                searchParams.append(key, value);
              });
            } else {
              // Add empty array as empty string to satisfy validation
              searchParams.append(key, "");
            }
          } else {
            // Handle regular params
            searchParams.append(key, params[key]);
          }
        }
        
        return searchParams.toString();
      }
    });
    
    setBooks(data.items);
    setTotalPages(data.totalPages);
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
        setBookmarks(response.data);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
      }
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchBookmarks();
  }, [page, filters]); // Re-fetch when page or filters change

  // Handle filter change from Filters component
  const handleFilterChange = (newFilters) => {
    // Update filters
    setFilters({...filters, ...newFilters});
    setPage(1); // Reset to first page when filters change
  };

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

  const handleBookmark = async (book) => {
    if (!user) {
      alert("Please log in to bookmark books.");
      navigate('/login', { state: { redirectTo: '/' } });
      return;
    }

    const isBookmarked = bookmarks.some(b => b.id === book.id);
    setProcessingActions(prev => ({ ...prev, [`bookmark-${book.id}`]: true }));

    try {
      if (isBookmarked) {
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
      console.error(`Error ${isBookmarked ? 'removing' : 'adding'} bookmark:`, error);
      alert(`Failed to ${isBookmarked ? 'remove' : 'add'} bookmark.`);
    } finally {
      setProcessingActions(prev => ({ ...prev, [`bookmark-${book.id}`]: false }));
    }
  };

  const handleViewDetails = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  // Helper to check if a book is bookmarked
  const isBookmarked = (bookId) => {
    return bookmarks.some(b => b.id === bookId);
  };

  return (
    <div className="max-w-6xl mx-auto py-10">
      <h2 className="text-3xl font-semibold mb-6">Book Catalog</h2>

      {/* Pass the filter change handler to Filters component */}
      <Filters onChange={handleFilterChange} initialFilters={filters} />

      {loading ? (
        <div className="text-center">
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