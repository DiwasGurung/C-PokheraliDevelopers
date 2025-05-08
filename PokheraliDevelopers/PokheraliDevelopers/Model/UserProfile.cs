// Models/UserProfile.cs - Extension to IdentityUser
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

public class UserProfile
{
    [Key]
    public string UserId { get; set; }

    public string FirstName { get; set; }

    public string LastName { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int SuccessfulOrdersCount { get; set; } = 0;

    public bool StackableDiscountUsed { get; set; } = false;

    [ForeignKey("UserId")]
    public virtual IdentityUser User { get; set; }
}
