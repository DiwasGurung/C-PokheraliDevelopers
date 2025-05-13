using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;
using PokheraliDevelopers.Models;

namespace PokheraliDevelopers.Models
{
    public class Bookmark
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int BookId { get; set; }

        [Required]
        public string UserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("BookId")]
        public virtual Book Book { get; set; }

        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; }
    }
}
