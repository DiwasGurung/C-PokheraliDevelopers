import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookService, reviewService, bookmarkService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isMember } = useAuth();
  const { addToCart } = useCart();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    loadBookDetails();
    if (isAuthenticated()) {
      checkBookmarkStatus();
    }
  }, [id]);

  const loadBookDetails = async () => {
    try {
      setLoading(true);
      const [bookResponse, reviewsResponse] = await Promise.all([
        bookService.getBookById(id),
        reviewService.getBookReviews(id),
      ]);
      setBook(bookResponse.data);
      setReviews(reviewsResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    try {
      const response = await bookmarkService.getBookmarks();
      setIsBookmarked(response.data.some(b => b.bookId === parseInt(id)));
    } catch (err) {
      console.error('Failed to check bookmark status:', err);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(id, quantity);
      // Show success message or notification
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    try {
      if (isBookmarked) {
        await bookmarkService.removeBookmark(id);
      } else {
        await bookmarkService.addBookmark(id);
      }
      setIsBookmarked(!isBookmarked);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update bookmark');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await reviewService.createReview(id, reviewForm);
      setReviewForm({ rating: 5, comment: '' });
      loadBookDetails(); // Reload reviews
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!book) {
    return <div className="text-center">Book not found</div>;
  }

  const discountedPrice = book.isOnSale && book.discountPercentage
    ? book.price * (1 - book.discountPercentage / 100)
    : book.price;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Book Image */}
        <div className="relative">
          <img
            src={book.imageUrl || '/placeholder-book.jpg'}
            alt={book.title}
            className="w-full h-auto rounded-lg shadow-lg"
          />
          {book.isOnSale && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full">
              {book.discountPercentage}% OFF
            </div>
          )}
        </div>

        {/* Book Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
          <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
          
          <div className="mb-4">
            <p className="text-gray-700">{book.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600">ISBN</p>
              <p className="font-semibold">{book.isbn}</p>
            </div>
            <div>
              <p className="text-gray-600">Format</p>
              <p className="font-semibold">{book.format}</p>
            </div>
            <div>
              <p className="text-gray-600">Language</p>
              <p className="font-semibold">{book.language}</p>
            </div>
            <div>
              <p className="text-gray-600">Publisher</p>
              <p className="font-semibold">{book.publisher}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-600">Price</p>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-red-500">
                ${discountedPrice.toFixed(2)}
              </span>
              {book.isOnSale && (
                <span className="text-lg text-gray-500 line-through">
                  ${book.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label htmlFor="quantity" className="text-gray-600">Quantity:</label>
              <input
                type="number"
                id="quantity"
                min="1"
                max={book.stockQuantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(parseInt(e.target.value), book.stockQuantity))}
                className="w-20 p-2 border rounded"
              />
            </div>
            <button
              onClick={handleAddToCart}
              disabled={book.stockQuantity === 0}
              className="flex-1 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {book.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              onClick={handleBookmark}
              className={`px-4 py-2 rounded ${
                isBookmarked
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
          </div>

          <div className="text-sm text-gray-500">
            <p>Stock: {book.stockQuantity} available</p>
            {book.isOnSale && book.discountEndDate && (
              <p>Sale ends: {new Date(book.discountEndDate).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Reviews</h2>
        
        {/* Review Form */}
        {isMember() && (
          <form onSubmit={handleReviewSubmit} className="mb-8">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Rating</label>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded"
              >
                {[5, 4, 3, 2, 1].map(rating => (
                  <option key={rating} value={rating}>
                    {rating} {rating === 1 ? 'Star' : 'Stars'}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Comment</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                className="w-full p-2 border rounded"
                rows="4"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Submit Review
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.map(review => (
            <div key={review.id} className="border-b pb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-xl ${
                        i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-gray-600">
                  by {review.userName} on {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="text-gray-500 text-center">No reviews yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails; 