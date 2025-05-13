import { useState, useEffect } from "react";
import axios from "axios";
import { PlusCircle } from "lucide-react"; // Import PlusCircle
import AddBookModal from "./AddBook"; // Modal to add new books

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isEditBookModalOpen, setIsEditBookModalOpen] = useState(false);
  const [editBook, setEditBook] = useState(null); // Store the book being edited

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); // Pagination state
  const [totalPages, setTotalPages] = useState(1); // Total pages for pagination

  const api = axios.create({
    baseURL: "https://localhost:7126/api",
    withCredentials: true,
  });

  // Fetch books data with pagination
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await api.get("/Books", {
        params: {
          page: page,
          pageSize: 10, // Adjust pageSize as necessary
        },
      });
      console.log("Books fetched:", response.data);

      // Ensure we're parsing the response correctly
      if (response.data && response.data.books) {
        setBooks(response.data.books); // Set the books data
        setTotalPages(response.data.totalPages || 1); // Set total pages for pagination
      } else {
        console.error("Unexpected API response format:", response.data);
        setBooks([]);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      setBooks([]); // Fallback to an empty array if there's an error
    } finally {
      setLoading(false); // Set loading to false after the fetch
    }
  };

  useEffect(() => {
    fetchBooks(); // Fetch books when the page changes
  }, [page]);

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

      const response = await api.post("/Books", bookData);

      if (response.data) {
        setBooks([...books, response.data]); // Add the newly created book to the list
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
    setEditBook(book); // Set the book being edited
    setIsEditBookModalOpen(true); // Open the edit modal
  };

  // Handle Save Edited Book
  const saveEditedBook = async (updatedBook) => {
    try {
      const response = await api.put(`/Books/${updatedBook.id}`, updatedBook);
      console.log("Book updated:", response.data);
      setBooks(books.map(book => book.id === updatedBook.id ? updatedBook : book)); // Update the book in the list
      setIsEditBookModalOpen(false); // Close the edit modal
      alert("Book updated successfully!");
    } catch (error) {
      console.error("Error updating book:", error);
      alert("Error updating book. Please try again.");
    }
  };

  // Handle Delete Book
  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      await api.delete(`/Books/${bookId}`);
      setBooks(books.filter((book) => book.id !== bookId)); // Remove book from the list
      alert("Book deleted successfully!");
    } catch (error) {
      console.error("Error deleting book:", error);
      alert("Error deleting book. Please try again.");
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
            <PlusCircle size={18} /> {/* Add the PlusCircle icon */}
            <span>Add New Book</span>
          </button>
        </div>

        {/* Books Display in Table Format */}
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
            <p className="mt-2">Loading books...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Author</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Stock</th>
                  <th className="px-4 py-2 text-left">Genre</th>
                  <th className="px-4 py-2 text-left">ISBN</th>
                  <th className="px-4 py-2 text-left">Dimensions</th>
                  <th className="px-4 py-2 text-left">Weight</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.length > 0 ? (
                  books.map((book) => (
                    <tr key={book.id} className="border-b">
                      <td className="px-4 py-2">{book.title}</td>
                      <td className="px-4 py-2">{book.author}</td>
                      <td className="px-4 py-2">${book.price.toFixed(2)}</td>
                      <td className="px-4 py-2">{book.stoc}</td>
                      <td className="px-4 py-2">{book.genre}</td>
                      <td className="px-4 py-2">{book.isbn}</td>
                      <td className="px-4 py-2">{book.dimensions}</td>
                      <td className="px-4 py-2">{book.weight}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleEditBook(book)}
                          className="text-sm font-medium text-purple-600 hover:text-purple-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="text-sm font-medium text-red-600 hover:text-red-800 ml-4"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center px-4 py-2 text-gray-500">
                      No books found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="bg-gray-200 px-4 py-2 rounded mx-2 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="bg-gray-200 px-4 py-2 rounded mx-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
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
