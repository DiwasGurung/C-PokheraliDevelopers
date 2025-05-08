import React from "react"
import { Star, ShoppingCart, Bookmark } from 'lucide-react'

export default function BookItem({ book }) {
  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
        />
      ))
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row">
      <div className="md:w-1/3 bg-gray-200">
        <img
          src={`https://via.placeholder.com/300x400?text=${encodeURIComponent(book.title)}`}
          alt={book.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4 md:w-2/3">
        <a href={`/book/${book.id}`}>
          <h3 className="text-xl font-semibold mb-1 hover:text-blue-600">{book.title}</h3>
        </a>
        <p className="text-gray-600 mb-2">by {book.author}</p>

        <div className="flex items-center mb-2">
          {renderStars(book.rating)}
          <span className="ml-1 text-sm text-gray-600">({book.rating})</span>
        </div>

        <p className="text-lg font-bold text-blue-600 mb-2">${book.price.toFixed(2)}</p>

        <div className="mb-3">
          <span
            className={`text-sm px-2 py-1 rounded-full ${
              book.availability === "In stock" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {book.availability}
          </span>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors">
            <ShoppingCart size={16} />
            <span>Add to Cart</span>
          </button>
          <button className="flex items-center gap-1 bg-gray-200 text-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-300 transition-colors">
            <Bookmark size={16} />
            <span>Bookmark</span>
          </button>
        </div>
      </div>
    </div>
  )
}
