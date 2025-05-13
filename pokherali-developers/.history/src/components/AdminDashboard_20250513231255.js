import { useState, useEffect } from "react";
import axios from "axios";
import {
  PlusCircle,
  BookOpen,
  ShoppingBag,
  BarChart3,
  Filter,
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

  // Fetch books and orders data
  useEffect(() => {
    // Fetch Books data
    const fetchBooks = async () => {
      try {
        const response = await api.get("/Books", {
          params: { pageNumber: 1, pageSize: 100 }, // Example pagination params
        });

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

    // Fetch Orders data
    const fetchOrders = async () => {
      try {
        const response = await api.get("/Orders");

        if (response.data) {
          setOrders(response.data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]); // Fallback to empty array if an error occurs
      }
    };

    fetchBooks();
    fetchOrders();
    setLoading(false);
  }, []);

  // Handle Add Book
  const handleAddBook = async (newBook) => {
    try {
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

      // Create the book using the API
      const response = await api.post("/Books", bookData);

      // Add the newly created book to the list
      if (response.data) {
        setBooks([...books, response.data]);
      }

      setIsAddBookModalOpen(false);
      alert("Book added successfully!");
    } catch (error) {
      console.error("Error adding book:", error);
      alert("Error adding book. Please try again.");
    }
  };

  // Handle Edit Book
  const handleEditBook = (book) => {
    setEditBook(book);
    setIsEditBookModalOpen(true);
  };

  // Handle Delete Book
  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      await api.delete(`/Books/${bookId}`);
      setBooks(books.filter((book) => book.id !== bookId));
      alert("Book deleted successfully!");
    } catch (error) {
      console.error("Error deleting book:", error);
      alert("Error deleting book. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-gray-600">Manage your bookstore inventory and orders</p>
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
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Books</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">{books.length}</h2>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BookOpen size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">
                  {books.filter((item) => item.stockQuantity < 20).length}
                </h2>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <Filter size={24} className="text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Recent Orders</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">{orders.length}</h2>
              </div>
              <div className="p-3 bg-teal-100 rounded-full">
                <ShoppingBag size={24} className="text-teal-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Tab */}
        {activeTab === "inventory" && (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900">Book Inventory</h2>
            <div className="overflow-x-auto mt-4">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3.5 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="text-left py-3.5 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="text-left py-3.5 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="text-left py-3.5 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {books.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">{book.title}</td>
                      <td className="py-4 px-6 text-sm text-gray-500">{book.stockQuantity}</td>
                      <td className="py-4 px-6 text-sm text-gray-500">${book.price.toFixed(2)}</td>
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

      {/* Add Book Modal */}
      <AddBookModal
        isOpen={isAddBookModalOpen}
        onClose={() => setIsAddBookModalOpen(false)}
        onSave={handleAddBook}
      />

      {/* Edit Book Modal
      {isEditBookModalOpen && (
        <AddBookModal
          isOpen={isEditBookModalOpen}
          onClose={() => setIsEditBookModalOpen(false)}
          onSave={saveEditedBook}
          book={editBook}
        />
      )} */}
    </div>
  );
}
