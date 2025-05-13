// Models/DTOs/CreateAnnouncementDto.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace PokheraliDevelopers.Dto
{
    public class CreateAnnouncementDto
    {
        [Required]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }
    }
}