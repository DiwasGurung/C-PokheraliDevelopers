using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokheraliDevelopers.Models
{
    public class Book
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string Title { get; set; }

        [Required]
        [StringLength(255)]
        public string Author { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Required]
        [StringLength(100)]
        public string Genre { get; set; }

        [Required]
        public string ISBN { get; set; }

        [Required]
        public string Publisher { get; set; }

        [Required]
        public string Language { get; set; }

        [Required]
        public string Dimensions { get; set; }

        [Required]
        public string Weight { get; set; }

        public int Stock { get; set; }

        public DateTime? DiscountStartDate { get; set; }

        public DateTime? DiscountEndDate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? DiscountPercentage { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<Bookmark> Bookmarks { get; set; }
        public virtual ICollection<OrderItem> OrderItems { get; set; }
        public virtual ICollection<Review> Reviews { get; set; }
    }
} 