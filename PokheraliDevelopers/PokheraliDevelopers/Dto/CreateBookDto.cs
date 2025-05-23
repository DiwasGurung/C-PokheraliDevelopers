﻿using System;
using System.ComponentModel.DataAnnotations;
namespace PokheraliDevelopers.Dto
{
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

        public DateTime? PublicationDate { get; set; }

        [Required, Range(0.01, 10000)]
        public decimal Price { get; set; }

        [Required, Range(0, 10000)]
        public int StockQuantity { get; set; }

        public string Language { get; set; } = "English";

        [Required]
        public string Format { get; set; } = "Paperback";

        [Required]
        public string Genre { get; set; }

        public string ImageUrl { get; set; }

        public int? Pages { get; set; }

        public string Dimensions { get; set; }

        public string Weight { get; set; }

        [Range(0, 100)]
        public decimal? DiscountPercentage { get; set; }

        public decimal? OriginalPrice { get; set; }

        public bool IsOnSale { get; set; }

        public bool IsBestseller { get; set; }

        public bool IsNewRelease { get; set; }

        public DateTime? DiscountStartDate { get; set; }

        public DateTime? DiscountEndDate { get; set; }
    }
}