using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PokheraliDevelopers.Dto
{
    public class OrderDto
    {
        [Required]
        public List<OrderItemDto> Items { get; set; } = new List<OrderItemDto>();

        [Required]
        public string ShippingAddress { get; set; }

        [Required]
        public string ShippingCity { get; set; }

        public string ShippingState { get; set; }

        [Required]
        public string ShippingZipCode { get; set; }

        [Required]
        public string PaymentMethod { get; set; }
    }
}