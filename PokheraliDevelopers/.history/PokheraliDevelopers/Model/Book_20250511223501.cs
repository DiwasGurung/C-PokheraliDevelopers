using PokheraliDevelopers.Models;
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
    [Required]
    [MaxLength(255)]
    public string Title { get; set; }

    /// <summary>
    /// The International Standard Book Number
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string ISBN { get; set; }

    /// <summary>
    /// Detailed description of the book
    /// </summary>
    [Required]
    public string Description { get; set; }

    /// <summary>
    /// The author(s) of the book
    /// </summary>
    [Required]
    [MaxLength(255)]
    public string Author { get; set; }

    /// <summary>
    /// The genre of the book
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string Genre { get; set; }

    /// <summary>
    /// The current price of the book
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    /// <summary>
    /// The number of books available in stock
    /// </summary>
    [Required]
    public int StockQuantity { get; set; }

    /// <summary>
    /// The format of the book (e.g., Hardcover, Paperback, E-book)
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string Format { get; set; }

    /// <summary>
    /// URL to the book's cover image
    /// </summary>
    public string ImageUrl { get; set; }

    /// <summary>
    /// The discount percentage applied to the book
    /// </summary>
    public decimal? DiscountPercentage { get; set; }

    /// <summary>
    /// Indicates if the book is currently on sale
    /// </summary>
    public bool IsOnSale { get; set; }

    /// <summary>
    /// The end date of the discount period
    /// </summary>
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
    public bool IsBestseller { get; set; }

    /// <summary>
    /// Indicates if the book is a new release
    /// </summary>
    public bool IsNewRelease { get; set; }

    // Navigation properties
    public virtual ICollection<OrderItem> OrderItems { get; set; }
    public virtual ICollection<Review> Reviews { get; set; }
    public virtual ICollection<Bookmark> Bookmarks { get; set; }
    public virtual ICollection<CartItem> CartItems { get; set; }
}
