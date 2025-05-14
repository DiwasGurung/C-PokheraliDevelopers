using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokheraliDevelopers.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }

        [Required, MaxLength(20)]
        public string OrderNumber { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal SubTotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? DiscountAmount { get; set; }

        [MaxLength(50)]
        public string DiscountCode { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Required]
        public OrderStatus OrderStatus { get; set; } = OrderStatus.Pending;

        [Required, MaxLength(255)]
        public string ShippingAddress { get; set; }

        [Required, MaxLength(100)]
        public string ShippingCity { get; set; }

        [MaxLength(100)]
        public string ShippingState { get; set; }

        [Required, MaxLength(20)]
        public string ShippingZipCode { get; set; }

        

        [Required, MaxLength(10)]
        public string ClaimCode { get; set; }

        public string TransactionId { get; set; }

        public string? ClaimCodeUsedByStaffId { get; set; }

        public bool IsClaimCodeUsed { get; set; } = false;

        public DateTime? ClaimCodeUsedAt { get; set; }

        public bool ReceivedVolumeDiscount { get; set; } = false;

        public bool ReceivedLoyaltyDiscount { get; set; } = false;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public DateTime? CancelledAt { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; }

        [ForeignKey("ClaimCodeUsedByStaffId")]
        public virtual ApplicationUser Staff { get; set; }

        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}