import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, AlertCircle, Search, Tag, Calendar, X } from "lucide-react";

export default function AdminDiscounts() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  
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
        book.title.toLowerCase().includes(term) || 
        book.author.toLowerCase().includes(term) ||
        book.isbn?.toLowerCase().includes(term)
      );
      setFilteredBooks(filtered);
    }
  }, [searchTerm, books]);
  
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const user = localStorage.getItem('user');
      
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch('https://localhost:7126/api/Books',);
      
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      
      const data = await response.json();
      setBooks(data);
      setFilteredBooks(data);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedBook) return;
    
    try {
      const token = localStorage.getItem('user');
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      // Format dates for API
      const startDate = new Date(formData.startDate).toISOString();
      const endDate = new Date(formData.endDate).toISOString();
      
      // Prepare book data with discount info
      const bookData = {
        ...selectedBook,
        isOnSale: formData.isOnSale,
        discountPercentage: parseFloat(formData.discountPercentage),
        discountStartDate: startDate,
        discountEndDate: endDate,
        originalPrice: selectedBook.price // Store original price
      };
      
      // Update the book
      const response = await fetch(`https://localhost:7126/api/Books/${selectedBook.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update book with discount');
      }
      
      // Refresh book list
      fetchBooks();
      
      // Close modal
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error setting discount:', err);
      setError(err.message);
    }
  };
  
  const handleSetDiscount = (book) => {
    setSelectedBook(book);
    
    // Initialize form with book's existing discount data if available
    const initFormData = {
      discountPercentage: book.discountPercentage || 10,
      startDate: book.discountStartDate ? new Date(book.discountStartDate).toISOString().split('T')[0] : getTodayDate(),
      endDate: book.discountEndDate ? new Date(book.discountEndDate).toISOString().split('T')[0] : getFutureDate(7),
      isOnSale: book.isOnSale || true
    };
    
    setFormData(initFormData);
    setIsModalOpen(true);
  };
  
  const handleRemoveDiscount = async (bookId) => {
    if (!window.confirm('Are you sure you want to remove this discount?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      // First, get the book data
      const bookResponse = await fetch(`https://localhost:7126/api/Books/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!bookResponse.ok) {
        throw new Error('Failed to fetch book data');
      }
      
      const bookData = await bookResponse.json();
      
      // Update the book to remove discount
      const updatedBook = {
        ...bookData,
        isOnSale: false,
        discountPercentage: null,
        discountStartDate: null,
        discountEndDate: null
      };
      
      const response = await fetch(`https://localhost:7126/api/Books/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedBook)
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove discount');
      }
      
      // Refresh book list
      fetchBooks();
    } catch (err) {
      console.error('Error removing discount:', err);
      setError(err.message);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Check if a discount is active (current date is between start and end dates)
  const isDiscountActive = (book) => {
    if (!book.isOnSale || !book.discountStartDate || !book.discountEndDate) {
      return false;
    }
    
    const now = new Date();
    const startDate = new Date(book.discountStartDate);
    const endDate = new Date(book.discountEndDate);
    
    return now >= startDate && now <= endDate;
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
    <div>
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
        </div>
      )}
      
      {filteredBooks.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-500">No books found matching your search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-9 bg-gray-200 rounded overflow-hidden mr-3 flex-shrink-0">
                        {book.imageUrl && (
                          <img 
                            src={book.imageUrl} 
                            alt={book.title} 
                            className="h-full w-full object-cover"
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
                        <span className="ml-2 text-sm line-through text-gray-500">${book.price.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="font-medium">${book.price.toFixed(2)}</span>
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
                    {book.discountStartDate && book.discountEndDate ? (
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
                        onClick={() => handleRemoveDiscount(book.id)}
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
                      min={getTodayDate()}
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
                    <span className="line-through text-gray-500">${selectedBook.price.toFixed(2)}</span>
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
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {selectedBook.isOnSale ? 'Update Discount' : 'Add Discount'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}