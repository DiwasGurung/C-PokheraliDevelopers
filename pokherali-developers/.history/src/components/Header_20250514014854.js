import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

function SearchBar() {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", query);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by title, author, or ISBN..."
        className="w-full py-2 pl-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
      >
        <Search size={18} />
      </button>
    </form>
  );
}

export default function Header() {
  const [user, setUser] = useState(null);

  // Check if the user is logged in by looking in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Parse and set user from localStorage
    }
  }, []);

  const handleLogout = () => {
    // Clear user from localStorage and set user state to null
    localStorage.removeItem("user");
    setUser(null);
  };

  // Function to render menu items for specific roles
  const renderRoleBasedLinks = () => {
    if (!user) return null; // No user logged in

    const roles = user.roles || [];

    if (roles.includes("Admin")) {
      return (
        <>
          <li>
            <a href="/admin/manage-books" className="text-gray-700 hover:text-blue-600 font-medium">
              Manage Books (CRUD)
            </a>
          </li>
          <li>
            <a href="/admin/discounts" className="text-gray-700 hover:text-blue-600 font-medium">
              Timed Discounts
            </a>
          </li>
          <li>
            <a href="/admin/announcements" className="text-gray-700 hover:text-blue-600 font-medium">
              Announcements
            </a>
          </li>
          <li>
            <a href="/staff/process-claims" className="text-gray-700 hover:text-blue-600 font-medium">
              Process Claims
            </a>
          </li>
        </>
      );
    }

    if (roles.includes("Staff")) {
      return (
        <>
          <li>
            <a href="/staff/process-claims" className="text-gray-700 hover:text-blue-600 font-medium">
              Process Claims
            </a>
          </li>
        </>
      );
    }

    if (roles.includes("Member")) {
      return (
        <>
          <li>
            <a href="/cart" className="text-gray-700 hover:text-blue-600 font-medium">
              Cart
            </a>
          </li>
          <li>
            <a href="/orders" className="text-gray-700 hover:text-blue-600 font-medium">
              My Orders
            </a>
          </li>
          <li>
            <a href="/bookmarks" className="text-gray-700 hover:text-blue-600 font-medium">
              Bookmarks
            </a>
          </li>
          <li>
            <a href="/announcements" className="text-gray-700 hover:text-blue-600 font-medium">
              Profile
            </a>
          </li>
        </>
      );
    }

    return null;
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <a href="/" className="text-2xl font-bold text-blue-600">
            BookStore
          </a>

          <nav className="w-full md:w-auto">
            <ul className="flex flex-wrap justify-center gap-6">
              <li>
                <a href="/" className="text-gray-700 hover:text-blue-600 font-medium">
                  All Books
                </a>
              </li>
              

              {/* Render Role-Based Links */}
              {renderRoleBasedLinks()}

              {/* Conditional render based on login status */}
              {!user ? (
                <li>
                  <a href="/login" className="text-gray-700 hover:text-blue-600 font-medium">
                    Login
                  </a>
                </li>
              ) : (
                <>
                  <li className="text-gray-700">
                    <span className="font-medium">Welcome, {user.firstName}!</span>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="text-gray-700 hover:text-blue-600 font-medium"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>

         
        </div>
      </div>
    </header>
  );
}
