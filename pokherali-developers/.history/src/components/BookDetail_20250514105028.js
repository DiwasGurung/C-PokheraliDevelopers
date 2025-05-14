import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { UserContext } from "../contexts/UserContext"
import { CartContext } from "../contexts/CartContext"

const BookDetails = () => {
  const { id } = useParams() // Get the book id from the URL
  const [book, setBook] = useState(null)
  const [reviews, setReviews] = useState([])
  const [review, setReview] = useState("")
  const [rating, setRating] = useState(5) // Default rating to 5 stars
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [reviewMessage, setReviewMessage] = useState(null) // For displaying messages
  const [hasPurchased, setHasPurchased] = useState(false) // Track if user has purchased this book
  
  const navigate = useNavigate()
  
  // Get user context and cart context
  const user = localStorage.getItem('user')
  const { addToCart } = useContext(CartContext)

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.get(`https://localhost:7126/api/Books/${id}`)
        setBook(response.data)
      } catch (error) {
        console.error("Error fetching book details:", error)
        alert("Error fetching book details")
      }
    }

    const fetchReviews = async () => {
      try {
        const response = await axios.get(`https://localhost:7126/api/Reviews/book/${id}`)
        setReviews(response.data)
      } catch (error) {
        console.error("Error fetching reviews:", error)
        alert("Error fetching reviews")
      }
    }
    
    const checkIfBookmarked = async () => {
      if (user) {
        try {
          const response = await axios.get(`https://localhost:7126/api/Bookmarks`)
          const bookmarks = response.data
          setBookmarked(bookmarks.some(b => b.id === parseInt(id)))
        } catch (error) {
          console.error("Error checking bookmark status:", error)
        }
      }
    }
    
    // Check if user has purchased this book
    const checkPurchaseStatus = async () => {
      if (user) {
        try {
          // This endpoint should be created if it doesn't exist yet
          const response = await axios.get(`https://localhost:7126/api/Orders/purchased/${id}`)
          setHasPurchased(response.data)
        } catch (error) {
          console.error("Error checking purchase status:", error)
          setHasPurchased(false)
        }
      }
    }

    fetchBookDetails()
    fetchReviews()
    checkIfBookmarked()
    checkPurchaseStatus()
  }, [id, user])

  const handleReviewSubmit = async () => {
    if (!user) {
      alert("Please log in to submit a review.")
      navigate('/login', { state: { redirectTo: `/book/${id}` } })
      return
    }

    if (!review.trim()) {
      alert("Please write a review before submitting.")
      return
    }

    setIsSubmitting(true)
    setReviewMessage(null)
    
    try {
 
      const reviewPayload = { 
        bookId: parseInt(id), 
        comment: review,
        rating: rating 
      }
      console.log("Sending review payload:", reviewPayload)
      
      const response = await axios.post("https://localhost:7126/api/Reviews", reviewPayload)
      console.log("Review response:", response.data)
      
      // Refresh reviews after submission
      const updatedReviews = await axios.get(`https://localhost:7126/api/Reviews/book/${id}`)
      setReviews(updatedReviews.data)

      setReview("")
      setRating(5) // Reset rating to 5
      setReviewMessage({ type: "success", text: "Review submitted successfully!" })
    } catch (error) {
      console.error("Error submitting review:", error)
      
      // Log more detailed error information
      if (error.response) {
        console.log("Error response data:", error.response.data)
        
        // Handle specific error messages from the API
        if (error.response.status === 400) {
          if (typeof error.response.data === 'string') {
            setReviewMessage({ type: "error", text: error.response.data })
          } else if (error.response.data && typeof error.response.data === 'object') {
            // Handle validation errors or other structured error responses
            const errorMessage = error.response.data.title || 
                               (error.response.data.errors ? Object.values(error.response.data.errors).flat().join(', ') : 
                               'Failed to submit review. Please try again.')
            setReviewMessage({ type: "error", text: errorMessage })
          } else {
            setReviewMessage({ type: "error", text: "Failed to submit review. Please try again." })
          }
        } else {
          setReviewMessage({ type: "error", text: "Failed to submit review. Server returned an error." })
        }
      } else if (error.request) {
        setReviewMessage({ type: "error", text: "Failed to submit review. No response from server." })
      } else {
        setReviewMessage({ type: "error", text: `Failed to submit review: ${error.message}` })
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleAddToCart = async () => {
    if (!user) {
      alert("Please log in to add items to your cart.")
      navigate('/login', { state: { redirectTo: `/book/${id}` } })
      return
    }
    
    setAddingToCart(true)
    try {
      // Use the cart context to add the item
      await addToCart({ bookId: parseInt(id), quantity: 1 })
      alert("Book added to cart successfully!")
    } catch (error) {
      console.error("Error adding book to cart:", error)
      alert("Failed to add book to cart.")
    } finally {
      setAddingToCart(false)
    }
  }
  
  const handleToggleBookmark = async () => {
    if (!user) {
      alert("Please log in to bookmark books.")
      navigate('/login', { state: { redirectTo: `/book/${id}` } })
      return
    }
    
    try {
      if (bookmarked) {
        // Remove bookmark
        await axios.delete(`https://localhost:7126/api/Bookmarks/${id}`)
        setBookmarked(false)
        alert("Book removed from bookmarks!")
      } else {
        // Add bookmark
        await axios.post(`https://localhost:7126/api/Bookmarks`, parseInt(id))
        setBookmarked(true)
        alert("Book added to bookmarks!")
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error)
      alert(bookmarked ? "Failed to remove bookmark." : "Failed to add bookmark.")
    }
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-32 w-32 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
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

              {/* Badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                {book.isBestseller && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    Bestseller
                  </span>
                )}
                {book.isNewRelease && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    New Release
                  </span>
                )}
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

          {/* Book Details */}
          <div className="py-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Product Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-600">Genre:</span>
                  <span className="font-medium">{book.genre}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">ISBN:</span>
                  <span className="font-medium">{book.isbn}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Publisher:</span>
                  <span className="font-medium">{book.publisher}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">{book.language}</span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-600">Format:</span>
                  <span className="font-medium">{book.format}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Pages:</span>
                  <span className="font-medium">{book.pages}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-medium">{book.weight}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Dimensions:</span>
                  <span className="font-medium">{book.dimensions}</span>
                </p>
              </div>
            </div>
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
                          {review.createate ? new Date(review.date).toLocaleDateString() : "Unknown date"}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg 
                              key={i} 
                              className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
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
                
                {!hasPurchased && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                    <p>You can only review books you have purchased.</p>
                  </div>
                )}
                
                {reviewMessage && (
                  <div className={`mb-4 p-3 ${reviewMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'} rounded-md`}>
                    <p>{reviewMessage.text}</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Rating</label>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRating(i + 1)}
                        className="focus:outline-none"
                      >
                        <svg 
                          className={`w-8 h-8 ${i < rating ? 'text-yellow-400' : 'text-gray-300'} cursor-pointer`}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="w-full h-32 border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Share your thoughts about this book..."
                  disabled={!hasPurchased}
                ></textarea>
                <button
                  onClick={handleReviewSubmit}
                  disabled={isSubmitting || !hasPurchased}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
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
  )
}

export default BookDetails