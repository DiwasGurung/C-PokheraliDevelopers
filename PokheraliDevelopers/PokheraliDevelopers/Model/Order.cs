<<<<<<< HEAD
﻿using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using PokheraliDevelopers.Models;
=======
﻿// Models/Order.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

public enum OrderStatus
{
    Pending,
    Confirmed,
    Cancelled,
    Completed
}
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60

public class Order
{
    [Key]
    public int Id { get; set; }

<<<<<<< HEAD
    public string UserId { get; set; }

    [Required]
    public string OrderNumber { get; set; } // For reference in emails/UI

    [Required]
    public decimal SubTotal { get; set; }

    public decimal? DiscountAmount { get; set; }
    public string DiscountCode { get; set; }

    [Required]
    public decimal TotalAmount { get; set; }

    [Required]
    public string OrderStatus { get; set; } // "Pending", "Processing", "Shipped", "Delivered", "Cancelled"

    public string ShippingAddress { get; set; }
    public string ShippingCity { get; set; }
    public string ShippingState { get; set; }
    public string ShippingZipCode { get; set; }

    [Required]
    public string PaymentStatus { get; set; } // "Pending", "Completed", "Failed", "Refunded"

    public string PaymentMethod { get; set; }
    public string TransactionId { get; set; }

    // Claim code for order fulfillment by staff
    public string ClaimCode { get; set; }
    public bool IsClaimCodeUsed { get; set; } = false;
    public DateTime? ClaimCodeUsedAt { get; set; }
    public string ClaimCodeUsedByStaffId { get; set; }

    // Track if customer received a volume discount (5+ books)
    public bool ReceivedVolumeDiscount { get; set; } = false;

    // Track if customer received a loyalty discount (10+ successful orders)
    public bool ReceivedLoyaltyDiscount { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? CancelledAt { get; set; }

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual ApplicationUser User { get; set; }
=======
    [Required]
    public string UserId { get; set; }

    [Required]
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    [Required]
    public string ClaimCode { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal DiscountAmount { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal FinalAmount { get; set; }

    [Required]
    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    public bool BulkDiscount { get; set; } = false;

    public bool StackableDiscount { get; set; } = false;

    public string StaffId { get; set; }

    public DateTime? ProcessedDate { get; set; }

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual IdentityUser User { get; set; }

    [ForeignKey("StaffId")]
    public virtual IdentityUser Staff { get; set; }
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60

    public virtual ICollection<OrderItem> OrderItems { get; set; }
}