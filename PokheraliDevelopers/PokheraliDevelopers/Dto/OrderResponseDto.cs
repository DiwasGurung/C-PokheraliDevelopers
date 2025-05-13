using System;
using System.Collections.Generic;

namespace PokheraliDevelopers.Dto
{
    public class OrderResponseDto
    {
        public int Id { get; set; }

        public string OrderNumber { get; set; }

        public decimal SubTotal { get; set; }

        public decimal? DiscountAmount { get; set; }

        public string DiscountCode { get; set; }

        public decimal TotalAmount { get; set; }

        public string OrderStatus { get; set; }

        public string PaymentStatus { get; set; }

        public DateTime CreatedAt { get; set; }

        public string ClaimCode { get; set; }

        public List<OrderItemResponseDto> Items { get; set; } = new List<OrderItemResponseDto>();
    }
}