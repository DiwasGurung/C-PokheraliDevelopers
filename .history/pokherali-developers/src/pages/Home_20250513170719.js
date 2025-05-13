import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [onSaleBooks, setOnSaleBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const [featuredResponse, newArrivalsResponse, onSaleResponse] = await Promise.all([
        bookService.getBooks(1, 4, '', 'featured'),
        bookService.getBooks(1, 4, '', 'newest'),
        bookService.getBooks(1, 4, '', '', { isOnSale: true })
      ]);

      setFeaturedBooks(featuredResponse.data.items);
      setNewArrivals(newArrivalsResponse.data.items);
      setOnSaleBooks(onSaleResponse.data.items);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const BookCard = ({ book }) => (
    <div
      className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
      onClick={() => navigate(`/books/${book.id}`)}
    >
      <img
        src={book.imageUrl || '/placeholder-book.jpg'}
        alt={book.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{book.title}</h3>
        <p className="text-gray-600 mb-2">{book.author}</p>
        <div className="flex justify-between items-center">
          <div>
            {book.isOnSale && book.discountPercentage ? (
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-bold">
                  ${(book.price * (1 - book.discountPercentage / 100)).toFixed(2)}
                </span>
                <span className="text-gray-500 line-through">
                  ${book.price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="font-bold">${book.price.toFixed(2)}</span>
            )}
          </div>
          {book.isOnSale && (
            <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
              {book.discountPercentage}% OFF
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white rounded-lg p-8 mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Our Bookstore</h1>
        <p className="text-xl mb-8">Discover your next favorite book from our extensive collection</p>
        <button
          onClick={() => navigate('/books')}
          className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
        >
          Browse Books
        </button>
      </div>

      {/* Featured Books */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Featured Books</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">New Arrivals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* On Sale Books */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">On Sale</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {onSaleBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* Call to Action */}
      {!isAuthenticated() && (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
          <p className="text-gray-600 mb-6">
            Create an account to get exclusive discounts and track your orders
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/register')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600"
            >
              Sign Up
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-blue-500 px-6 py-3 rounded-lg font-semibold border border-blue-500 hover:bg-gray-50"
            >
              Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 