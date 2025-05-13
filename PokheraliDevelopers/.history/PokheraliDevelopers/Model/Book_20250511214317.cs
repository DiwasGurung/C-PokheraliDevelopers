using PokheraliDevelopers.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// Represents a book in the bookstore system
/// </summary>
public class Book
{
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// The title of the book
    /// </summary>
    [Required(ErrorMessage = "Title is required")]
    [MaxLength(255, ErrorMessage = "Title cannot exceed 255 characters")]
    public string Title { get; set; }

    /// <summary>
    /// The International Standard Book Number
    /// </summary>
    [Required(ErrorMessage = "ISBN is required")]
    [MaxLength(50, ErrorMessage = "ISBN cannot exceed 50 characters")]
    [RegularExpression(@"^(?:\d[- ]?){9}[\dXx]$", ErrorMessage = "Invalid ISBN format")]
    public string ISBN { get; set; }

    /// <summary>
    /// Detailed description of the book
    /// </summary>
    [Required(ErrorMessage = "Description is required")]
    [MinLength(10, ErrorMessage = "Description must be at least 10 characters long")]
    public string Description { get; set; }

    /// <summary>
    /// The author(s) of the book
    /// </summary>
    [Required(ErrorMessage = "Author is required")]
    [MaxLength(255, ErrorMessage = "Author name cannot exceed 255 characters")]
    public string Author { get; set; }

    /// <summary>
    /// The publisher of the book
    /// </summary>
    [Required(ErrorMessage = "Publisher is required")]
    [MaxLength(255, ErrorMessage = "Publisher name cannot exceed 255 characters")]
    public string Publisher { get; set; }

    /// <summary>
    /// The date when the book was published
    /// </summary>
    [Required(ErrorMessage = "Publication date is required")]
    [DataType(DataType.Date)]
    public DateTime PublicationDate { get; set; }

    /// <summary>
    /// The current price of the book
    /// </summary>
    [Required(ErrorMessage = "Price is required")]
    [Column(TypeName = "decimal(18,2)")]
    [Range(0.01, 1000000, ErrorMessage = "Price must be between 0.01 and 1,000,000")]
    public decimal Price { get; set; }

    /// <summary>
    /// The number of books available in stock
    /// </summary>
    [Required(ErrorMessage = "Stock quantity is required")]
    [Range(0, int.MaxValue, ErrorMessage = "Stock quantity cannot be negative")]
    public int StockQuantity { get; set; }

    /// <summary>
    /// The language of the book
    /// </summary>
    [MaxLength(50, ErrorMessage = "Language cannot exceed 50 characters")]
    public string Language { get; set; }

    /// <summary>
    /// The format of the book (e.g., Hardcover, Paperback, E-book)
    /// </summary>
    [Required(ErrorMessage = "Format is required")]
    [MaxLength(50, ErrorMessage = "Format cannot exceed 50 characters")]
    public string Format { get; set; }

    /// <summary>
    /// URL to the book's cover image
    /// </summary>
    [Url(ErrorMessage = "Invalid image URL format")]
    [MaxLength(500, ErrorMessage = "Image URL cannot exceed 500 characters")]
    public string ImageUrl { get; set; }

    /// <summary>
    /// The discount percentage applied to the book
    /// </summary>
    [Range(0, 100, ErrorMessage = "Discount percentage must be between 0 and 100")]
    public decimal? DiscountPercentage { get; set; }

    /// <summary>
    /// Indicates if the book is currently on sale
    /// </summary>
    public bool IsOnSale { get; set; }

    /// <summary>
    /// The start date of the discount period
    /// </summary>
    [DataType(DataType.Date)]
    public DateTime? DiscountStartDate { get; set; }

    /// <summary>
    /// The end date of the discount period
    /// </summary>
    [DataType(DataType.Date)]
    public DateTime? DiscountEndDate { get; set; }

    /// <summary>
    /// When the book record was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When the book record was last modified
    /// </summary>
    public DateTime ModifiedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Indicates if the book is a bestseller
    /// </summary>
    public bool IsBestseller { get; set; } = false;

    /// <summary>
    /// Indicates if the book is a new release
    /// </summary>
    public bool IsNewRelease { get; set; } = false;

    /// <summary>
    /// The original price before any discounts
    /// </summary>
    [Column(TypeName = "decimal(18,2)")]
    [Range(0.01, 1000000, ErrorMessage = "Original price must be between 0.01 and 1,000,000")]
    public decimal? OriginalPrice { get; set; }

    // Navigation properties
    public virtual ICollection<OrderItem> OrderItems { get; set; }
    public virtual ICollection<Review> Reviews { get; set; }
    public virtual ICollection<Bookmark> Bookmarks { get; set; }
    public virtual ICollection<CartItem> CartItems { get; set; }
    public virtual ICollection<BookAward> BookAwards { get; set; }
}
