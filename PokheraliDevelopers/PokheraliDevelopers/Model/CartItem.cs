using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
<<<<<<< HEAD

namespace PokheraliDevelopers.Models
{
    public class CartItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }

        [Required]
        public int BookId { get; set; }

        [Required]
        public int Quantity { get; set; }

        [ForeignKey("BookId")]
        public Book Book { get; set; }

        [ForeignKey("UserId")]
        public ApplicationUser User { get; set; }

        // The subtotal for this cart item (Price * Quantity)
        [NotMapped]
        public decimal Subtotal => Book != null ? Book.Price * Quantity : 0;

        // Date when the item was added to cart
        public DateTime DateAdded { get; set; } = DateTime.UtcNow;
    }
=======
using Microsoft.AspNetCore.Identity;

public class CartItem
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; }

    [Required]
    public int BookId { get; set; }

    [Required]
    public int Quantity { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime ModifiedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual IdentityUser User { get; set; }

    public virtual Book Book { get; set; }
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60
}