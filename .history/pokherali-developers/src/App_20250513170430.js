import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { useAuth } from './contexts/AuthContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AnnouncementBanner from './components/layout/AnnouncementBanner';

// Page Components
import Home from './pages/Home';
import BookList from './pages/BookList';
import BookDetails from './pages/BookDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Bookmarks from './pages/Bookmarks';
import AdminDashboard from './pages/admin/Dashboard';
import AdminBooks from './pages/admin/Books';
import AdminOrders from './pages/admin/Orders';
import AdminAnnouncements from './pages/admin/Announcements';
import StaffOrders from './pages/staff/Orders';

// Protected Route Component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <AnnouncementBanner />
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/books" element={<BookList />} />
                <Route path="/books/:id" element={<BookDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Member Routes */}
                <Route path="/cart" element={
                  <ProtectedRoute roles={['Member']}>
                    <Cart />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute roles={['Member']}>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute roles={['Member']}>
                    <Orders />
                  </ProtectedRoute>
                } />
                <Route path="/orders/:id" element={
                  <ProtectedRoute roles={['Member']}>
                    <OrderDetails />
                  </ProtectedRoute>
                } />
                <Route path="/bookmarks" element={
                  <ProtectedRoute roles={['Member']}>
                    <Bookmarks />
                  </ProtectedRoute>
                } />

                {/* Staff Routes */}
                <Route path="/staff/orders" element={
                  <ProtectedRoute roles={['Staff', 'Admin']}>
                    <StaffOrders />
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute roles={['Admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/books" element={
                  <ProtectedRoute roles={['Admin']}>
                    <AdminBooks />
                  </ProtectedRoute>
                } />
                <Route path="/admin/orders" element={
                  <ProtectedRoute roles={['Admin']}>
                    <AdminOrders />
                  </ProtectedRoute>
                } />
                <Route path="/admin/announcements" element={
                  <ProtectedRoute roles={['Admin']}>
                    <AdminAnnouncements />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
