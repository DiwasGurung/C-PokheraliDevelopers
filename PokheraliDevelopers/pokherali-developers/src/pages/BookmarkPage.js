import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import { CartContext } from '../contexts/CartContext';
import { Bookmark, ShoppingCart, Trash2, X } from 'lucide-react';

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingActions, setProcessingActions] = useState({});
  
  const navigate = useNavigate();
  
  // Get user and cart context
  const user=localStorage.getItem('user');
  const { addToCart } = useContext(CartContext);
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login', { state: { redirectTo: '/bookmarks' } });
      return;
    }
    
    fetchBookmarks();
  }, [user, navigate]);
  
  const fetchBookmarks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('https://localhost:7126/api/Bookmarks',{withCredentials: true});
      setBookmarks(response.data);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError('Failed to load your bookmarks. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveBookmark = async (bookId) => {
    setProcessingActions(prev => ({ ...prev, [`remove-${bookId}`]: true }));
    
    try {
      await axios.delete(`https://localhost:7126/api/Bookmarks/${bookId}`,{withCredentials: true});
      // Update state by removing the bookmark
      setBookmarks(bookmarks.filter(book => book.id !== bookId));
    } catch (err) {
      console.error('Error removing bookmark:', err);
      setError('Failed to remove bookmark. Please try again.');
    } finally {
      setProcessingActions(prev => ({ ...prev, [`remove-${bookId}`]: false }));
    }
  };
  
  const handleAddToCart = async (book) => {
    setProcessingActions(prev => ({ ...prev, [`cart-${book.id}`]: true }));
    
    try {
      await addToCart({ bookId: book.id, quantity: 1 });
      alert(`${book.title} added to cart!`);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add book to cart. Please try again.');
    } finally {
      setProcessingActions(prev => ({ ...prev, [`cart-${book.id}`]: false }));
    }
  };
  
  const handleViewDetails = (bookId) => {
    navigate(`/book/${bookId}`);
  };
  
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">My Bookmarks</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          <span className="ml-3">Loading your bookmarks...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">My Bookmarks</h1>
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={fetchBookmarks}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (bookmarks.length === 0) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">My Bookmarks</h1>
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <Bookmark size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-medium text-gray-900 mb-2">No bookmarks yet</h2>
          <p className="text-gray-500 mb-6">You haven't saved any books to your bookmarks.</p>
          <button
            onClick={() => navigate('/browse')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Books
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">My Bookmarks</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookmarks.map(book => (
          <div key={book.id} className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-white">
            <div className="relative">
              <img 
                src={book.imageUrl ? `https://localhost:7126${book.imageUrl}` : "/placeholder-book.jpg"} 
                alt={book.title} 
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => handleRemoveBookmark(book.id)}
                disabled={processingActions[`remove-${book.id}`]}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 text-gray-600 hover:text-red-600 transition-colors"
                title="Remove from bookmarks"
              >
                {processingActions[`remove-${book.id}`] ? (
                  <div className="animate-spin h-6 w-6 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                ) : (
                  <X size={18} />
                )}
              </button>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-bold mb-1 line-clamp-1">{book.title}</h3>
              <p className="text-gray-600 mb-2">{book.author}</p>
              <p className="text-lg font-semibold text-blue-700 mb-4">${book.price.toFixed(2)}</p>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewDetails(book.id)}
                  className="flex-1 text-blue-600 border border-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleAddToCart(book)}
                  disabled={processingActions[`cart-${book.id}`] || book.stock <= 0}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingActions[`cart-${book.id}`] ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                  ) : (
                    <ShoppingCart size={16} className="mr-1" />
                  )}
                  {book.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookmarksPage;