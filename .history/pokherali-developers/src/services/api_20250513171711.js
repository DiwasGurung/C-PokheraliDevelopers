import axios from 'axios';

const API_URL = 'https://localhost:7126/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Book related API calls
export const bookService = {
  getBooks: (page = 1, limit = 10, search = '', sort = '', filters = {}) => {
    const params = new URLSearchParams({
      page,
      limit,
      search,
      sort,
      ...filters,
    });
    return api.get(`/books?${params}`);
  },

  getBookById: (id) => api.get(`/books/${id}`),
  
  createBook: (bookData) => api.post('/books', bookData),
  
  updateBook: (id, bookData) => api.put(`/books/${id}`, bookData),
  
  deleteBook: (id) => api.delete(`/books/${id}`),
  
  updateInventory: (id, quantity) => api.patch(`/books/${id}/inventory`, { quantity }),
  
  setDiscount: (id, discountData) => api.post(`/books/${id}/discount`, discountData),
};

// Auth related API calls
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  
  login: (credentials) => api.post('/auth/login', credentials),
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => api.get('/auth/me'),
};

// Cart related API calls
export const cartService = {
  getCart: () => api.get('/cart'),
  
  addToCart: (bookId, quantity = 1) => api.post('/cart/items', { bookId, quantity }),
  
  updateCartItem: (itemId, quantity) => api.put(`/cart/items/${itemId}`, { quantity }),
  
  removeFromCart: (itemId) => api.delete(`/cart/items/${itemId}`),
  
  clearCart: () => api.delete('/cart'),
};

// Order related API calls
export const orderService = {
  createOrder: (orderData) => api.post('/orders', orderData),
  
  getOrders: () => api.get('/orders'),
  
  getOrderById: (id) => api.get(`/orders/${id}`),
  
  cancelOrder: (id) => api.post(`/orders/${id}/cancel`),
  
  processOrder: (id, claimCode) => api.post(`/orders/${id}/process`, { claimCode }),
};

// Bookmark related API calls
export const bookmarkService = {
  getBookmarks: () => api.get('/bookmarks'),
  
  addBookmark: (bookId) => api.post('/bookmarks', { bookId }),
  
  removeBookmark: (bookId) => api.delete(`/bookmarks/${bookId}`),
};

// Review related API calls
export const reviewService = {
  getBookReviews: (bookId) => api.get(`/books/${bookId}/reviews`),
  
  createReview: (bookId, reviewData) => api.post(`/books/${bookId}/reviews`, reviewData),
  
  updateReview: (reviewId, reviewData) => api.put(`/reviews/${reviewId}`, reviewData),
  
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

// Admin related API calls
export const adminService = {
  createAnnouncement: (announcementData) => api.post('/admin/announcements', announcementData),
  
  updateAnnouncement: (id, announcementData) => api.put(`/admin/announcements/${id}`, announcementData),
  
  deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`),
  
  getAnnouncements: () => api.get('/admin/announcements'),
};

// Staff related API calls
export const staffService = {
  getPendingOrders: () => api.get('/staff/orders/pending'),
  
  processOrder: (orderId, claimCode) => api.post(`/staff/orders/${orderId}/process`, { claimCode }),
};

export const announcementService = {
  getActiveAnnouncement: () => api.get('/announcements/active'),
  getAnnouncements: () => api.get('/announcements'),
  createAnnouncement: (data) => api.post('/announcements', data),
  updateAnnouncement: (id, data) => api.put(`/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/announcements/${id}`),
};

export default api; 