import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

interface BookCardProps {
    id: number;
    title: string;
    author: string;
    price: number;
    imageUrl: string;
    discount?: number;
    rating?: number;
    showAddToCart?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({
    id,
    title,
    author,
    price,
    imageUrl,
    discount,
    rating,
    showAddToCart = true,
}) => {
    const { addToCart } = useCart();
    const discountedPrice = discount ? price * (1 - discount / 100) : price;

    const handleAddToCart = async () => {
        try {
            await addToCart(id, 1);
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <Link to={`/books/${id}`}>
                <div className="relative aspect-[3/4]">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                    {discount && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                            -{discount}%
                        </div>
                    )}
                </div>
            </Link>
            <div className="p-4">
                <Link to={`/books/${id}`}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 hover:text-blue-600 transition-colors duration-200">
                        {title}
                    </h3>
                </Link>
                <p className="text-gray-600 text-sm mb-2">{author}</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                            ${discountedPrice.toFixed(2)}
                        </span>
                        {discount && (
                            <span className="text-sm text-gray-500 line-through">
                                ${price.toFixed(2)}
                            </span>
                        )}
                    </div>
                    {rating && (
                        <div className="flex items-center">
                            <span className="text-yellow-400">★</span>
                            <span className="text-sm text-gray-600 ml-1">
                                {rating.toFixed(1)}
                            </span>
                        </div>
                    )}
                </div>
                {showAddToCart && (
                    <button
                        onClick={handleAddToCart}
                        className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
                    >
                        Add to Cart
                    </button>
                )}
            </div>
        </div>
    );
}; 