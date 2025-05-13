import { useState, useEffect, useRef } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import axios from "axios";

export default function AddBookModal({ isOpen, onClose, onSave, book = null }) {
  const [formData, setFormData] = useState({
    title: "",
    isbn: "",
    description: "",
    author: "",
    publisher: "",
    genre: "",
    language: "",
    format: "",
    price: "",
    stock: "",
    imageUrl: "",
    pages: "",
    dimensions: "",
    weight: "",
    isBestseller: false,
    isNewRelease: false,
    isOnSale: false,
    discountPercentage: "",
    originalPrice: "",
    publicationDate: ""
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  
  // Create API client with withCredentials to send cookies
  const api = axios.create({
    baseURL: 'https://localhost:7126/api',
    withCredentials: true // This sends cookies with cross-origin requests
  });

  // Fill the form with book data if in edit mode
  useEffect(() => {
    if (book) {
      setFormData({
        id: book.id,
        title: book.title || "",
        isbn: book.isbn || "",
        description: book.description || "",
        author: book.author || "",
        publisher: book.publisher || "",
        genre: book.genre || "",
        language: book.language || "",
        format: book.format || "",
        price: book.price || "",
        stock: book.stock || "",
        imageUrl: book.imageUrl || "",
        pages: book.pages || "",
        dimensions: book.dimensions || "",
        weight: book.weight || "",
        isBestseller: book.isBestseller || false,
        isNewRelease: book.isNewRelease || false,
        isOnSale: book.isOnSale || false,
        discountPercentage: book.discountPercentage || "",
        originalPrice: book.originalPrice || "",
        publicationDate: book.publicationDate ? new Date(book.publicationDate).toISOString().split("T")[0] : ""
      });
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadingImage(true);

    try {
      // Use the API client with session cookies
      const response = await api.post("/Upload/book-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      console.log("Upload response status:", response.status);
      
      if (response.data && response.data.filePath) {
        console.log("Upload successful, received path:", response.data.filePath);
        setFormData(prev => ({
          ...prev,
          imageUrl: response.data.filePath
        }));
      } else {
        console.error("Upload response didn't contain expected data:", response.data);
        alert("Image upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      
      if (error.response) {
        console.error("Server response:", error.response.data);
        
        // Check for session authentication error
        if (error.response.status === 401) {
          alert("Your session has expired. Please log in again.");
        } else {
          alert(`Image upload failed: ${error.response.status}`);
        }
      } else {
        alert("Image upload failed. Please try again.");
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      imageUrl: ""
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Submitting book data:", formData);
      
      // Call the onSave function provided by the parent component
      await onSave(formData);
      
      // Reset form after successful save
      if (!book) { // Only reset if adding a new book, not editing
        setFormData({
          title: "",
          isbn: "",
          description: "",
          author: "",
          publisher: "",
          genre: "",
          language: "",
          format: "",
          price: "",
          stock: "",
          imageUrl: "",
          pages: "",
          dimensions: "",
          weight: "",
          isBestseller: false,
          isNewRelease: false,
          isOnSale: false,
          discountPercentage: "",
          originalPrice: "",
          publicationDate: ""
        });
      }
    } catch (error) {
      console.error("Error saving book:", error);
      throw new Error(`Failed to save book: ${error.response ? error.response.status : error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900" id="modal-headline">
              {book ? "Edit Book" : "Add New Book"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column - Basic info */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Author <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Stock <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="stock"
                      min="0"
                      value={formData.stock}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">ISBN</label>
                  <input
                    type="text"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    name="publicationDate"
                    value={formData.publicationDate}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Right column - Additional info & image */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Genre</label>
                    <input
                      type="text"
                      name="genre"
                      value={formData.genre}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Language
                    </label>
                    <input
                      type="text"
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Format
                    </label>
                    <input
                      type="text"
                      name="format"
                      value={formData.format}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Publisher
                    </label>
                    <input
                      type="text"
                      name="publisher"
                      value={formData.publisher}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Book Cover Image
                  </label>
                  <div className="mt-1 flex items-center">
                    {formData.imageUrl ? (
                      <div className="relative">
                        <img
                          src={formData.imageUrl}
                          alt="Book cover"
                          className="h-32 w-24 object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center"
                        >
                          {uploadingImage ? (
                            <span>Uploading...</span>
                          ) : (
                            <>
                              <Upload size={16} className="mr-2" />
                              <span>Upload Image</span>
                            </>
                          )}
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="bestseller"
                      name="isBestseller"
                      type="checkbox"
                      checked={formData.isBestseller}
                      onChange={handleChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="bestseller"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Bestseller
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="newRelease"
                      name="isNewRelease"
                      type="checkbox"
                      checked={formData.isNewRelease}
                      onChange={handleChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="newRelease"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      New Release
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="onSale"
                      name="isOnSale"
                      type="checkbox"
                      checked={formData.isOnSale}
                      onChange={handleChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="onSale" className="ml-2 block text-sm text-gray-700">
                      On Sale
                    </label>
                  </div>
                </div>

                {formData.isOnSale && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Discount %
                      </label>
                      <input
                        type="number"
                        name="discountPercentage"
                        min="0"
                        max="100"
                        value={formData.discountPercentage}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Original Price
                      </label>
                      <input
                        type="number"
                        name="originalPrice"
                        min="0"
                        step="0.01"
                        value={formData.originalPrice}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {loading ? "Saving..." : book ? "Update Book" : "Add Book"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}