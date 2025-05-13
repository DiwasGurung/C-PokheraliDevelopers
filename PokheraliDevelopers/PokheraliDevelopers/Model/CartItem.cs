using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
        [Range(1, 99)]
        public int Quantity { get; set; } = 1;

        [Required]
        public DateTime DateAdded { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; }

        [ForeignKey("BookId")]
        public virtual Book Book { get; set; }
    }
}