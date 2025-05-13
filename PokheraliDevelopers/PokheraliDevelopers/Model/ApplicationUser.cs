using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace PokheraliDevelopers.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Address { get; set; }

        public string City { get; set; }

        public string State { get; set; }

        public DateTime MemberSince { get; set; } = DateTime.UtcNow;

        public int SuccessfulOrderCount { get; set; } = 0;

        [NotMapped]
        public bool HasLoyaltyDiscount { get; set; } = false;

        // Navigation properties
        public virtual ICollection<Bookmark> Bookmarks { get; set; }

        public virtual ICollection<CartItem> CartItems { get; set; }

        public virtual ICollection<Order> Orders { get; set; }

        public virtual ICollection<Review> Reviews { get; set; }
    }
}