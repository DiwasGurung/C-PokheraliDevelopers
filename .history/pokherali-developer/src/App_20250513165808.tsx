import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Navigation } from './components/Navigation';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Books = React.lazy(() => import('./pages/Books'));
const BookDetails = React.lazy(() => import('./pages/BookDetails'));
const Categories = React.lazy(() => import('./pages/Categories'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Admin = React.lazy(() => import('./pages/Admin'));
const Unauthorized = React.lazy(() => import('./pages/Unauthorized'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

const App: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <div className="min-h-screen bg-gray-50">
                        <Navigation />
                        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            <React.Suspense
                                fallback={
                                    <div className="flex items-center justify-center min-h-screen">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                    </div>
                                }
                            >
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/books" element={<Books />} />
                                    <Route path="/books/:id" element={<BookDetails />} />
                                    <Route path="/categories" element={<Categories />} />
                                    <Route
                                        path="/cart"
                                        element={
                                            <ProtectedRoute>
                                                <Cart />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />
                                    <Route
                                        path="/admin/*"
                                        element={
                                            <ProtectedRoute requiredRole="Admin">
                                                <Admin />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route path="/unauthorized" element={<Unauthorized />} />
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </React.Suspense>
                        </main>
                    </div>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
};

export default App; 