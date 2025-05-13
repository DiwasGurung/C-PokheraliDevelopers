using System;
using System.ComponentModel.DataAnnotations;

namespace PokheraliDevelopers.Dto
{
    public class CreateAnnouncementDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; }

        [Required]
        [StringLength(500)]
        public string Content { get; set; }

        public string BgColor { get; set; }
        public string TextColor { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }
    }
} 