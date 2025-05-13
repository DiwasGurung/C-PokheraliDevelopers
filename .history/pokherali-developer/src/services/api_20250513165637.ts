import axios from 'axios';

const API_URL = 'https://localhost:7126/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Book related API calls
export const bookApi = {
    // Get all books with pagination and filters
    getBooks: async (params: {
        searchTerm?: string;
        sortBy?: string;
        sortOrder?: string;
        page?: number;
        pageSize?: number;
    }) => {
        const response = await api.get('/book', { params });
        return response.data;
    },

    // Get a single book by ID
    getBook: async (id: number) => {
        const response = await api.get(`/book/${id}`);
        return response.data;
    },

    // Create a new book
    createBook: async (formData: FormData) => {
        const response = await api.post('/book', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Update a book
    updateBook: async (id: number, formData: FormData) => {
        const response = await api.put(`/book/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Delete a book
    deleteBook: async (id: number) => {
        const response = await api.delete(`/book/${id}`);
        return response.data;
    },

    // Get bestsellers
    getBestsellers: async (count: number = 5) => {
        const response = await api.get('/book/bestsellers', {
            params: { count },
        });
        return response.data;
    },

    // Get new releases
    getNewReleases: async (count: number = 5) => {
        const response = await api.get('/book/new-releases', {
            params: { count },
        });
        return response.data;
    },

    // Get books on sale
    getOnSale: async (count: number = 5) => {
        const response = await api.get('/book/on-sale', {
            params: { count },
        });
        return response.data;
    },
};

// Auth related API calls
export const authApi = {
    login: async (credentials: { email: string; password: string }) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    register: async (userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};

// Cart related API calls
export const cartApi = {
    getCart: async () => {
        const response = await api.get('/cart');
        return response.data;
    },

    addToCart: async (bookId: number, quantity: number) => {
        const response = await api.post('/cart/items', { bookId, quantity });
        return response.data;
    },

    updateCartItem: async (itemId: number, quantity: number) => {
        const response = await api.put(`/cart/items/${itemId}`, { quantity });
        return response.data;
    },

    removeFromCart: async (itemId: number) => {
        const response = await api.delete(`/cart/items/${itemId}`);
        return response.data;
    },

    clearCart: async () => {
        const response = await api.delete('/cart');
        return response.data;
    },
};

// Order related API calls
export const orderApi = {
    getOrders: async () => {
        const response = await api.get('/orders');
        return response.data;
    },

    getOrder: async (id: number) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    createOrder: async (orderData: {
        shippingAddress: string;
        paymentMethod: string;
    }) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    cancelOrder: async (id: number) => {
        const response = await api.post(`/orders/${id}/cancel`);
        return response.data;
    },
};

// Review related API calls
export const reviewApi = {
    getBookReviews: async (bookId: number) => {
        const response = await api.get(`/reviews/book/${bookId}`);
        return response.data;
    },

    createReview: async (bookId: number, reviewData: {
        rating: number;
        comment: string;
    }) => {
        const response = await api.post(`/reviews/book/${bookId}`, reviewData);
        return response.data;
    },

    updateReview: async (reviewId: number, reviewData: {
        rating: number;
        comment: string;
    }) => {
        const response = await api.put(`/reviews/${reviewId}`, reviewData);
        return response.data;
    },

    deleteReview: async (reviewId: number) => {
        const response = await api.delete(`/reviews/${reviewId}`);
        return response.data;
    },
};

export default api; 