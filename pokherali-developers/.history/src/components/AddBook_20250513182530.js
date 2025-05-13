import { useState, useRef } from "react";
import { X, Upload, Plus, Minus } from "lucide-react";

export default function AddBookModal({ isOpen, onClose, onSave }) {
  const [bookData, setBookData] = useState({
    title: "",
    author: "",
    description: "",
    price: "",
    stock: 0,
    genre: "",
    isbn: "",
    publisher: "",
    publishDate: "",
    language: "English",
    format: "Paperback",
    pages: "",
    dimensions: "",
    weight: "",
    imageUrl: "",
    discountPercentage: "",
    originalPrice: "",
    isOnSale: false,
    isBestseller: false,
    isNewRelease: false,
    discountStartDate: "",
    discountEndDate: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookData({
      ...bookData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleStockChange = (action) => {
    if (action === "increment") {
      setBookData({
        ...bookData,
        stock: bookData.stock + 1,
      });
    } else if (action === "decrement" && bookData.stock > 0) {
      setBookData({
        ...bookData,
        stock: bookData.stock - 1,
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const fileTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!fileTypes.includes(file.type)) {
      setErrors({
        ...errors,
        imageUrl: "Invalid file type. Only JPG, PNG and GIF files are allowed.",
      });
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors({
        ...errors,
        imageUrl: "File size exceeds 10MB limit.",
      });
      return;
    }

    setUploadedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Clear any previous image errors
    if (errors.imageUrl) {
      setErrors({
        ...errors,
        imageUrl: null,
      });
    }
  };

  // Image upload function
  const uploadImage = async (file) => {
    if (!file) return null;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log("Uploading image...");
      
      const response = await fetch('https://localhost:7126/api/Uploads/book-cover', {
        method: 'POST',
        body: formData,
      });
      
      console.log("Upload response status:", response.status);
      
      if (!response.ok) {
        const errorMessage = await response.text();
        console.error("Upload response error:", errorMessage);
        throw new Error(errorMessage || `Server returned ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Upload successful, received path:", result.filePath);
      return result.filePath;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields based on DTO
    if (!bookData.title.trim()) newErrors.title = "Title is required";
    if (!bookData.author.trim()) newErrors.author = "Author is required";
    if (!bookData.description.trim()) newErrors.description = "Description is required";
    if (!bookData.publisher.trim()) newErrors.publisher = "Publisher is required";
    if (!bookData.isbn.trim()) newErrors.isbn = "ISBN is required";
    if (!bookData.genre.trim()) newErrors.genre = "Genre is required";
    
    // Price validation
    if (!bookData.price.trim()) newErrors.price = "Price is required";
    else {
      const priceValue = Number.parseFloat(bookData.price);
      if (isNaN(priceValue)) newErrors.price = "Price must be a valid number";
      else if (priceValue < 0.01 || priceValue > 10000) newErrors.price = "Price must be between 0.01 and 10000";
    }

    // Discount percentage validation
    if (bookData.discountPercentage) {
      const discountValue = Number.parseFloat(bookData.discountPercentage);
      if (isNaN(discountValue)) newErrors.discountPercentage = "Discount must be a valid number";
      else if (discountValue < 0 || discountValue > 100) newErrors.discountPercentage = "Discount must be between 0 and 100";
    }

    // Pages validation
    if (bookData.pages) {
      const pagesValue = Number.parseInt(bookData.pages);
      if (isNaN(pagesValue) || pagesValue < 0) newErrors.pages = "Pages must be a positive number";
    }

    // Validate dimensions and weight
    if (bookData.dimensions && !/^\d+(\.\d+)?x\d+(\.\d+)?x\d+(\.\d+)?$/.test(bookData.dimensions)) {
      newErrors.dimensions = "Dimensions should be in format LxWxH (e.g., 5x7x2)";
    }
    if (bookData.weight && isNaN(Number.parseFloat(bookData.weight))) {
      newErrors.weight = "Weight must be a valid number";
    }

    // Validate discount dates
    if (bookData.isOnSale) {
      if (!bookData.discountPercentage) {
        newErrors.discountPercentage = "Discount percentage is required for sale items";
      }
      if (bookData.discountStartDate && bookData.discountEndDate) {
        const startDate = new Date(bookData.discountStartDate);
        const endDate = new Date(bookData.discountEndDate);
        if (startDate > endDate) {
          newErrors.discountEndDate = "End date must be after start date";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First upload the image if there is one
      let imageUrl = "";
      if (uploadedFile) {
        try {
          imageUrl = await uploadImage(uploadedFile);
          if (!imageUrl) {
            throw new Error("Server returned empty image path");
          }
        } catch (error) {
          setErrors({
            ...errors,
            imageUrl: error.message || "Failed to upload image. Please try again.",
          });
          setIsSubmitting(false);
          return; // Stop form submission if image upload fails
        }
      }

      // Prepare book data for submission
      const bookToSave = {
        title: bookData.title,
        author: bookData.author,
        description: bookData.description,
        price: parseFloat(bookData.price),
        stockQuantity: bookData.stock,
        genre: bookData.genre,
        isbn: bookData.isbn,
        publisher: bookData.publisher,
        publicationDate: bookData.publishDate ? new Date(bookData.publishDate).toISOString() : null,
        language: bookData.language,
        format: bookData.format,
        pages: bookData.pages ? parseInt(bookData.pages) : null,
        dimensions: bookData.dimensions || null,
        weight: bookData.weight || null,
        imageUrl: imageUrl,
        discountPercentage: bookData.discountPercentage ? parseFloat(bookData.discountPercentage) : null,
        originalPrice: bookData.originalPrice ? parseFloat(bookData.originalPrice) : null,
        isOnSale: bookData.isOnSale,
        isBestseller: bookData.isBestseller,
        isNewRelease: bookData.isNewRelease,
        discountStartDate: bookData.discountStartDate ? new Date(bookData.discountStartDate).toISOString() : null,
        discountEndDate: bookData.discountEndDate ? new Date(bookData.discountEndDate).toISOString() : null,
      };

      console.log("Submitting book data:", bookToSave);

      // Submit book data to API
      const response = await fetch("https://localhost:7126/api/Books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookToSave),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`Failed to save book: ${response.status} ${response.statusText}`);
      }

      const savedBook = await response.json();
      onSave(savedBook);
      onClose();
    } catch (error) {
      console.error("Error saving book:", error);
      setErrors({
        ...errors,
        form: "Failed to save the book. Please try again. " + error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Add New Book</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 max-h-[calc(90vh-120px)]">
          {errors.form && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-6">
                {/* Book Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Book Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={bookData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-base border ${
                      errors.title ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                  )}
                </div>

                {/* Author */}
                <div>
                  <label
                    htmlFor="author"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Author <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={bookData.author}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-base border ${
                      errors.author ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                  />
                  {errors.author && (
                    <p className="mt-1 text-sm text-red-500">{errors.author}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={bookData.description}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-base border ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                {/* Price and Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Price ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="price"
                      name="price"
                      value={bookData.price}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 text-base border ${
                        errors.price ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                      placeholder="0.00"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="stock"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Stock
                    </label>
                    <div className="flex">
                      <button
                        type="button"
                        onClick={() => handleStockChange("decrement")}
                        className="px-3 py-3 border border-gray-300 rounded-l-lg bg-gray-50 text-gray-600 hover:bg-gray-100"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="text"
                        id="stock"
                        name="stock"
                        value={bookData.stock}
                        readOnly
                        className="w-full text-center px-4 py-3 text-base border-t border-b border-gray-300 focus:ring-0 focus:border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleStockChange("increment")}
                        className="px-3 py-3 border border-gray-300 rounded-r-lg bg-gray-50 text-gray-600 hover:bg-gray-100"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Genre */}
                <div>
                  <label
                    htmlFor="genre"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Genre <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="genre"
                    name="genre"
                    value={bookData.genre}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-base border ${
                      errors.genre ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                  >
                    <option value="">Select Genre</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Non-fiction">Non-fiction</option>
                    <option value="Science">Science</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Fantasy">Fantasy</option>
                    <option value="Biography">Biography</option>
                    <option value="History">History</option>
                    <option value="Self-Help">Self-Help</option>
                    <option value="Business">Business</option>
                    <option value="Romance">Romance</option>
                    <option value="Thriller">Thriller</option>
                  </select>
                  {errors.genre && (
                    <p className="mt-1 text-sm text-red-500">{errors.genre}</p>
                  )}
                </div>

                {/* Dimensions */}
                <div>
                  <label
                    htmlFor="dimensions"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Dimensions (LxWxH)
                  </label>
                  <input
                    type="text"
                    id="dimensions"
                    name="dimensions"
                    value={bookData.dimensions}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-base border ${
                      errors.dimensions ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                    placeholder="e.g., 5x7x2"
                  />
                  {errors.dimensions && (
                    <p className="mt-1 text-sm text-red-500">{errors.dimensions}</p>
                  )}
                </div>

                {/* Weight */}
                <div>
                  <label
                    htmlFor="weight"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Weight (kg)
                  </label>
                  <input
                    type="text"
                    id="weight"
                    name="weight"
                    value={bookData.weight}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-base border ${
                      errors.weight ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                    placeholder="e.g., 0.5"
                  />
                  {errors.weight && (
                    <p className="mt-1 text-sm text-red-500">{errors.weight}</p>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {/* Book Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Book Cover Image
                  </label>
                  <div
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
                      errors.imageUrl ? "border-red-500" : "border-gray-300"
                    } border-dashed rounded-lg cursor-pointer`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewUrl ? (
                      <div className="w-full flex flex-col items-center">
                        <img
                          src={previewUrl}
                          alt="Book cover preview"
                          className="h-48 object-contain mb-2"
                        />
                        <p className="text-xs text-gray-500">
                          Click to change image
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none">
                            <span>Upload a file</span>
                            <input
                              ref={fileInputRef}
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              onChange={handleChange}
                            min="0"
                            max="100"
                            className={`w-full px-4 py-3 text-base border ${
                              errors.discountPercentage ? "border-red-500" : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                          />
                          {errors.discountPercentage && (
                            <p className="mt-1 text-sm text-red-500">{errors.discountPercentage}</p>
                          )}
                        </div>
                        
                        <div>
                          <label
                            htmlFor="originalPrice"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Original Price ($)
                          </label>
                          <input
                            type="number"
                            id="originalPrice"
                            name="originalPrice"
                            value={bookData.originalPrice}
                            onChange={handleChange}
                            step="0.01"
                            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="discountStartDate"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Discount Start Date
                          </label>
                          <input
                            type="date"
                            id="discountStartDate"
                            name="discountStartDate"
                            value={bookData.discountStartDate}
                            onChange={handleChange}
                            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                        
                        <div>
                          <label
                            htmlFor="discountEndDate"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Discount End Date
                          </label>
                          <input
                            type="date"
                            id="discountEndDate"
                            name="discountEndDate"
                            value={bookData.discountEndDate}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 text-base border ${
                              errors.discountEndDate ? "border-red-500" : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                          />
                          {errors.discountEndDate && (
                            <p className="mt-1 text-sm text-red-500">{errors.discountEndDate}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>={handleFileChange}
                              accept="image/jpeg,image/png,image/gif"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                  {errors.imageUrl && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.imageUrl}
                    </p>
                  )}
                </div>

                {/* ISBN */}
                <div>
                  <label
                    htmlFor="isbn"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ISBN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="isbn"
                    name="isbn"
                    value={bookData.isbn}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-base border ${
                      errors.isbn ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                  />
                  {errors.isbn && (
                    <p className="mt-1 text-sm text-red-500">{errors.isbn}</p>
                  )}
                </div>
                
                {/* Publisher and Publish Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="publisher"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Publisher <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="publisher"
                      name="publisher"
                      value={bookData.publisher}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 text-base border ${
                        errors.publisher ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                    />
                    {errors.publisher && (
                      <p className="mt-1 text-sm text-red-500">{errors.publisher}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="publishDate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Publish Date
                    </label>
                    <input
                      type="date"
                      id="publishDate"
                      name="publishDate"
                      value={bookData.publishDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Format and Language */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="format"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Format <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="format"
                      name="format"
                      value={bookData.format}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="Paperback">Paperback</option>
                      <option value="Hardcover">Hardcover</option>
                      <option value="E-book">E-book</option>
                      <option value="Audiobook">Audiobook</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="language"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Language
                    </label>
                    <select
                      id="language"
                      name="language"
                      value={bookData.language}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Italian">Italian</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Chinese">Chinese</option>
                    </select>
                  </div>
                </div>

                {/* Pages */}
                <div>
                  <label
                    htmlFor="pages"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Number of Pages
                  </label>
                  <input
                    type="number"
                    id="pages"
                    name="pages"
                    value={bookData.pages}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                
                {/* Discount section */}
                <div className="space-y-4 border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-md font-medium text-gray-700">Discount & Promotional Settings</h3>
                  
                  {/* Promotional flags */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isOnSale"
                        name="isOnSale"
                        checked={bookData.isOnSale}
                        onChange={handleChange}
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="isOnSale" className="ml-2 text-sm text-gray-700">
                        On Sale
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isBestseller"
                        name="isBestseller"
                        checked={bookData.isBestseller}
                        onChange={handleChange}
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="isBestseller" className="ml-2 text-sm text-gray-700">
                        Bestseller
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isNewRelease"
                        name="isNewRelease"
                        checked={bookData.isNewRelease}
                        onChange={handleChange}
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="isNewRelease" className="ml-2 text-sm text-gray-700">
                        New Release
                      </label>
                    </div>
                  </div>
                  
                  {/* Discount fields (show conditionally if isOnSale is true) */}
                  {bookData.isOnSale && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="discountPercentage"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Discount (%)
                          </label>
                          <input
                            type="number"
                            id="discountPercentage"
                            name="discountPercentage"
                            value={bookData.discountPercentage}
                            onChange