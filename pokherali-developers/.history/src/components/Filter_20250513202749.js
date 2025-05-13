import React, { useState, useEffect } from 'react';
import { Search, Filter as FilterIcon } from 'lucide-react';

const Filters = ({ onChange, initialFilters = {} }) => {
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm || '');
  const [selectedGenres, setSelectedGenres] = useState(initialFilters.genres || []);
  const [priceRange, setPriceRange] = useState([
    initialFilters.minPrice || 0,
    initialFilters.maxPrice || 200
  ]);
  const [selectedAuthors, setSelectedAuthors] = useState(initialFilters.authors || []);
  const [availability, setAvailability] = useState({
    inStock: initialFilters.inStock || null
  });
  const [sortOption, setSortOption] = useState({
    sortBy: initialFilters.sortBy || 'title',
    sortDescending: initialFilters.sortDescending || false
  });
  
  // Common genres for books
  const genres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Thriller', 'Romance', 
    'Science Fiction', 'Fantasy', 'Biography', 'History', 'Self-Help'
  ];
  
  // We would typically fetch these from the API in a real app
  const authors = [
    'J.K. Rowling', 'Stephen King', 'J.R.R. Tolkien', 
    'George R.R. Martin', 'Agatha Christie'
  ];
  
  // Apply filters when they change
  useEffect(() => {
    // Debounce filter changes
    const timer = setTimeout(() => {
      onChange({
        searchTerm,
        genres: selectedGenres,
        authors: selectedAuthors,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        inStock: availability.inStock,
        sortBy: sortOption.sortBy,
        sortDescending: sortOption.sortDescending
      });
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, selectedGenres, priceRange, selectedAuthors, availability, sortOption, onChange]);
  
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
      
      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Genre Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
          <select
            multiple={false}
            value={selectedGenres[0] || ''}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedGenres(value ? [value] : []);
            }}
            className="w-full border rounded py-1.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>
        
        {/* Author Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
          <select
            multiple={false}
            value={selectedAuthors[0] || ''}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedAuthors(value ? [value] : []);
            }}
            className="w-full border rounded py-1.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Authors</option>
            {authors.map((author) => (
              <option key={author} value={author}>{author}</option>
            ))}
          </select>
        </div>
        
        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price Range: ${priceRange[0]} - ${priceRange[1]}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max={priceRange[1]}
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="w-full border rounded py-1.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span>to</span>
            <input
              type="number"
              min={priceRange[0]}
              max="1000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full border rounded py-1.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
          <select
            value={availability.inStock === null ? '' : availability.inStock ? 'in-stock' : 'out-of-stock'}
            onChange={(e) => {
              const value = e.target.value;
              setAvailability({
                inStock: value === '' ? null : value === 'in-stock'
              });
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
          <FilterIcon size={18} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <select
            value={sortOption.sortBy}
            onChange={(e) => setSortOption({
              ...sortOption,
              sortBy: e.target.value
            })}
            className="border rounded py-1 px-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="price">Price</option>
            <option value="publicationdate">Publication Date</option>
            <option value="popularity">Popularity</option>
          </select>
          <select
            value={sortOption.sortDescending ? 'desc' : 'asc'}
            onChange={(e) => setSortOption({
              ...sortOption,
              sortDescending: e.target.value === 'desc'
            })}
            className="border rounded py-1 px-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        
        <button
          onClick={() => {
            // Reset all filters
            setSearchTerm('');
            setSelectedGenres([]);
            setPriceRange([0, 200]);
            setSelectedAuthors([]);
            setAvailability({ inStock: null });
            setSortOption({ sortBy: 'title', sortDescending: false });
          }}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default Filters;