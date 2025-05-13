using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokheraliDevelopers.Models
{
    public class UserProfile
    {
        [Key]
        public string UserId { get; set; }

        [Required]
        public int SuccessfulOrders { get; set; } = 0;

        [Required]
        public bool HasBulkDiscount { get; set; } = false;

        [Required]
        public bool HasLoyaltyDiscount { get; set; } = false;

        public DateTime LastOrderDate { get; set; }

        // Navigation property
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; }
    }
} 