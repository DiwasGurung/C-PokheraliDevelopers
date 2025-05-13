import { useState, useEffect } from "react";
import axios from "axios";
import {
  PlusCircle,
  BookOpen,
  ShoppingBag,
  BarChart3,
  Search,
  Filter,
  ChevronDown,
  Download,
} from "lucide-react";
import AddBookModal from "./AddBook"; // Modal to add new books

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isEditBookModalOpen, setIsEditBookModalOpen] = useState(false);
  const [editBook, setEditBook] = useState(null); // Store the book being edited

  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Setup axios instance with auth
  const api = axios.create({
    baseURL: "https://localhost:7126/api",
    withCredentials: true, // Important for sending auth cookies
  });

  // Add auth token to requests if available
  api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  });

  // Fetch books and orders data
  useEffect(() => {
    // For AdminDashboard.js
// For AdminDashboard.js - just the fetchBooks function
const fetchBooks = async () => {
  try {
    // Simplified params object with only the essential parameters
    const params = {
      pageNumber: 1,
      pageSize: 100
    };
    
    const response = await api.get("/Books", { params });

    

    console.log("Books API response:", response.data);

    if (response.data && response.data.items) {
      setBooks(response.data.items);
    } else {
      console.error("API response is not valid:", response.data);
    }
  } catch (error) {
    console.error("Error fetching books:", error);
    if (error.response) {
      console.error("Error details:", error.response.data);
    }
  }
};
    const fetchOrders = async () => {
      try {
        const response = await api.get("api/Orders");
        setOrders(response.data || []); // Fallback to empty array if null
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]); // Set empty array on error
      }
    };

    fetchBooks();
    fetchOrders();
    setLoading(false);
  }, []);

  // Handle Add Book
  const handleAddBook = async (newBook) => {
    try {
      // Format the data according to CreateBookDto
      const bookData = {
        title: newBook.title,
        isbn: newBook.isbn || "",
        description: newBook.description || "",
        author: newBook.author || "",
        publisher: newBook.publisher || "",
        publicationDate: newBook.publicationDate || null,
        price: parseFloat(newBook.price) || 0,
        stockQuantity: parseInt(newBook.stock) || 0,
        language: newBook.language || "",
        format: newBook.format || "",
        genre: newBook.genre || "",
        imageUrl: newBook.imageUrl || "",
        pages: parseInt(newBook.pages) || null,
        dimensions: newBook.dimensions || "",
        weight: newBook.weight || "",
        isBestseller: newBook.isBestseller || false,
        isNewRelease: newBook.isNewRelease || false,
        isOnSale: newBook.isOnSale || false,
        discountPercentage: parseFloat(newBook.discountPercentage) || null,
        originalPrice: parseFloat(newBook.originalPrice) || null,
        discountStartDate: newBook.discountStartDate || null,
        discountEndDate: newBook.discountEndDate || null,
      };

      console.log("Sending book data:", bookData);

      // Create the book using the API
      const response = await api.post("/Books", bookData);

      console.log("Book created:", response.data);

      // Add the newly created book to the list
      if (response.data) {
        setBooks([...books, response.data]);
      }

      // Close the modal
      setIsAddBookModalOpen(false);

      // Show success message
      alert("Book added successfully!");
    } catch (error) {
      console.error("Error adding book:", error);
      if (error.response) {
        console.error("Error details:", error.response.data);
      }
      alert("Error adding book. Please try again.");
    }
  };

  // Handle Edit Book
  const handleEditBook = (book) => {
    // Format the book data for the edit modal
    const formattedBook = {
      id: book.id,
      title: book.title,
      isbn: book.isbn || "",
      description: book.description || "",
      author: book.author || "",
      publisher: book.publisher || "",
      publicationDate: book.publicationDate || null,
      price: book.price,
      stock: book.stockQuantity,
      language: book.language || "",
      format: book.format || "",
      genre: book.genre || "",
      imageUrl: book.imageUrl || "",
      pages: book.pages || null,
      dimensions: book.dimensions || "",
      weight: book.weight || "",
      isBestseller: book.isBestseller || false,
      isNewRelease: book.isNewRelease || false,
      isOnSale: book.isOnSale || false,
      discountPercentage: book.discountPercentage || null,
      originalPrice: book.originalPrice || null,
      discountStartDate: book.discountStartDate || null,
      discountEndDate: book.discountEndDate || null,
    };

    setEditBook(formattedBook);
    setIsEditBookModalOpen(true);
  };

  // Handle Save Edited Book
  const saveEditedBook = async (updatedBook) => {
    try {
      // Format the data according to UpdateBookDto
      const bookData = {
        title: updatedBook.title,
        isbn: updatedBook.isbn,
        description: updatedBook.description,
        author: updatedBook.author,
        publisher: updatedBook.publisher,
        publicationDate: updatedBook.publicationDate,
        price: parseFloat(updatedBook.price),
        stockQuantity: parseInt(updatedBook.stock),
        language: updatedBook.language,
        format: updatedBook.format,
        genre: updatedBook.genre,
        imageUrl: updatedBook.imageUrl,
        pages: parseInt(updatedBook.pages) || null,
        dimensions: updatedBook.dimensions,
        weight: updatedBook.weight,
        isBestseller: updatedBook.isBestseller,
        isNewRelease: updatedBook.isNewRelease,
        isOnSale: updatedBook.isOnSale,
        discountPercentage: parseFloat(updatedBook.discountPercentage) || null,
        originalPrice: parseFloat(updatedBook.originalPrice) || null,
        discountStartDate: updatedBook.discountStartDate,
        discountEndDate: updatedBook.discountEndDate,
      };

      console.log("Updating book:", updatedBook.id, bookData);

      // Update the book using the API
      await api.put(`/Books/${updatedBook.id}`, bookData);

      // Update the books list
      setBooks(
        books.map((book) =>
          book.id === updatedBook.id
            ? {
                ...book,
                ...bookData,
                stockQuantity: bookData.stockQuantity, // Make sure to update stock with the new property name
                price: bookData.price,
              }
            : book
        )
      );

      // Close the modal
      setIsEditBookModalOpen(false);

      // Show success message
      alert("Book updated successfully!");
    } catch (error) {
      console.error("Error updating book:", error);
      if (error.response) {
        console.error("Error details:", error.response.data);
      }
      alert("Error updating book. Please try again.");
    }
  };

  // Handle Delete Book
  const handleDeleteBook = async (bookId) => {
    // Confirm deletion
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      console.log("Deleting book:", bookId);

      // Delete the book using the API
      await api.delete(`/Books/${bookId}`);

      // Remove the book from the list
      setBooks(books.filter((book) => book.id !== bookId));

      // Show success message
      alert("Book deleted successfully!");
    } catch (error) {
      console.error("Error deleting book:", error);
      if (error.response) {
        console.error("Error details:", error.response.data);
      }
      alert("Error deleting book. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-gray-600">
              Manage your bookstore inventory and orders
            </p>
          </div>
          <button
            onClick={() => setIsAddBookModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700 transition-colors shadow-sm font-medium"
          >
            <PlusCircle size={18} />
            <span>Add New Book</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Display Total Books */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Books</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">
                  {books.length}
                </h2>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BookOpen size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">
                  {Array.isArray(books) &&
                    books.filter((item) => item.stockQuantity < 20).length}
                </h2>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <Filter size={24} className="text-amber-600" />
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Recent Orders
                </p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">
                  {orders.length}
                </h2>
              </div>
              <div className="p-3 bg-teal-100 rounded-full">
                <ShoppingBag size={24} className="text-teal-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap border-b border-gray-200">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex items-center gap-2 py-3 px-6 font-medium text-sm transition-colors ${
                activeTab === "inventory"
                  ? "border-b-2 border-purple-600 text-purple-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
              }`}
            >
              <BookOpen size={18} />
              <span>Inventory</span>
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 py-3 px-6 font-medium text-sm transition-colors ${
                activeTab === "orders"
                  ? "border-b-2 border-purple-600 text-purple-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
              }`}
            >
              <ShoppingBag size={18} />
              <span>Orders</span>
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 py-3 px-6 font-medium text-sm transition-colors ${
                activeTab === "analytics"
                  ? "border-b-2 border-purple-600 text-purple-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
              }`}
            >
              <BarChart3 size={18} />
              <span>Analytics</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Book Inventory
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage your book inventory
              </p>

              <div className="overflow-x-auto mt-4">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-3.5 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="text-left py-3.5 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="text-left py-3.5 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="text-left py-3.5 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {books.map((book) => (
                      <tr
                        key={book.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6 text-sm font-medium text-gray-900">
                          {book.title}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          {book.stockQuantity}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          ${book.price.toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleEditBook(book)}
                            className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Book Modal */}
      <AddBookModal
        isOpen={isAddBookModalOpen}
        onClose={() => setIsAddBookModalOpen(false)}
        onSave={handleAddBook}
      />

      {/* Edit Book Modal */}
      {isEditBookModalOpen && (
        <AddBookModal
          isOpen={isEditBookModalOpen}
          onClose={() => setIsEditBookModalOpen(false)}
          onSave={saveEditedBook}
          book={editBook}
        />
      )}
    </div>
  );
}
