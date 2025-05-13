using System.Collections.Generic;

namespace PokheraliDevelopers.Dto
{
    public class CartDto
    {
        public List<CartItemDto> Items { get; set; } = new List<CartItemDto>();

        public int TotalItems { get; set; }

        public decimal SubTotal { get; set; }

        public decimal DiscountAmount { get; set; }

        public decimal TotalPrice { get; set; }

        public bool HasVolumeDiscount { get; set; }

        public bool HasLoyaltyDiscount { get; set; }
    }
}