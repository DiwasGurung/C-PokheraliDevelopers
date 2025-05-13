using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PokheraliDevelopers.Models
{
    public class Award
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(255)]
        public string Name { get; set; }

        public string Description { get; set; }

        [MaxLength(255)]
        public string Organization { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation property
        public virtual ICollection<BookAward> BookAwards { get; set; } = new List<BookAward>();
    }
}