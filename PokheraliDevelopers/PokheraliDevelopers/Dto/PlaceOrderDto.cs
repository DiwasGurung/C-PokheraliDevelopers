// Models/DTOs/PlaceOrderDto.cs
using System;
using System.Collections.Generic;

namespace PokheraliDevelopers.Dto
{
    public class PlaceOrderDto
    {
        public bool UseStackableDiscount { get; set; } = false;
        public string ShippingAddress { get; set; }
        public string ShippingCity { get; set; }
        public string ShippingState { get; set; }
        public string ShippingZipCode { get; set; }
        public string PaymentMethod { get; set; }
        public List<OrderItemDto> Items { get; set; }
    }
}
