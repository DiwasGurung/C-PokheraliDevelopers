using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokheraliDevelopers.Models
{
    public class BookAward
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int BookId { get; set; }

        [Required]
        public int AwardId { get; set; }

        public int? Year { get; set; }

        // Navigation properties
        [ForeignKey("BookId")]
        public virtual Book Book { get; set; }

        [ForeignKey("AwardId")]
        public virtual Award Award { get; set; }
    }
}