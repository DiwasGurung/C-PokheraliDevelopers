<<<<<<< HEAD
﻿using System;
=======
﻿// Models/Book.cs
using System;
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Book
{
    [Key]
    public int Id { get; set; }
<<<<<<< HEAD
    [Required]
    public string Title { get; set; }
    [Required]
    public string Author { get; set; }
    public string Description { get; set; }
    [Required]
    public decimal Price { get; set; }
    public int Stock { get; set; }
    [Required]
    public string Genre { get; set; }
    public string ISBN { get; set; }
    public string Publisher { get; set; }
    public DateTime? PublishDate { get; set; }
    public string Language { get; set; } = "English";
    public string Format { get; set; } = "Paperback";
    public int? Pages { get; set; }
    public string Dimensions { get; set; }
    public string Weight { get; set; }
    public string ImageUrl { get; set; }
    // Timestamp for when the record was created
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    // Timestamp for when the record was last updated
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Additional properties for sales and discounts
    public bool IsBestseller { get; set; } = false;
    public bool IsNewRelease { get; set; } = false;
    public bool IsOnSale { get; set; } = false;
    public decimal? DiscountPercentage { get; set; }
    public DateTime? DiscountStartDate { get; set; }
    public DateTime? DiscountEndDate { get; set; }
    public decimal? OriginalPrice { get; set; }

    // Navigation properties
    public virtual ICollection<Review> Reviews { get; set; }
    public virtual ICollection<OrderItem> OrderItems { get; set; }
    public virtual ICollection<Bookmark> Bookmarks { get; set; }
}
=======

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
    public int StockQuantity { get; set; }

    public string Language { get; set; }

    [Required]
    public string Format { get; set; } // Paperback, Hardcover, etc.

    [Required, MaxLength(100)]
    public string Genre { get; set; }

    public string ImageUrl { get; set; }

    public decimal? DiscountPercentage { get; set; }

    public bool IsOnSale { get; set; }

    public DateTime? DiscountStartDate { get; set; }

    public DateTime? DiscountEndDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime ModifiedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<OrderItem> OrderItems { get; set; }
    public virtual ICollection<Review> Reviews { get; set; }
    public virtual ICollection<Bookmark> Bookmarks { get; set; }
    public virtual ICollection<CartItem> CartItems { get; set; }
    public virtual ICollection<BookAward> BookAwards { get; set; }
}
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60
