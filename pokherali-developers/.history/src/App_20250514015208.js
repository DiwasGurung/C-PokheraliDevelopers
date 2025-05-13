import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';

// Components
import Cart from './components/Cart';
import MemberDashboard from './components/MemberDashboard';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import Login from './components/Login';
import Register from './components/Register';
import BookDetails from './components/BookDetail';
import BookmarksPage from './pages/BookmarkPage';

// Context Providers
import { UserProvider } from './contexts/UserContext';
import { CartProvider } from './contexts/CartContext';
import { BookmarksProvider } from './contexts/BookmarksContext';
// Add at the top level of your application
import axios from 'axios';
import OrdersPage from './pages/OrderPage';
import AdminAnnouncements from './components/AdminAnnoucement';
import AnnouncementsPage from './pages/AnnouncementPage';

// Set default axios configuration for all requests
axios.defaults.withCredentials = true;

export default function App() {
  return (
    // Wrapping everything with context providers
    <UserProvider>
      <CartProvider>
        <BookmarksProvider>
          <Router>
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/book/:id" element={<BookDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/dashboard" element={<MemberDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path='/orders' element={<OrdersPage />} />
              <Route path='/orders/:orderId' element={<OrdersPage />} />
              <Route path='/admin/announcements' element={<AdminAnnouncements />} />
              <Route path='/announcements' element={<AnnouncementsPage />} />
<Route path='/admin/discount' element={<AnnouncementsPage />} />
            </Routes>
          </Router>
        </BookmarksProvider>
      </CartProvider>
    </UserProvider>
  );
}
