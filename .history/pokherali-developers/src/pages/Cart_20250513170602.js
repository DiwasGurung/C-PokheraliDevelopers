import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cart,
    loading,
    error,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
  } = useCart();

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
      } catch (err) {
        console.error('Failed to clear cart:', err);
      }
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add some books to your cart to continue shopping</p>
        <button
          onClick={() => navigate('/books')}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Browse Books
        </button>
      </div>
    );
  }

  // Calculate discounts
  const subtotal = getCartTotal();
  const quantityDiscount = getCartItemCount() >= 5 ? subtotal * 0.05 : 0;
  const loyaltyDiscount = 0; // This would be calculated based on user's order history
  const total = subtotal - quantityDiscount - loyaltyDiscount;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <img
                  src={item.book.imageUrl || '/placeholder-book.jpg'}
                  alt={item.book.title}
                  className="w-24 h-32 object-cover rounded"
                />
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg">{item.book.title}</h3>
                  <p className="text-gray-600">{item.book.author}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="px-2 py-1 border rounded"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="px-2 py-1 border rounded"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  {item.book.isOnSale && (
                    <p className="text-sm text-red-500">
                      {item.book.discountPercentage}% OFF
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <button
              onClick={handleClearCart}
              className="text-red-500 hover:text-red-700"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {quantityDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Quantity Discount (5+ books)</span>
                  <span>-${quantityDiscount.toFixed(2)}</span>
                </div>
              )}
              {loyaltyDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Loyalty Discount</span>
                  <span>-${loyaltyDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
            >
              Proceed to Checkout
            </button>

            {/* Discount Information */}
            <div className="mt-4 text-sm text-gray-600">
              <p>• Get 5% off when you order 5 or more books</p>
              <p>• Get 10% off after 10 successful orders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 