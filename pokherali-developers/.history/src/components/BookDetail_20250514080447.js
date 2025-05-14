import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../contexts/UserContext";
import { CartContext } from "../contexts/CartContext";

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");  // Error message state for reviews

  const navigate = useNavigate();

  // Get user context and cart context
  const user = localStorage.getItem('user');
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.get(`https://localhost:7126/api/Books/${id}`);
        setBook(response.data);
      } catch (error) {
        console.error("Error fetching book details:", error);
        alert("Error fetching book details");
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await axios.get(`https://localhost:7126/api/Reviews/book/${id}`);
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        alert("Error fetching reviews");
      }
    };
    
    const checkIfBookmarked = async () => {
      if (user) {
        try {
          const response = await axios.get(`https://localhost:7126/api/Bookmarks`);
          const bookmarks = response.data;
          setBookmarked(bookmarks.some(b => b.id === parseInt(id)));
        } catch (error) {
          console.error("Error checking bookmark status:", error);
        }
      }
    };

    fetchBookDetails();
    fetchReviews();
    checkIfBookmarked();
  }, [id, user]);

  const handleReviewSubmit = async () => {
    if (!user) {
      alert("Please log in to submit a review.");
      navigate('/login', { state: { redirectTo: `/book/${id}` } });
      return;
    }

    if (!review.trim()) {
      alert("Please write a review before submitting.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(""); // Reset the error message before submitting

    try {
      await axios.post("https://localhost:7126/api/Reviews", { bookId: id, comment: review });

      // Refresh reviews after submission
      const response = await axios.get(`https://localhost:7126/api/Reviews/book/${id}`);
      setReviews(response.data);

      setReview("");
      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      
      // Handle error if the user has not purchased the book
      if (error.response && error.response.status === 400) {
        setErrorMessage(error.response.data);  // Set the error message returned from backend
      } else {
        alert("Failed to submit review.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAddToCart = async () => {
    if (!user) {
      alert("Please log in to add items to your cart.");
      navigate('/login', { state: { redirectTo: `/book/${id}` } });
      return;
    }
    
    setAddingToCart(true);
    try {
      // Use the cart context to add the item
      await addToCart({ bookId: parseInt(id), quantity: 1 });
      alert("Book added to cart successfully!");
    } catch (error) {
      console.error("Error adding book to cart:", error);
      alert("Failed to add book to cart.");
    } finally {
      setAddingToCart(false);
    }
  };
  
  const handleToggleBookmark = async () => {
    if (!user) {
      alert("Please log in to bookmark books.");
      navigate('/login', { state: { redirectTo: `/book/${id}` } });
      return;
    }
    
    try {
      if (bookmarked) {
        // Remove bookmark
        await axios.delete(`https://localhost:7126/api/Bookmarks/${id}`);
        setBookmarked(false);
        alert("Book removed from bookmarks!");
      } else {
        // Add bookmark
        await axios.post(`https://localhost:7126/api/Bookmarks`, parseInt(id));
        setBookmarked(true);
        alert("Book added to bookmarks!");
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      alert(bookmarked ? "Failed to remove bookmark." : "Failed to add bookmark.");
    }
  };

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-32 w-32 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Book Image */}
        <div className="md:col-span-1">
          <div className="sticky top-8">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img
                src={book.imageUrl ? `https://localhost:7126${book.imageUrl}` : "/placeholder-book.jpg"}
                alt={book.title}
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Price and Purchase Section */}
            <div className="mt-6 bg-gray-50 rounded-lg p-6 shadow-md">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-gray-900">${book.price}</span>

                {book.isOnSale && (
                  <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    {book.discountPercentage}% OFF
                  </span>
                )}
              </div>

              {book.isOnSale && book.discountEndDate && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>Sale ends: {new Date(book.discountEndDate).toLocaleDateString()}</p>
                </div>
              )}

              <div className="mt-4 space-y-3">
                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50"
                  onClick={handleAddToCart}
                  disabled={addingToCart || book.stock <= 0}
                >
                  {addingToCart ? "Adding..." : book.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                </button>
                <button 
                  className={`w-full ${bookmarked ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-200 hover:bg-gray-300'} text-gray-800 font-medium py-3 px-4 rounded-lg transition duration-150 ease-in-out`}
                  onClick={handleToggleBookmark}
                >
                  {bookmarked ? "Bookmarked" : "Add to Wishlist"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Book Details and Reviews */}
        <div className="md:col-span-2">
          {/* Book Title and Author */}
          <div className="border-b pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
            <p className="text-xl text-gray-600">
              by <span className="font-semibold">{book.author}</span>
            </p>
          </div>

          {/* Book Description */}
          <div className="py-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed">{book.description}</p>
          </div>

          {/* Reviews Section */}
          <div className="py-6">
            <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>

            {reviews.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600">No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center mb-2">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                        {review.userName ? review.userName.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="ml-4">
                        <p className="font-semibold text-gray-900">{review.userName || "Anonymous"}</p>
                        <p className="text-sm text-gray-500">
                          {review.date ? new Date(review.date).toLocaleDateString() : "Unknown date"}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Review Submission Form */}
            {user ? (
              <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="w-full h-32 border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Share your thoughts about this book..."
                ></textarea>
                <button
                  onClick={handleReviewSubmit}
                  disabled={isSubmitting}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
                {errorMessage && (
                  <div className="mt-4 text-red-600">{errorMessage}</div>
                )}
              </div>
            ) : (
              <div className="mt-8 bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-4">Please log in to leave a review.</p>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-150 ease-in-out"
                  onClick={() => navigate('/login', { state: { redirectTo: `/book/${id}` } })}
                >
                  Log In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
