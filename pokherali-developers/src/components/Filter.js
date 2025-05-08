
import { useState, useEffect } from "react"
import { ChevronDown, X, Star, Search } from "lucide-react"

export default function Filters({ onChange, initialFilters = {} }) {
  // Main filter states - simplified to essential filters
  const [filters, setFilters] = useState({
    genre: initialFilters.genre || "",
    priceRange: initialFilters.priceRange || [0, 100],
    rating: initialFilters.rating || 0,
    availability: initialFilters.availability || {
      inStock: false,
    },
  })

  // UI states
  const [openDropdown, setOpenDropdown] = useState(null)
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false)
  const [activeFilterCount, setActiveFilterCount] = useState(0)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest(".filter-dropdown")) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [openDropdown])

  // Update parent component when filters change
  useEffect(() => {
    onChange(filters)

    // Calculate active filter count
    let count = 0
    if (filters.genre) count++
    if (filters.rating > 0) count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100) count++
    if (filters.availability.inStock) count++

    setActiveFilterCount(count)
  }, [filters, onChange])

  // Toggle dropdown
  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown)
  }

  // Handle filter changes
  const handleGenreChange = (e) => {
    setFilters({ ...filters, genre: e.target.value })
  }

  const handlePriceChange = (e) => {
    const value = Number.parseInt(e.target.value)
    const newRange = [...filters.priceRange]
    if (e.target.id === "min-price") {
      newRange[0] = value
    } else {
      newRange[1] = value
    }
    setFilters({ ...filters, priceRange: newRange })
  }

  const handleRatingChange = (value) => {
    setFilters({ ...filters, rating: value })
  }

  const handleAvailabilityChange = () => {
    setFilters({
      ...filters,
      availability: {
        inStock: !filters.availability.inStock,
      },
    })
  }

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      genre: "",
      priceRange: [0, 100],
      rating: 0,
      availability: {
        inStock: false,
      },
    })
  }

  // Render star rating selector
  const renderStarRating = () => {
    return (
      <div className="flex items-center gap-2 mb-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} type="button" onClick={() => handleRatingChange(value)} className="focus:outline-none">
            <Star
              size={20}
              className={`${
                value <= filters.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
              } hover:text-yellow-400 transition-colors`}
            />
          </button>
        ))}
        {filters.rating > 0 && (
          <button onClick={() => handleRatingChange(0)} className="ml-1 text-sm text-gray-500 hover:text-gray-700">
            Clear
          </button>
        )}
      </div>
    )
  }

  // Genres list
  const genres = [
    "Fiction",
    "Non-fiction",
    "Science",
    "Mystery",
    "Fantasy",
    "Biography",
    "History",
    "Self-Help",
    "Business",
    "Romance",
    "Thriller",
  ]

  return (
    <div className="w-full">
      {/* Horizontal filter bar */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {/* Search field */}
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search books..."
            className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full text-base"
          />
        </div>

        {/* Genre filter */}
        <div className="relative filter-dropdown min-w-[180px]">
          <select
            value={filters.genre}
            onChange={handleGenreChange}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base appearance-none bg-white"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown size={20} className="text-gray-500" />
          </div>
        </div>

        {/* Price range filter */}
        <div className="relative filter-dropdown">
          <button
            onClick={() => toggleDropdown("price")}
            className="flex items-center justify-between gap-2 px-4 py-3 rounded-lg text-base font-medium bg-white border border-gray-300 min-w-[150px]"
          >
            <span>
              {filters.priceRange[0] > 0 || filters.priceRange[1] < 100
                ? `$${filters.priceRange[0]}-$${filters.priceRange[1]}`
                : "Price"}
            </span>
            <ChevronDown size={20} className={`transition-transform ${openDropdown === "price" ? "rotate-180" : ""}`} />
          </button>

          {openDropdown === "price" && (
            <div className="absolute z-40 mt-1 w-64 rounded-lg bg-white shadow-lg border border-gray-200 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-base text-gray-600">${filters.priceRange[0]}</span>
                  <span className="text-base text-gray-600">${filters.priceRange[1]}</span>
                </div>
                <div className="flex flex-col gap-4">
                  <input
                    type="range"
                    id="min-price"
                    min="0"
                    max="100"
                    value={filters.priceRange[0]}
                    onChange={handlePriceChange}
                    className="w-full h-2 accent-purple-600"
                  />
                  <input
                    type="range"
                    id="max-price"
                    min="0"
                    max="100"
                    value={filters.priceRange[1]}
                    onChange={handlePriceChange}
                    className="w-full h-2 accent-purple-600"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rating filter */}
        <div className="relative filter-dropdown">
          <button
            onClick={() => toggleDropdown("rating")}
            className="flex items-center justify-between gap-2 px-4 py-3 rounded-lg text-base font-medium bg-white border border-gray-300 min-w-[150px]"
          >
            <span>{filters.rating ? `${filters.rating}+ Stars` : "Rating"}</span>
            <ChevronDown
              size={20}
              className={`transition-transform ${openDropdown === "rating" ? "rotate-180" : ""}`}
            />
          </button>

          {openDropdown === "rating" && (
            <div className="absolute z-40 mt-1 w-56 rounded-lg bg-white shadow-lg border border-gray-200 p-4">
              {renderStarRating()}
            </div>
          )}
        </div>

        {/* In Stock filter */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="inStock"
            checked={filters.availability.inStock}
            onChange={handleAvailabilityChange}
            className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="inStock" className="ml-2 text-base text-gray-700">
            In Stock Only
          </label>
        </div>

        {/* Reset filters button */}
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="px-4 py-3 text-base font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Active filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.genre && (
            <div className="inline-flex items-center rounded-full bg-purple-50 py-1 pl-3 pr-2 text-sm font-medium text-purple-700">
              Genre: {filters.genre}
              <button
                type="button"
                onClick={() => setFilters({ ...filters, genre: "" })}
                className="ml-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-purple-600 hover:bg-purple-200 hover:text-purple-500 focus:outline-none"
              >
                <span className="sr-only">Remove filter for {filters.genre}</span>
                <X size={14} />
              </button>
            </div>
          )}
          {filters.rating > 0 && (
            <div className="inline-flex items-center rounded-full bg-purple-50 py-1 pl-3 pr-2 text-sm font-medium text-purple-700">
              {filters.rating}+ Stars
              <button
                type="button"
                onClick={() => setFilters({ ...filters, rating: 0 })}
                className="ml-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-purple-600 hover:bg-purple-200 hover:text-purple-500 focus:outline-none"
              >
                <span className="sr-only">Remove rating filter</span>
                <X size={14} />
              </button>
            </div>
          )}
          {(filters.priceRange[0] > 0 || filters.priceRange[1] < 100) && (
            <div className="inline-flex items-center rounded-full bg-purple-50 py-1 pl-3 pr-2 text-sm font-medium text-purple-700">
              Price: ${filters.priceRange[0]}-${filters.priceRange[1]}
              <button
                type="button"
                onClick={() => setFilters({ ...filters, priceRange: [0, 100] })}
                className="ml-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-purple-600 hover:bg-purple-200 hover:text-purple-500 focus:outline-none"
              >
                <span className="sr-only">Remove price filter</span>
                <X size={14} />
              </button>
            </div>
          )}
          {filters.availability.inStock && (
            <div className="inline-flex items-center rounded-full bg-purple-50 py-1 pl-3 pr-2 text-sm font-medium text-purple-700">
              In Stock Only
              <button
                type="button"
                onClick={() => setFilters({ ...filters, availability: { inStock: false } })}
                className="ml-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-purple-600 hover:bg-purple-200 hover:text-purple-500 focus:outline-none"
              >
                <span className="sr-only">Remove in stock filter</span>
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
