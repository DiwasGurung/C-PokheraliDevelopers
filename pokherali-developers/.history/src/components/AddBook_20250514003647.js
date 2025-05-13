import { useState, useEffect, useRef } from "react";
import { X, Upload, Plus, Minus } from "lucide-react";

export default function AddBookModal({ isOpen, onClose, onSave, book }) {
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

  // Pre-fill form fields when editing
  useEffect(() => {
    if (book) {
      setBookData({
        title: book.title || "",
        author: book.author || "",
        description: book.description || "",
        price: book.price || "",
        stock: book.stockQuantity || 0,
        genre: book.genre || "",
        isbn: book.isbn || "",
        publisher: book.publisher || "",
        publishDate: book.publishDate ? book.publishDate.split("T")[0] : "",
        language: book.language || "English",
        format: book.format || "Paperback",
        pages: book.pages || "",
        dimensions: book.dimensions || "",
        weight: book.weight || "",
        imageUrl: book.imageUrl || "",
        discountPercentage: book.discountPercentage || "",
        originalPrice: book.originalPrice || "",
        isOnSale: book.isOnSale || false,
        isBestseller: book.isBestseller || false,
        isNewRelease: book.isNewRelease || false,
        discountStartDate: book.discountStartDate ? book.discountStartDate.split("T")[0] : "",
        discountEndDate: book.discountEndDate ? book.discountEndDate.split("T")[0] : "",
      });
      if (book.imageUrl) {
        setPreviewUrl(book.imageUrl);
      }
    }
  }, [book, isOpen]);

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
      setBookData((prev) => ({
        ...prev,
        stock: prev.stock + 1,
      }));
    } else if (action === "decrement" && bookData.stock > 0) {
      setBookData((prev) => ({
        ...prev,
        stock: prev.stock - 1,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!fileTypes.includes(file.type)) {
      setErrors({
        ...errors,
        imageUrl: "Invalid file type. Only JPG, PNG, and GIF files are allowed.",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors({
        ...errors,
        imageUrl: "File size exceeds 10MB limit.",
      });
      return;
    }

    setUploadedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    if (errors.imageUrl) {
      setErrors({
        ...errors,
        imageUrl: null,
      });
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("https://localhost:7126/api/Uploads/book-cover", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || `Server returned ${response.status}`);
      }

      const result = await response.json();
      return result.filePath;
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!bookData.title.trim()) newErrors.title = "Title is required";
    if (!bookData.author.trim()) newErrors.author = "Author is required";
    if (!bookData.description.trim()) newErrors.description = "Description is required";
    if (!bookData.publisher.trim()) newErrors.publisher = "Publisher is required";
    if (!bookData.isbn.trim()) newErrors.isbn = "ISBN is required";
    if (!bookData.genre.trim()) newErrors.genre = "Genre is required";

    // Handle price validation
    if (!bookData.price) {
      newErrors.price = "Price is required";
    } else {
      const priceValue = parseFloat(bookData.price);
      if (isNaN(priceValue)) {
        newErrors.price = "Price must be a valid number";
      } else if (priceValue < 0.01 || priceValue > 10000) {
        newErrors.price = "Price must be between 0.01 and 10000";
      }
    }

    if (bookData.discountPercentage) {
      const discountValue = parseFloat(bookData.discountPercentage);
      if (isNaN(discountValue)) newErrors.discountPercentage = "Discount must be a valid number";
      else if (discountValue < 0 || discountValue > 100)
        newErrors.discountPercentage = "Discount must be between 0 and 100";
    }

    if (bookData.pages && (isNaN(Number(bookData.pages)) || bookData.pages <= 0)) {
      newErrors.pages = "Pages must be a positive number";
    }

    if (bookData.dimensions && !/^\d+(\.\d+)?x\d+(\.\d+)?x\d+(\.\d+)?$/.test(bookData.dimensions)) {
      newErrors.dimensions = "Dimensions should be in format LxWxH (e.g., 5x7x2)";
    }
    if (bookData.weight && isNaN(Number(bookData.weight))) {
      newErrors.weight = "Weight must be a valid number";
    }

    if (bookData.isOnSale) {
      if (!bookData.discountPercentage) newErrors.discountPercentage = "Discount percentage is required for sale items";
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
          return;
        }
      }

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

      const url = book ? `https://localhost:7126/api/Books/${book.id}` : "https://localhost:7126/api/Books";
      const method = book ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookToSave),
      });

      if (!response.ok) {
        const errorText = await response.text();  // Log raw error text
        console.error('Error response:', errorText); // This will help you debug
        throw new Error(`Failed to save book: ${response.status} ${response.statusText}`);
      }

      // Attempt to parse JSON from response
      const savedBook = await response.json(); // Will throw if response is not valid JSON
      onSave(savedBook);
      onClose();
    } catch (error) {
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
          <h2 className="text-xl font-semibold text-gray-900">{book ? "Edit Book" : "Add New Book"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 max-h-[calc(90vh-120px)]">
          {errors.form && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">{errors.form}</div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Your form fields */}
            {/* [Same as before] */}
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isSubmitting || isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 text-base font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting || isUploading ? (isUploading ? "Uploading..." : "Updating...") : "Update Book"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
