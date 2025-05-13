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
      
      // Make the API call with proper error handling
      const response = await api.get(`/Books`, {
        params: {
          page: currentPage,
          pageSize: pageSize
        }
      });
      
      console.log("Books response:", response.data);
      
      if (response.data) {
        setBooks(response.data.items || response.data);
        // If pagination info is available in the response
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

  // Fetch books when component mounts or pagination changes
  useEffect(() => {
    // Only fetch books if user is logged in and is an admin
    if (user && user.roles && user.roles.includes('Admin')) {
      fetchBooks();
    } else {
      setError("You must be logged in as an admin to view this page");
      setLoading(false);
    }
  }, [currentPage, pageSize, user]);

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