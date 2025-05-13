import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart, ChevronRight, Plus, Minus, AlertTriangle, CheckCircle } from "lucide-react";
import { UserContext } from "../contexts/UserContext";
import { CartContext } from "../contexts/CartContext";
import axios from "axios";

export default function Cart() {
  const { user } = useContext(UserContext);
  const { cartItems, updateCartItemQuantity, removeItem, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Cart, 2: Shipping, 3: Confirmation
  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState("");

  // Populate shipping info from user profile if available
  useEffect(() => {
    if (user) {
      setShippingInfo({
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
      });
    }
  }, [user]);

  // Calculate totals and discounts
  const calculateTotals = () => {
    const itemCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
    const subtotal = cartItems.reduce((sum, item) => sum + ((item.bookPrice || 0) * (item.quantity || 0)), 0);
    
    // Calculate volume discount (5% for 5+ books)
    const volumeDiscountEligible = itemCount >= 5;
    const volumeDiscount = volumeDiscountEligible ? subtotal * 0.05 : 0;
    
    // Calculate loyalty discount (10% for users with 10+ successful orders)
    const loyaltyDiscountEligible = user && user.successfulOrderCount >= 10;
    const loyaltyDiscount = loyaltyDiscountEligible ? subtotal * 0.1 : 0;
    
    const totalDiscount = volumeDiscount + loyaltyDiscount;
    const shipping = subtotal > 0 ? 5.99 : 0;
    const finalTotal = subtotal - totalDiscount + shipping;
    
    return {
      itemCount,
      subtotal,
      volumeDiscountEligible,
      volumeDiscount,
      loyaltyDiscountEligible,
      loyaltyDiscount,
      totalDiscount,
      shipping,
      finalTotal
    };
  };

  const totals = calculateTotals();

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    
    // Validate shipping info
    if (!shippingInfo.address.trim()) {
      setError("Address is required");
      return;
    }
    if (!shippingInfo.city.trim()) {
      setError("City is required");
      return;
    }
    if (!shippingInfo.state.trim()) {
      setError("State is required");
      return;
    }
    if (!shippingInfo.zipCode.trim()) {
      setError("ZIP code is required");
      return;
    }
    
    setError("");
    setCheckoutStep(3); // Move to confirmation step
  };

  const processOrder = async () => {
    if (cartItems.length === 0) return;

    if (!user) {
      navigate('/login', { state: { redirectTo: '/cart' } });
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Prepare order items
      const items = cartItems.map(item => ({
        bookId: item.bookId,
        quantity: item.quantity
      }));

      // Prepare order data
      const orderData = {
        shippingAddress: shippingInfo.address,
        shippingCity: shippingInfo.city,
        shippingState: shippingInfo.state,
        shippingZipCode: shippingInfo.zipCode,
        items: items
      };

      // Submit order to API using axios to maintain consistent authentication
      const response = await axios.post(
        'https://localhost:7126/api/Orders',
        orderData,
        { withCredentials: true }
      );

      // Set order details and complete order
      setOrderDetails(response.data);
      setOrderComplete(true);
      clearCart();
      setCheckoutStep(4); // Move to confirmation step
    } catch (err) {
      console.error('Order error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred while placing your order');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCart = () => {
    if (cartItems.length === 0) {
      return (
        <div className="text-center py-8">
          <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-4">Looks like you haven't added any books to your cart yet.</p>
          <button 
            onClick={() => navigate('/browse')}
            className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Browse Books
          </button>
        </div>
      );
    }

    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Cart ({totals.itemCount} items)</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <div className="divide-y divide-gray-200">
          {cartItems.map((item) => (
            <div key={item.id} className="py-4 flex items-start gap-4">
              <div className="w-20 h-24 bg-gray-100 rounded overflow-hidden">
                {item.bookImageUrl ? (
                  <img 
                    src={item.bookImageUrl.startsWith('http') ? item.bookImageUrl : `https://localhost:7126${item.bookImageUrl}`} 
                    alt={item.bookTitle} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <ShoppingCart size={24} className="text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.bookTitle || "Untitled Book"}</h3>
                <p className="text-sm text-gray-500">{item.bookAuthor || "Unknown Author"}</p>
                <div className="flex items-center mt-2">
                  <button
                    onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className={`w-8 h-8 flex items-center justify-center border rounded-md ${
                      item.quantity <= 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="mx-3 font-medium">{item.quantity || 0}</span>
                  <button
                    onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= 10}
                    className="w-8 h-8 flex items-center justify-center border rounded-md bg-white text-gray-600 hover:bg-gray-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-medium text-gray-900">${((item.bookPrice || 0) * (item.quantity || 0)).toFixed(2)}</p>
                <p className="text-sm text-gray-500">${(item.bookPrice || 0).toFixed(2)} each</p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm flex items-center ml-auto"
                >
                  <Trash2 size={16} className="mr-1" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 space-y-3 text-sm border-t pt-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
          </div>
          
          {totals.volumeDiscountEligible && (
            <div className="flex justify-between text-green-600">
              <span>Volume Discount (5%)</span>
              <span>-${totals.volumeDiscount.toFixed(2)}</span>
            </div>
          )}
          
          {totals.loyaltyDiscountEligible && (
            <div className="flex justify-between text-green-600">
              <span>Loyalty Discount (10%)</span>
              <span>-${totals.loyaltyDiscount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">${totals.shipping.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>${totals.finalTotal.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={() => setCheckoutStep(2)}
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            Proceed to Shipping
            <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      </div>
    );
  };

  const renderShipping = () => {
    return (
      <div>
        <div className="flex items-center mb-4">
          <button 
            onClick={() => setCheckoutStep(1)} 
            className="text-purple-600 hover:text-purple-800 font-medium flex items-center"
          >
            <ChevronRight size={18} className="transform rotate-180 mr-1" />
            Back to Cart
          </button>
          <h2 className="text-xl font-semibold ml-4">Shipping Information</h2>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleShippingSubmit} className="space-y-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              value={shippingInfo.address}
              onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                value={shippingInfo.city}
                onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="state"
                value={shippingInfo.state}
                onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="zipCode"
              value={shippingInfo.zipCode}
              onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
              required
              pattern="[0-9]{5}"
              title="Five digit ZIP code"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          <div className="pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({totals.itemCount} items)</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
              
              {totals.totalDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discounts</span>
                  <span>-${totals.totalDiscount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>${totals.shipping.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>${totals.finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              Continue to Confirmation
              <ChevronRight size={18} className="ml-1" />
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderConfirmation = () => {
    if (!orderDetails) return null;
    
    return (
      <div className="text-center">
        <div className="bg-green-50 text-green-700 p-6 rounded-lg mb-6">
          <CheckCircle size={48} className="mx-auto mb-3" />
          <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
          <p>Your order has been placed successfully.</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
          <h3 className="font-semibold text-gray-900 mb-2">Order Details</h3>
          <p><span className="text-gray-600">Order Number:</span> {orderDetails.orderNumber || "N/A"}</p>
          <p><span className="text-gray-600">Total Amount:</span> ${(orderDetails.totalAmount || 0).toFixed(2)}</p>
          
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Claim Code</h4>
            <div className="bg-white p-3 border border-gray-300 rounded-lg text-center">
              <span className="text-xl font-mono font-semibold tracking-widest">{orderDetails.claimCode || "N/A"}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Present this code when picking up your order.
            </p>
          </div>
        </div>
        
        <p className="mb-4">
          A confirmation email has been sent to your registered email address with all the details.
        </p>
        
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => navigate('/browse')} 
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Continue Shopping
          </button>
          <button 
            onClick={() => navigate('/orders')} 
            className="px-4 py-2 bg-white text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
          >
            View My Orders
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Display different content based on checkout step */}
      {checkoutStep === 1 && renderCart()}
      {checkoutStep === 2 && renderShipping()}
      {checkoutStep === 3 && renderConfirmation()}
    </div>
  );
}
