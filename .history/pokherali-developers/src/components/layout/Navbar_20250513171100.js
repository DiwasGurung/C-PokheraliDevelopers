import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isAdmin, isStaff } = useAuth();
  const { getCartItemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-blue-600">BookStore</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/books" className="text-gray-600 hover:text-blue-600">
              Books
            </Link>
            {isAuthenticated() && (
              <>
                <Link to="/orders" className="text-gray-600 hover:text-blue-600">
                  Orders
                </Link>
                <Link to="/bookmarks" className="text-gray-600 hover:text-blue-600">
                  Bookmarks
                </Link>
              </>
            )}
            {(isAdmin() || isStaff()) && (
              <Link to="/admin/dashboard" className="text-gray-600 hover:text-blue-600">
                Dashboard
              </Link>
            )}
          </div>

          {/* Right Side Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated() ? (
              <>
                <Link to="/cart" className="relative text-gray-600 hover:text-blue-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {getCartItemCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getCartItemCount()}
                    </span>
                  )}
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center text-gray-600 hover:text-blue-600"
                  >
                    <span className="mr-2">{user?.firstName}</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/books"
                className="block px-3 py-2 text-gray-600 hover:text-blue-600"
              >
                Books
              </Link>
              {isAuthenticated() && (
                <>
                  <Link
                    to="/orders"
                    className="block px-3 py-2 text-gray-600 hover:text-blue-600"
                  >
                    Orders
                  </Link>
                  <Link
                    to="/bookmarks"
                    className="block px-3 py-2 text-gray-600 hover:text-blue-600"
                  >
                    Bookmarks
                  </Link>
                </>
              )}
              {(isAdmin() || isStaff()) && (
                <Link
                  to="/admin/dashboard"
                  className="block px-3 py-2 text-gray-600 hover:text-blue-600"
                >
                  Dashboard
                </Link>
              )}
              {isAuthenticated() ? (
                <>
                  <Link
                    to="/cart"
                    className="block px-3 py-2 text-gray-600 hover:text-blue-600"
                  >
                    Cart ({getCartItemCount()})
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-gray-600 hover:text-blue-600"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-gray-600 hover:text-blue-600"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 text-gray-600 hover:text-blue-600"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 