import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';

const AdminDashboard = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  // Filter state
  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 10,
    searchTerm: "",
    genres: [],
    authors: [],
    formats: [],
    languages: [],
    publishers: [],
    minPrice: null,
    maxPrice: null,
    inStock: null,
    onSale: null,
    newRelease: null,
    newArrival: null,
    comingSoon: null,
    awardWinner: null,
    minRating: null,
    sortBy: "title",
    sortDescending: false
  });
  
  // Get the user context for authentication
  const { user } = useContext(UserContext);

  // Create an axios instance with auth header
  const api = axios.create({
    baseURL: 'https://localhost:7126/api',
    withCredentials: true // This is important for sending cookies
  });

  // Add auth token to requests if available
  api.interceptors.request.use(config => {
    // If you're using JWT, you'd add the token here
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  });

  const fetchBooks = async () => {
    try {
      setLoading(true);
      
      // Log the user information for debugging
      console.log("Current user:", user);
      
      // Prepare parameters to match the BookFilterDto in the backend
      const params = {
        pageNumber: currentPage,
        pageSize: pageSize,
        searchTerm: filters.searchTerm || "",
        // Convert array-type filters to comma-separated strings if they exist
        genres: filters.genres && filters.genres.length > 0 ? filters.genres.join(',') : "",
        authors: filters.authors && filters.authors.length > 0 ? filters.authors.join(',') : "",
        formats: filters.formats && filters.formats.length > 0 ? filters.formats.join(',') : "",
        languages: filters.languages && filters.languages.length > 0 ? filters.languages.join(',') : "",
        publishers: filters.publishers && filters.publishers.length > 0 ? filters.publishers.join(',') : ""
      };
      
      // Add optional numeric filters only if they have values
      if (filters.minPrice !== null) params.minPrice = filters.minPrice;
      if (filters.maxPrice !== null) params.maxPrice = filters.maxPrice;
      if (filters.inStock !== null) params.inStock = filters.inStock;
      if (filters.onSale !== null) params.onSale = filters.onSale;
      if (filters.newRelease !== null) params.newRelease = filters.newRelease;
      if (filters.newArrival !== null) params.newArrival = filters.newArrival;
      if (filters.comingSoon !== null) params.comingSoon = filters.comingSoon;
      if (filters.awardWinner !== null) params.awardWinner = filters.awardWinner;
      if (filters.minRating !== null) params.minRating = filters.minRating;
      
      // Sorting parameters
      params.sortBy = filters.sortBy;
      params.sortDescending = filters.sortDescending;
      
      console.log("Sending request with params:", params);
      
      // Make the API call with proper params
      const response = await api.get(`/Books`, { params });
      
      console.log("Books response:", response.data);
      
      if (response.data) {
        setBooks(response.data.items || []);
        // Get pagination info
        if (response.data.totalPages) {
          setTotalPages(response.data.totalPages);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching books:", err);
      
      // Enhanced error logging to help diagnose the issue
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", err.response.data);
        console.error("Error response status:", err.response.status);
        console.error("Error response headers:", err.response.headers);
        
        setError(`Server error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error("Error request:", err.request);
        setError("No response received from server. Check if the API is running.");
      } else {
        // Something happened in setting up the request
        console.error("Error message:", err.message);
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes for text/number inputs
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle filter changes for checkboxes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle filter changes for multi-select (array values)
  const handleArrayFilterChange = (name, value) => {
    // Split comma-separated values into array and trim whitespace
    const valuesArray = value.split(',').map(v => v.trim()).filter(v => v !== '');
    
    setFilters(prev => ({
      ...prev,
      [name]: valuesArray
    }));
  };

  // Apply filters
  const applyFilters = (e) => {
    if (e) e.preventDefault();
    setCurrentPage(1); // Reset to first page when filters change
    fetchBooks();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      pageNumber: 1,
      pageSize: 10,
      searchTerm: "",
      genres: [],
      authors: [],
      formats: [],
      languages: [],
      publishers: [],
      minPrice: null,
      maxPrice: null,
      inStock: null,
      onSale: null,
      newRelease: null,
      newArrival: null,
      comingSoon: null,
      awardWinner: null,
      minRating: null,
      sortBy: "title",
      sortDescending: false
    });
    setCurrentPage(1);
    // Will trigger fetchBooks due to dependency array in useEffect
  };

  // Fetch books when component mounts or when user changes
  useEffect(() => {
    // Only fetch books if user is logged in and is an admin
    if (user && user.roles && user.roles.includes('Admin')) {
      fetchBooks();
    } else {
      setError("You must be logged in as an admin to view this page");
      setLoading(false);
    }
  }, [user]);
  
  // Update page when pagination changes
  useEffect(() => {
    if (user && user.roles && user.roles.includes('Admin')) {
      setFilters(prev => ({
        ...prev,
        pageNumber: currentPage
      }));
      fetchBooks();
    }
  }, [currentPage, pageSize]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      await api.delete(`/Books/${bookId}`);
      // Refresh the books list after deletion
      fetchBooks();
    } catch (err) {
      console.error("Error deleting book:", err);
      setError("Failed to delete book. Please try again.");
    }
  };

  if (!user || !user.roles || !user.roles.includes('Admin')) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Book Management</h2>
          
          {/* Search and Filters */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-medium mb-3">Filter Books</h3>
            <form onSubmit={applyFilters}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    name="searchTerm"
                    value={filters.searchTerm}
                    onChange={handleFilterChange}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search by title, author, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Genres (comma separated)
                  </label>
                  <input
                    type="text"
                    name="genres"
                    value={filters.genres.join(', ')}
                    onChange={(e) => handleArrayFilterChange('genres', e.target.value)}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Fiction, Non-fiction, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Authors (comma separated)
                  </label>
                  <input
                    type="text"
                    name="authors"
                    value={filters.authors.join(', ')}
                    onChange={(e) => handleArrayFilterChange('authors', e.target.value)}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Author names"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formats (comma separated)
                  </label>
                  <input
                    type="text"
                    name="formats"
                    value={filters.formats.join(', ')}
                    onChange={(e) => handleArrayFilterChange('formats', e.target.value)}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Hardcover, Paperback, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Languages (comma separated)
                  </label>
                  <input
                    type="text"
                    name="languages"
                    value={filters.languages.join(', ')}
                    onChange={(e) => handleArrayFilterChange('languages', e.target.value)}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="English, Spanish, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publishers (comma separated)
                  </label>
                  <input
                    type="text"
                    name="publishers"
                    value={filters.publishers.join(', ')}
                    onChange={(e) => handleArrayFilterChange('publishers', e.target.value)}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Publisher names"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="minPrice"
                    value={filters.minPrice || ""}
                    onChange={handleFilterChange}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="maxPrice"
                    value={filters.maxPrice || ""}
                    onChange={handleFilterChange}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="title">Title</option>
                    <option value="author">Author</option>
                    <option value="price">Price</option>
                    <option value="publicationdate">Publication Date</option>
                    <option value="popularity">Popularity</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Order
                  </label>
                  <div className="flex items-center mt-2">
                    <input
                      id="sortAsc"
                      type="radio"
                      name="sortDescending"
                      checked={!filters.sortDescending}
                      onChange={() => setFilters(prev => ({ ...prev, sortDescending: false }))}
                      className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300"
                    />
                    <label htmlFor="sortAsc" className="ml-2 block text-sm text-gray-700">
                      Ascending
                    </label>
                  </div>
                  <div className="flex items-center mt-1">
                    <input
                      id="sortDesc"
                      type="radio"
                      name="sortDescending"
                      checked={filters.sortDescending}
                      onChange={() => setFilters(prev => ({ ...prev, sortDescending: true }))}
                      className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300"
                    />
                    <label htmlFor="sortDesc" className="ml-2 block text-sm text-gray-700">
                      Descending
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center">
                  <input
                    id="inStock"
                    type="checkbox"
                    name="inStock"
                    checked={filters.inStock === true}
                    onChange={() => setFilters(prev => ({ ...prev, inStock: prev.inStock === true ? null : true }))}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                  <label htmlFor="inStock" className="ml-2 block text-sm text-gray-700">
                    In Stock
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="onSale"
                    type="checkbox"
                    name="onSale"
                    checked={filters.onSale === true}
                    onChange={() => setFilters(prev => ({ ...prev, onSale: prev.onSale === true ? null : true }))}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                  <label htmlFor="onSale" className="ml-2 block text-sm text-gray-700">
                    On Sale
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="newRelease"
                    type="checkbox"
                    name="newRelease"
                    checked={filters.newRelease === true}
                    onChange={() => setFilters(prev => ({ ...prev, newRelease: prev.newRelease === true ? null : true }))}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                  <label htmlFor="newRelease" className="ml-2 block text-sm text-gray-700">
                    New Release
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="newArrival"
                    type="checkbox"
                    name="newArrival"
                    checked={filters.newArrival === true}
                    onChange={() => setFilters(prev => ({ ...prev, newArrival: prev.newArrival === true ? null : true }))}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                  <label htmlFor="newArrival" className="ml-2 block text-sm text-gray-700">
                    New Arrival
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="comingSoon"
                    type="checkbox"
                    name="comingSoon"
                    checked={filters.comingSoon === true}
                    onChange={() => setFilters(prev => ({ ...prev, comingSoon: prev.comingSoon === true ? null : true }))}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                  <label htmlFor="comingSoon" className="ml-2 block text-sm text-gray-700">
                    Coming Soon
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="awardWinner"
                    type="checkbox"
                    name="awardWinner"
                    checked={filters.awardWinner === true}
                    onChange={() => setFilters(prev => ({ ...prev, awardWinner: prev.awardWinner === true ? null : true }))}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                  <label htmlFor="awardWinner" className="ml-2 block text-sm text-gray-700">
                    Award Winner
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Rating
                  </label>
                  <select
                    name="minRating"
                    value={filters.minRating || ""}
                    onChange={handleFilterChange}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Any Rating</option>
                    <option value="1">1+ Star</option>
                    <option value="2">2+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                >
                  Reset Filters
                </button>
              </div>
            </form>
          </div>
          
          <div className="flex justify-between mb-4">
            <h3 className="text-lg">Book List</h3>
            <a 
              href="/admin/books/new" 
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Add New Book
            </a>
          </div>
          
          {loading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 border-b text-left">ID</th>
                      <th className="py-2 px-4 border-b text-left">Title</th>
                      <th className="py-2 px-4 border-b text-left">Author</th>
                      <th className="py-2 px-4 border-b text-left">Price</th>
                      <th className="py-2 px-4 border-b text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.length > 0 ? (
                      books.map((book) => (
                        <tr key={book.id} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">{book.id}</td>
                          <td className="py-2 px-4 border-b">{book.title}</td>
                          <td className="py-2 px-4 border-b">{book.author}</td>
                          <td className="py-2 px-4 border-b">${book.price.toFixed(2)}</td>
                          <td className="py-2 px-4 border-b">
                            <div className="flex space-x-2">
                              <a 
                                href={`/admin/books/edit/${book.id}`}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                              >
                                Edit
                              </a>
                              <button
                                onClick={() => handleDeleteBook(book.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-4 text-center text-gray-500">
                          No books found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <nav className="flex items-center">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`mx-1 px-3 py-1 rounded ${
                        currentPage === 1
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Previous
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`mx-1 px-3 py-1 rounded ${
                          currentPage === index + 1
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`mx-1 px-3 py-1 rounded ${
                        currentPage === totalPages
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;