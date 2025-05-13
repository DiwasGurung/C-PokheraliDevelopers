import React, { useState, useEffect } from "react";
import { Edit, Trash2, AlertCircle, Search, Tag, Calendar, X, CheckCircle } from "lucide-react";
import axios from "axios";

export default function AdminDiscounts() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [notification, setNotification] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    discountPercentage: 0,
    startDate: "",
    endDate: "",
    isOnSale: true
  });
  
  // Fetch books on component mount
  useEffect(() => {
    fetchBooks();
  }, []);
  
  // Filter books based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBooks(books);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = books.filter(book => 
        book.title?.toLowerCase().includes(term) || 
        book.author?.toLowerCase().includes(term) ||
        book.isbn?.toLowerCase().includes(term)
      );
      setFilteredBooks(filtered);
    }
  }, [searchTerm, books]);
  
  // Show notification popup
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };
  
  const fetchBooks = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get('https://localhost:7126/api/Books', {
        params: {
          page: 1,
          pageSize: 100 // Get more books at once for admin discount management
        },
        withCredentials: true
      });
      
      if (response.data && response.data.books) {
        setBooks(response.data.books);
        setFilteredBooks(response.data.books);
      } else {
        console.error('Unexpected API response format:', response.data);
        showNotification('Failed to fetch books', 'error');
      }
    } catch (err) {
      console.error('Error fetching books:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedBook) return;
    
    setSubmitLoading(true);
    
    try {
      // Create a proper payload for the API - using a simpler structure
      // Note: Converting to ISO string but removing the time part
      const payload = {
        // Include the id in the payload
        id: selectedBook.id,
        // Only include discount-related fields
        isOnSale: formData.isOnSale,
        discountPercentage: parseFloat(formData.discountPercentage) || 0,
        discountStartDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        discountEndDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
      };
      
      // Debug logging
      console.log('Sending update with payload:', payload);
      
      // Use the dedicated discount endpoint
      await axios.post(
        `https://localhost:7126/api/Books/${selectedBook.id}/discount`, 
        {
          isOnSale: formData.isOnSale,
          discountPercentage: parseFloat(formData.discountPercentage) || 0,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );
      
      // Refresh book list
      await fetchBooks();
      
      // Show success notification
      showNotification(`Discount for "${selectedBook.title}" was updated successfully`);
      
      // Close modal
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error setting discount:', err);
      
      // Provide more detailed error information
      let errorMessage = 'Failed to update discount';
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.title) {
          errorMessage = err.response.data.title;
        } else if (err.response.data.errors) {
          // Handle validation errors
          const errors = err.response.data.errors;
          const firstError = Object.values(errors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : JSON.stringify(firstError);
        }
      }
      
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setSubmitLoading(false);
    }
  };
  
  const handleSetDiscount = (book) => {
    setSelectedBook(book);
    
    // Initialize form with book's existing discount data if available
    const initFormData = {
      discountPercentage: book.discountPercentage || 10,
      startDate: book.discountStartDate 
        ? new Date(book.discountStartDate).toISOString().split('T')[0] 
        : getTodayDate(),
      endDate: book.discountEndDate 
        ? new Date(book.discountEndDate).toISOString().split('T')[0] 
        : getFutureDate(7),
      isOnSale: book.isOnSale === undefined ? true : book.isOnSale
    };
    
    setFormData(initFormData);
    setIsModalOpen(true);
  };
  
  const handleRemoveDiscount = async (book) => {
    if (!window.confirm(`Are you sure you want to remove the discount from "${book.title}"?`)) {
      return;
    }
    
    try {
      // Use the dedicated endpoint for removing discounts
      await axios.delete(`https://localhost:7126/api/Books/${book.id}/discount`, {
        withCredentials: true
      });
      
      // Refresh book list
      await fetchBooks();
      
      // Show success notification
      showNotification(`Discount for "${book.title}" was removed successfully`);
    } catch (err) {
      console.error('Error removing discount:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to remove discount';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };
  
  // Helper functions for dates
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  const getFutureDate = (days) => {
    const future = new Date();
    future.setDate(future.getDate() + days);
    return future.toISOString().split('T')[0];
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Check if a discount is active (current date is between start and end dates)
  const isDiscountActive = (book) => {
    if (!book.isOnSale || !book.discountStartDate) {
      return false;
    }
    
    const now = new Date();
    const startDate = new Date(book.discountStartDate);
    const endDate = book.discountEndDate ? new Date(book.discountEndDate) : null;
    
    return now >= startDate && (!endDate || now <= endDate);
  };
  
  // Calculate sale price
  const calculateSalePrice = (book) => {
    if (!book.isOnSale || !book.discountPercentage) {
      return book.price;
    }
    
    return (book.price * (1 - book.discountPercentage / 100)).toFixed(2);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-fade-in-down ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <p>{notification.message}</p>
          <button 
            onClick={() => setNotification(null)}
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold">Manage Discounts</h2>
        
        {/* Search */}
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-start">
          <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {filteredBooks.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-500">No books found matching your search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-9 bg-gray-200 rounded overflow-hidden mr-3 flex-shrink-0">
                        {book.imageUrl && (
                          <img 
                            src={book.imageUrl.startsWith('http') ? book.imageUrl : `https://localhost:7126${book.imageUrl}`} 
                            alt={book.title || "Book cover"} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/placeholder-book.jpg"; // Fallback image
                            }}
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{book.title}</div>
                        <div className="text-sm text-gray-500">{book.author}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {book.isOnSale && isDiscountActive(book) ? (
                      <div>
                        <span className="font-medium text-green-600">${calculateSalePrice(book)}</span>
                        <span className="ml-2 text-sm line-through text-gray-500">${book.price?.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="font-medium">${book.price?.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {book.isOnSale && book.discountPercentage ? (
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        isDiscountActive(book) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {book.discountPercentage}% {isDiscountActive(book) ? 'Active' : 'Inactive'}
                      </span>
                    ) : (
                      <span className="text-gray-500">No discount</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {book.discountStartDate ? (
                      <span className="text-sm text-gray-500">
                        {formatDate(book.discountStartDate)} - {formatDate(book.discountEndDate)}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleSetDiscount(book)}
                      className="text-purple-600 hover:text-purple-900 mr-4"
                    >
                      {book.isOnSale ? 'Edit' : 'Add Discount'}
                    </button>
                    {book.isOnSale && (
                      <button
                        onClick={() => handleRemoveDiscount(book)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modal for adding/editing discounts */}
      {isModalOpen && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedBook.isOnSale ? 'Edit Discount' : 'Add Discount'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="font-medium text-gray-900 mb-4">{selectedBook.title}</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Percentage <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="discountPercentage"
                      name="discountPercentage"
                      min="1"
                      max="90"
                      value={formData.discountPercentage}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      min={formData.startDate || getTodayDate()}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isOnSale"
                      checked={formData.isOnSale}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-gray-700">Mark as "On Sale"</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    This will show a "On Sale" badge on the book.
                  </p>
                </div>
                
                {/* Preview */}
                <div className="border rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Price Preview:</p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-600 text-xl">
                      ${(selectedBook.price * (1 - formData.discountPercentage / 100)).toFixed(2)}
                    </span>
                    <span className="line-through text-gray-500">${selectedBook.price?.toFixed(2)}</span>
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      {formData.discountPercentage}% OFF
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    {submitLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{selectedBook.isOnSale ? 'Update Discount' : 'Add Discount'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS for animation */}
      <style jsx>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}