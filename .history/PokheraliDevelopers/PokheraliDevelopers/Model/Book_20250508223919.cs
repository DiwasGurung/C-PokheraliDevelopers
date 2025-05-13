using PokheraliDevelopers.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Book
{
    [Key]
    public int Id { get; set; }

    // Title, Author, ISBN, and other basic book properties
    [Required, MaxLength(255)]
    public string Title { get; set; }

    [Required, MaxLength(50)]
    public string ISBN { get; set; }

    [Required]
    public string Description { get; set; }

    [Required, MaxLength(255)]
    public string Author { get; set; }

    [Required]
    public string Publisher { get; set; }

    [Required]
    public DateTime PublicationDate { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    [Required]
    public int StockQuantity { get; set; } // Renamed from Stock

    public string Language { get; set; }

    [Required]
    public string Format
    {
        get; set; }

    public string ImageUrl { get; set; }

    // Discount related properties
    public decimal? DiscountPercentage { get; set; }
    public bool IsOnSale { get; set; }
    public DateTime? DiscountStartDate { get; set; }
    public DateTime? DiscountEndDate { get; set; }

    // Created and Modified timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ModifiedAt { get; set; } = DateTime.UtcNow;

    // Additional properties for sales and tracking
    public bool IsBestseller { get; set; } = false;
    public bool IsNewRelease { get; set; } = false;
    public decimal? OriginalPrice { get; set; } // Optional, only if relevant

    // Navigation properties
    public virtual ICollection<OrderItem> OrderItems { get; set; }
    public virtual ICollection<Review> Reviews { get; set; }
    public virtual ICollection<Bookmark> Bookmarks { get; set; }
    public virtual ICollection<CartItem> CartItems { get; set; } // Added for cart interactions
    public virtual ICollection<BookAward> BookAwards { get; set; } // If relevant, for awards associated with the book
}
