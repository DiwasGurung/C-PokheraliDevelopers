"use client"

import { useState, useEffect, Fragment } from "react"
import axios from "axios"
import { PlusCircle, Search, Filter, ChevronLeft, ChevronRight, Trash2, Edit2, BookOpen, Loader2, ChevronDown } from 'lucide-react'
import AddBookModal from "./AddBook"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("inventory")
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false)
  const [isEditBookModalOpen, setIsEditBookModalOpen] = useState(false)
  const [editBook, setEditBook] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterGenre, setFilterGenre] = useState("")
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false)

  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalBooks, setTotalBooks] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [isPageSizeDropdownOpen, setIsPageSizeDropdownOpen] = useState(false)

  const api = axios.create({
    baseURL: "https://localhost:7126/api",
    withCredentials: true,
  })

  // Fetch books data with pagination and filtering
  const fetchBooks = async () => {
    setLoading(true)
    try {
      const response = await api.get("/Books", {
        params: {
          page,
          pageSize,
          search: searchQuery,
          genre: filterGenre === "all" ? "" : filterGenre,
        },
      })

      if (response.data && response.data.books) {
        setBooks(response.data.books)
        setTotalPages(response.data.totalPages || 1)
        setTotalBooks(response.data.totalCount || 0)
      } else {
        console.error("Unexpected API response format:", response.data)
        setBooks([])
      }
    } catch (error) {
      console.error("Error fetching books:", error)
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [page, pageSize, searchQuery, filterGenre])

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
        price: Number.parseFloat(newBook.price) || 0,
        stockQuantity: Number.parseInt(newBook.stock) || 0,
        language: newBook.language || "",
        format: newBook.format || "",
        genre: newBook.genre || "",
        imageUrl: newBook.imageUrl || "",
        pages: Number.parseInt(newBook.pages) || null,
        dimensions: newBook.dimensions || "",
        weight: newBook.weight || "",
        isBestseller: newBook.isBestseller || false,
        isNewRelease: newBook.isNewRelease || false,
        isOnSale: newBook.isOnSale || false,
        discountPercentage: Number.parseFloat(newBook.discountPercentage) || null,
        originalPrice: Number.parseFloat(newBook.originalPrice) || null,
        discountStartDate: newBook.discountStartDate || null,
        discountEndDate: newBook.discountEndDate || null,
      }

      const response = await api.post("/Books", bookData)

      if (response.data) {
        fetchBooks() // Refresh the book list
      }

      setIsAddBookModalOpen(false)
    } catch (error) {
      console.error("Error adding book:", error)
    }
  }

  // Handle Edit Book
  const handleEditBook = (book) => {
    setEditBook(book)
    setIsEditBookModalOpen(true)
  }

  // Handle Save Edited Book
  const saveEditedBook = async (updatedBook) => {
    try {
      await api.put(`/Books/${updatedBook.id}`, updatedBook)
      fetchBooks() // Refresh the book list
      setIsEditBookModalOpen(false)
    } catch (error) {
      console.error("Error updating book:", error)
    }
  }

  // Handle Delete Book
  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return
    }

    try {
      await api.delete(`/Books/${bookId}`)
      fetchBooks() // Refresh the book list
    } catch (error) {
      console.error("Error deleting book:", error)
    }
  }

  // Get unique genres for filter dropdown
  const genres = [...new Set(books.map((book) => book.genre).filter(Boolean))]

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isGenreDropdownOpen || isPageSizeDropdownOpen) {
        setIsGenreDropdownOpen(false)
        setIsPageSizeDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isGenreDropdownOpen, isPageSizeDropdownOpen])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-purple-600" />
                Admin Dashboard
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">Manage your bookstore inventory and orders</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="grid w-full grid-cols-2 h-auto bg-gray-100 dark:bg-gray-800 rounded-md p-1">
                <button
                  onClick={() => setActiveTab("inventory")}
                  className={`py-2 px-4 rounded-md transition-colors ${
                    activeTab === "inventory"
                      ? "bg-white dark:bg-gray-700 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  Inventory
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`py-2 px-4 rounded-md transition-colors ${
                    activeTab === "orders"
                      ? "bg-white dark:bg-gray-700 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  Orders
                </button>
              </div>
            </div>
          </div>

          {activeTab === "inventory" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Book Inventory</h2>
                    <button
                      onClick={() => setIsAddBookModalOpen(true)}
                      className="inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New Book
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <input
                        type="search"
                        placeholder="Search books..."
                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="w-full sm:w-[180px] relative">
                      <button
                        type="button"
                        className="flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
                      >
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          <span>{filterGenre ? filterGenre : "Filter by genre"}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </button>
                      {isGenreDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1 max-h-60 overflow-auto">
                          <button
                            className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => {
                              setFilterGenre("all")
                              setIsGenreDropdownOpen(false)
                            }}
                          >
                            All Genres
                          </button>
                          {genres.map((genre) => (
                            <button
                              key={genre}
                              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => {
                                setFilterGenre(genre)
                                setIsGenreDropdownOpen(false)
                              }}
                            >
                              {genre}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Title
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Author
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Price
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                              Stock
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                              Genre
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                              ISBN
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {loading ? (
                            <tr>
                              <td colSpan={7} className="px-6 py-4 whitespace-nowrap">
                                <div className="flex justify-center items-center">
                                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                                  <span className="ml-2">Loading books...</span>
                                </div>
                              </td>
                            </tr>
                          ) : books.length > 0 ? (
                            books.map((book) => (
                              <tr key={book.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                  {book.title}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {book.author}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {book.isOnSale ? (
                                    <div>
                                      <span className="line-through text-gray-500">${book.originalPrice?.toFixed(2)}</span>
                                      <span className="ml-2 font-medium text-green-600">${book.price.toFixed(2)}</span>
                                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                        {book.discountPercentage}% off
                                      </span>
                                    </div>
                                  ) : (
                                    <span>${book.price.toFixed(2)}</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    book.stock > 10
                                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                                      : book.stock > 0
                                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                      : "bg-red-100 text-red-800 border border-red-200"
                                  }`}>
                                    {book.stock} in stock
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                                  {book.genre}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                                  {book.isbn}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => handleEditBook(book)}
                                      className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                      <span className="sr-only">Edit</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteBook(book.id)}
                                      className="inline-flex items-center justify-center rounded-md border border-red-200 dark:border-red-800 bg-white dark:bg-gray-700 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Delete</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                                No books found matching your criteria.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Showing <span className="font-medium">{books.length}</span> of{" "}
                      <span className="font-medium">{totalBooks}</span> books
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className={`inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1 text-sm font-medium text-gray-500 dark:text-gray-400 ${
                          page === 1
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                        }`}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous Page</span>
                      </button>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Page {page} of {totalPages}
                      </div>
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className={`inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1 text-sm font-medium text-gray-500 dark:text-gray-400 ${
                          page === totalPages
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                        }`}
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next Page</span>
                      </button>
                      <div className="relative">
                        <button
                          type="button"
                          className="inline-flex items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                          onClick={() => setIsPageSizeDropdownOpen(!isPageSizeDropdownOpen)}
                        >
                          {pageSize} per page
                          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                        </button>
                        {isPageSizeDropdownOpen && (
                          <div className="absolute right-0 z-10 mt-1 w-36 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1">
                            {[5, 10, 20, 50].map((size) => (
                              <button
                                key={size}
                                className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => {
                                  setPageSize(size)
                                  setPage(1) // Reset to first page when changing page size
                                  setIsPageSizeDropdownOpen(false)
                                }}
                              >
                                {size} per page
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Orders Management</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-center h-40 text-gray-500 dark:text-gray-400">
                    Orders management functionality coming soon...
                  </div>
                </div>
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
  )
}
