import { useState, useEffect } from "react";
import axios from "axios";
import { PlusCircle, BookOpen, ShoppingBag, BarChart3, Search, Filter, ChevronDown, Download } from "lucide-react";
import AddBookModal from "./AddBook"; // Modal to add new books

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isEditBookModalOpen, setIsEditBookModalOpen] = useState(false);
  const [editBook, setEditBook] = useState(null); // Store the book being edited

  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch books and orders data
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get("https://localhost:7126/api/Books", {
          params: {
            page: 1, // Set default page
            pageSize: 10 // Set default page size
          }
        });

        if (response.data && Array.isArray(response.data.books)) {
          setBooks(response.data.books); // Set the books state with the books array
        } else {
          console.error("API response is not valid:", response.data);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await axios.get("https://localhost:7126/api/Orders");
        setOrders(response.data); // Assuming response contains list of orders
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchBooks();
    fetchOrders();
    setLoading(false);
  }, []);

  // Handle Add Book
  const handleAddBook = (newBook) => {
    const newId = Math.max(...books.map((item) => item.id)) + 1;
    setBooks([...books, { id: newId, ...newBook }]);
  };

  // Handle Edit Book
  const handleEditBook = (book) => {
    setEditBook(book); // Set the book data to be edited
    setIsEditBookModalOpen(true); // Open the Edit Book modal
  };

  // Handle Save Edited Book
  const saveEditedBook = async (updatedBook) => {
    try {
      const response = await axios.put(`https://localhost:7126/api/Books/${updatedBook.id}`, updatedBook);
      // Update the books list after successful update
      setBooks(books.map(book => book.id === updatedBook.id ? updatedBook : book));
      setIsEditBookModalOpen(false); // Close the modal
      alert("Book updated successfully!");
    } catch (error) {
      console.error("Error updating book:", error);
      alert("Error updating book");
    }
  };

  // Handle Delete Book
  const handleDeleteBook = async (bookId) => {
    try {
      await axios.delete(`https://localhost:7126/api/Books/${bookId}`);
      // Remove the book from the list after successful delete
      setBooks(books.filter(book => book.id !== bookId));
      alert("Book deleted successfully!");
    } catch (error) {
      console.error("Error deleting book:", error);
      alert("Error deleting book");
    }
  };

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
          {/* Display Total Books */}
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

          {/* Low Stock */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">
                  {Array.isArray(books) && books.filter((item) => item.stock < 20).length}
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
                <p className="text-sm font-medium text-gray-500">Recent Orders</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">{orders.length}</h2>
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
              <h2 className="text-xl font-semibold text-gray-900">Book Inventory</h2>
              <p className="text-sm text-gray-500 mt-1">Manage your book inventory</p>

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
                      <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-sm font-medium text-gray-900">{book.title}</td>
                        <td className="py-4 px-6 text-sm text-gray-500">{book.stock}</td>
                        <td className="py-4 px-6 text-sm text-gray-500">${book.price.toFixed(2)}</td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleEditBook(book)}
                            className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
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
      <AddBookModal isOpen={isAddBookModalOpen} onClose={() => setIsAddBookModalOpen(false)} onSave={handleAddBook} />
      
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
