using System;
using System.Collections.Generic;

namespace PokheraliDevelopers.Models.Dtos
{
    public class CartDto
    {
        public List<CartItemDto> Items { get; set; } = new List<CartItemDto>();
        public decimal TotalPrice { get; set; }
        public int TotalItems { get; set; }
        public decimal Subtotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal FinalAmount { get; set; }
        public bool QualifiesForBulkDiscount { get; set; }
        public bool HasStackableDiscount { get; set; }
    }

    public class CartItemDto
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public string BookTitle { get; set; }
        public string BookAuthor { get; set; }
        public string BookImageUrl { get; set; }
        public decimal BookPrice { get; set; }
        public int Quantity { get; set; }
        public decimal Subtotal { get; set; }
    }

    public class AddToCartDto
    {
        public int BookId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public class UpdateCartItemDto
    {
        public int CartItemId { get; set; }
        public int Quantity { get; set; }
    }
}