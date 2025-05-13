using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace PokheraliDevelopers.Dto
{
    public class BookDto
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; }

        [Required]
        [MaxLength(50)]
        public string ISBN { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        [MaxLength(255)]
        public string Author { get; set; }

        [Required]
        public string Publisher { get; set; }

        [Required]
        public DateTime PublicationDate { get; set; }

        [Required]
        public decimal Price { get; set; }

        [Required]
        public int StockQuantity { get; set; }

        public string Language { get; set; } = "English";

        [Required]
        public string Format { get; set; }

        public string ImageUrl { get; set; }

        public decimal? DiscountPercentage { get; set; }

        public bool IsOnSale { get; set; }

        public DateTime? DiscountStartDate { get; set; }

        public DateTime? DiscountEndDate { get; set; }

        public bool IsBestseller { get; set; }

        public bool IsNewRelease { get; set; }

        public decimal? OriginalPrice { get; set; }

        public double AverageRating { get; set; }

        public int ReviewCount { get; set; }

        public bool IsBookmarked { get; set; }

        public List<string> Awards { get; set; } = new List<string>();

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }

    public class CreateBookDto
    {
        [Required]
        [MaxLength(255)]
        public string Title { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string ISBN { get; set; }
        
        [Required]
        public string Description { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string Author { get; set; }
        
        [Required]
        public string Publisher { get; set; }
        
        [Required]
        public DateTime PublicationDate { get; set; }
        
        [Required]
        [Range(0.01, 1000000)]
        public decimal Price { get; set; }
        
        [Required]
        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }
        
        public string Language { get; set; }
        
        [Required]
        public string Format { get; set; }
        
        public IFormFile Image { get; set; }
        
        public decimal? DiscountPercentage { get; set; }
        public bool IsOnSale { get; set; }
        public DateTime? DiscountStartDate { get; set; }
        public DateTime? DiscountEndDate { get; set; }
        public bool IsBestseller { get; set; }
        public bool IsNewRelease { get; set; }
    }

    public class UpdateBookDto
    {
        [MaxLength(255)]
        public string Title { get; set; }
        
        [MaxLength(50)]
        public string ISBN { get; set; }
        
        public string Description { get; set; }
        
        [MaxLength(255)]
        public string Author { get; set; }
        
        public string Publisher { get; set; }
        
        public DateTime? PublicationDate { get; set; }
        
        [Range(0.01, 1000000)]
        public decimal? Price { get; set; }
        
        [Range(0, int.MaxValue)]
        public int? StockQuantity { get; set; }
        
        public string Language { get; set; }
        
        public string Format { get; set; }
        
        public IFormFile Image { get; set; }
        
        public decimal? DiscountPercentage { get; set; }
        public bool? IsOnSale { get; set; }
        public DateTime? DiscountStartDate { get; set; }
        public DateTime? DiscountEndDate { get; set; }
        public bool? IsBestseller { get; set; }
        public bool? IsNewRelease { get; set; }
    }
}