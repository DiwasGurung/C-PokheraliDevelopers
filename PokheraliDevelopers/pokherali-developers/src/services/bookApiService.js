// API service for books
const API_URL = 'https://localhost:5080/api'; // Update with your API URL

// Helper function for handling API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Something went wrong');
  }
  return response.json();
};

// Book API service
const bookApiService = {
  // Get all books
  getAllBooks: async () => {
    const response = await fetch(`${API_URL}/books`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // Get a book by ID
  getBookById: async (id) => {
    const response = await fetch(`${API_URL}/books/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // Create a new book
  createBook: async (bookData) => {
    const response = await fetch(`${API_URL}/books`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookData),
    });
    return handleResponse(response);
  },

  // Update a book
  updateBook: async (id, bookData) => {
    const response = await fetch(`${API_URL}/books/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookData),
    });
    return handleResponse(response);
  },

  // Delete a book
  deleteBook: async (id) => {
    const response = await fetch(`${API_URL}/books/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Something went wrong');
    }
    
    return true;
  },

  // Upload book cover image
  uploadBookCover: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_URL}/uploads/book-cover`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    
    return handleResponse(response);
  },
};

export default bookApiService;