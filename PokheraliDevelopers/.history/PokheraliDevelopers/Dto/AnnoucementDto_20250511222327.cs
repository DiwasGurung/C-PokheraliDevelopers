// DTOs/AnnouncementDto.cs
using System;

namespace PokheraliDevelopers.Dto
{
    public class AnnouncementDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
    }
}
