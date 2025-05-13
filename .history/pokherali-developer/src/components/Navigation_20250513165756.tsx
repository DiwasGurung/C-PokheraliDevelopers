import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export const Navigation: React.FC = () => {
    const { user, logout } = useAuth();
    const { getTotalItems } = useCart();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex items-center">
                            <span className="text-2xl font-bold text-blue-600">BookStore</span>
                        </Link>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                to="/books"
                                className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-blue-500"
                            >
                                Books
                            </Link>
                            <Link
                                to="/categories"
                                className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-blue-500"
                            >
                                Categories
                            </Link>
                            {user?.role === 'Admin' && (
                                <Link
                                    to="/admin"
                                    className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-blue-500"
                                >
                                    Admin
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        <Link
                            to="/cart"
                            className="relative p-2 text-gray-600 hover:text-gray-900"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {getTotalItems() > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                                    {getTotalItems()}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="ml-3 relative">
                                <div className="flex items-center space-x-4">
                                    <span className="text-gray-700">
                                        {user.firstName} {user.lastName}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-700 hover:text-gray-900"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-gray-900"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center sm:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link
                            to="/books"
                            className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Books
                        </Link>
                        <Link
                            to="/categories"
                            className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Categories
                        </Link>
                        {user?.role === 'Admin' && (
                            <Link
                                to="/admin"
                                className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Admin
                            </Link>
                        )}
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-200">
                        {user ? (
                            <div className="space-y-1">
                                <div className="block px-4 py-2 text-base font-medium text-gray-500">
                                    {user.firstName} {user.lastName}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <Link
                                    to="/login"
                                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}; 