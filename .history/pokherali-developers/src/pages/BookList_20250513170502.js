import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bookService } from '../services/api';

const BookList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  // State for filters and sorting
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    format: '',
    language: '',
    isOnSale: false,
  });

  // Get current page from URL or default to 1
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || '';

  useEffect(() => {
    loadBooks();
  }, [currentPage, searchQuery, sortBy, filters]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getBooks(
        currentPage,
        12, // items per page
        searchQuery,
        sortBy,
        filters
      );
      setBooks(response.data.items);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const search = formData.get('search');
    setSearchParams({ ...Object.fromEntries(searchParams), search, page: 1 });
  };

  const handleSort = (e) => {
    const sort = e.target.value;
    setSearchParams({ ...Object.fromEntries(searchParams), sort, page: 1 });
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFilters(prev => ({ ...prev, [name]: newValue }));
    setSearchParams({ ...Object.fromEntries(searchParams), page: 1 });
  };

  const handlePageChange = (page) => {
    setSearchParams({ ...Object.fromEntries(searchParams), page });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4">
      {/* Search and Filters Section */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-4">
            <input
              type="text"
              name="search"
              placeholder="Search books..."
              className="flex-1 p-2 border rounded"
              defaultValue={searchQuery}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Search
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={handleSort}
            className="p-2 border rounded"
          >
            <option value="">Sort By</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="title_asc">Title: A to Z</option>
            <option value="title_desc">Title: Z to A</option>
            <option value="newest">Newest First</option>
          </select>

          {/* Price Range Filters */}
          <div className="flex gap-2">
            <input
              type="number"
              name="minPrice"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="w-1/2 p-2 border rounded"
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="w-1/2 p-2 border rounded"
            />
          </div>

          {/* Format Filter */}
          <select
            name="format"
            value={filters.format}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="">All Formats</option>
            <option value="Hardcover">Hardcover</option>
            <option value="Paperback">Paperback</option>
            <option value="E-book">E-book</option>
          </select>

          {/* Language Filter */}
          <select
            name="language"
            value={filters.language}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="">All Languages</option>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            {/* Add more languages as needed */}
          </select>

          {/* On Sale Filter */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isOnSale"
              checked={filters.isOnSale}
              onChange={handleFilterChange}
              className="form-checkbox"
            />
            <span>On Sale</span>
          </label>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map(book => (
          <div
            key={book.id}
            className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => navigate(`/books/${book.id}`)}
          >
            <img
              src={book.imageUrl || '/placeholder-book.jpg'}
              alt={book.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{book.title}</h3>
              <p className="text-gray-600 mb-2">{book.author}</p>
              <div className="flex justify-between items-center">
                <div>
                  {book.isOnSale && book.discountPercentage ? (
                    <div className="flex items-center gap-2">
                      <span className="text-red-500 font-bold">
                        ${(book.price * (1 - book.discountPercentage / 100)).toFixed(2)}
                      </span>
                      <span className="text-gray-500 line-through">
                        ${book.price.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="font-bold">${book.price.toFixed(2)}</span>
                  )}
                </div>
                {book.isOnSale && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                    {book.discountPercentage}% OFF
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`px-4 py-2 border rounded ${
                currentPage === index + 1 ? 'bg-blue-500 text-white' : ''
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BookList; 