<<<<<<< HEAD
﻿public class BookDto
{
    public string Title { get; set; }
    public string Author { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string Genre { get; set; }
    public string ISBN { get; set; }
    public string Publisher { get; set; }
    public DateTime? PublishDate { get; set; }
    public string Language { get; set; }
    public string Format { get; set; }
    public int? Pages { get; set; }
    public string Dimensions { get; set; }
    public string Weight { get; set; }
    public string ImageUrl { get; set; }
    public bool IsBestseller { get; set; }
    public bool IsNewRelease { get; set; }
    public bool IsOnSale { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public DateTime? DiscountStartDate { get; set; }
    public DateTime? DiscountEndDate { get; set; }
}
=======
﻿// DTOs/BookDto.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PokheraliDevelopers.Dto
{
    public class BookDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string ISBN { get; set; }
        public string Description { get; set; }
        public string Author { get; set; }
        public string Publisher { get; set; }
        public DateTime PublicationDate { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string Language { get; set; }
        public string Format { get; set; }
        public string Genre { get; set; }
        public string ImageUrl { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public bool IsOnSale { get; set; }
        public DateTime? DiscountStartDate { get; set; }
        public DateTime? DiscountEndDate { get; set; }
        public bool IsNewRelease { get; set; }
        public bool IsNewArrival { get; set; }
        public bool IsComingSoon { get; set; }
        public double AverageRating { get; set; }
        public int ReviewCount { get; set; }
        public bool IsBookmarked { get; set; }
        public List<string> Awards { get; set; } = new List<string>();
    }

    // DTOs/CreateBookDto.cs
    public class CreateBookDto
    {
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

        [Required, Range(0.01, 10000)]
        public decimal Price { get; set; }

        [Required, Range(0, 10000)]
        public int StockQuantity { get; set; }

        public string Language { get; set; } = "English";

        [Required]
        public string Format { get; set; }

        [Required]
        public string Genre { get; set; }

        public string ImageUrl { get; set; }

        [Range(0, 100)]
        public decimal? DiscountPercentage { get; set; }

        public bool IsOnSale { get; set; }

        public DateTime? DiscountStartDate { get; set; }

        public DateTime? DiscountEndDate { get; set; }
    }
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60
