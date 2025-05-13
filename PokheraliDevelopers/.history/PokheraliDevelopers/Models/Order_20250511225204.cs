using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokheraliDevelopers.Models
{
    public enum OrderStatus
    {
        Pending,
        Processing,
        Shipped,
        Delivered,
        Cancelled
    }

    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }

        [Required]
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Required]
        public OrderStatus OrderStatus { get; set; } = OrderStatus.Pending;

        [Required]
        public string ShippingAddress { get; set; }

        [Required]
        public string ShippingCity { get; set; }

        [Required]
        public string ShippingState { get; set; }

        [Required]
        public string ShippingZipCode { get; set; }

        public string PaymentMethod { get; set; }

        public string ClaimCode { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; }
        public virtual ICollection<OrderItem> OrderItems { get; set; }
    }
} 