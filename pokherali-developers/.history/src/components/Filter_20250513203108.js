import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const Filters = ({ onChange, initialFilters = {} }) => {
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm || '');
  const [genre, setGenre] = useState(initialFilters.genres?.[0] || '');
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || 0);
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || 100);
  const [author, setAuthor] = useState(initialFilters.authors?.[0] || '');
  const [inStock, setInStock] = useState(initialFilters.inStock);
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || 'title');
  const [sortDescending, setSortDescending] = useState(initialFilters.sortDescending || false);
  
  // Common genres for books
  const genres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Thriller', 'Romance', 
    'Science Fiction', 'Fantasy', 'Biography', 'History', 'Self-Help'
  ];
  
  // Authors
  const authors = [
    'J.K. Rowling', 'Stephen King', 'J.R.R. Tolkien', 
    'George R.R. Martin', 'Agatha Christie'
  ];
  
  // Update parent component when filters change
  useEffect(() => {
    // Create filter object with the correct structure for backend
    const updatedFilters = {
      searchTerm,
      genres: genre ? [genre] : [],
      authors: author ? [author] : [],
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
      inStock,
      sortBy,
      sortDescending
    };
    
    onChange(updatedFilters);
  }, [searchTerm, genre, minPrice, maxPrice, author, inStock, sortBy, sortDescending, onChange]);
  
  // Reset all filters
  const clearFilters = () => {
    setSearchTerm('');
    setGenre('');
    setMinPrice(0);
    setMaxPrice(100);
    setAuthor('');
    setInStock(null);
    setSortBy('title');
    setSortDescending(false);
  };
  
  return (
    <div className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search books by title, author, or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>
      
      {/* Main Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Genre Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full border rounded py-1.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        
        {/* Author Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
          <select
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full border rounded py-1.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Authors</option>
            {authors.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        
        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max={maxPrice}
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="w-full border rounded py-1.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span>to</span>
            <input
              type="number"
              min={minPrice}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full border rounded py-1.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
          <select
            value={inStock === null ? '' : inStock ? 'in-stock' : 'out-of-stock'}
            onChange={(e) => {
              const value = e.target.value;
              setInStock(value === '' ? null : value === 'in-stock');
            }}
            className="w-full border rounded py-1.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="in-stock">In Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
      </div>
      
      {/* Sort Options */}
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded py-1 px-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="price">Price</option>
            <option value="publicationdate">Publication Date</option>
            <option value="popularity">Popularity</option>
          </select>
          <select
            value={sortDescending ? 'desc' : 'asc'}
            onChange={(e) => setSortDescending(e.target.value === 'desc')}
            className="border rounded py-1 px-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default Filters;