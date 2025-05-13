using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;
using PokheraliDevelopers.Models;

public enum OrderStatus
{
    Pending,
    Confirmed,
    Cancelled,
    Completed
}

public class Order
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; }

    [Required]
    public string OrderNumber { get; set; } // For reference in emails/UI

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal SubTotal { get; set; }

    public decimal? DiscountAmount { get; set; }
    public string DiscountCode { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    [Required]
    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    [Required]
    public string PaymentStatus { get; set; } // "Pending", "Completed", "Failed", "Refunded"

    public string PaymentMethod { get; set; }
    public string TransactionId { get; set; }

    // Order Date and Claim Code
    [Required]
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    [Required]
    public string ClaimCode { get; set; }

    // Shipping Details
    public string ShippingAddress { get; set; }
    public string ShippingCity { get; set; }
    public string ShippingState { get; set; }
    public string ShippingZipCode { get; set; }

    // Loyalty and Discounts
    public bool ReceivedVolumeDiscount { get; set; } = false; // Track if customer received a volume discount (5+ books)
    public bool ReceivedLoyaltyDiscount { get; set; } = false; // Track if customer received a loyalty discount (10+ successful orders)
    public bool BulkDiscount { get; set; } = false; // Bulk discount
    public bool StackableDiscount { get; set; } = false; // Stackable discount

    // Staff Info and Processing
    public string StaffId { get; set; }
    public DateTime? ProcessedDate { get; set; }

    // Order Claim Tracking
    public bool IsClaimCodeUsed { get; set; } = false;
    public DateTime? ClaimCodeUsedAt { get; set; }
    public string ClaimCodeUsedByStaffId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? CancelledAt { get; set; }

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual ApplicationUser User { get; set; }

    [ForeignKey("StaffId")]
    public virtual IdentityUser Staff { get; set; }

    public virtual ICollection<OrderItem> OrderItems { get; set; }
}
