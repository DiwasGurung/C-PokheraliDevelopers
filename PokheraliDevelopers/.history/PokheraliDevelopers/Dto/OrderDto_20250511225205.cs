using System;
using System.Collections.Generic;
using PokheraliDevelopers.Models;

namespace PokheraliDevelopers.Dto
{
    public class OrderDto
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public OrderStatus OrderStatus { get; set; }
        public string ShippingAddress { get; set; }
        public string ShippingCity { get; set; }
        public string ShippingState { get; set; }
        public string ShippingZipCode { get; set; }
        public string PaymentMethod { get; set; }
        public string ClaimCode { get; set; }
        public List<OrderItemDto> OrderItems { get; set; }
    }
}