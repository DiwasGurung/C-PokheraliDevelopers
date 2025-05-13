// Models/DTOs/ClaimOrderDto.cs
using System.ComponentModel.DataAnnotations;

namespace PokheraliDevelopers.Dto
{
    public class ClaimOrderDto
    {
        [Required]
        public string MemberId { get; set; }

        [Required]
        public string ClaimCode { get; set; }
    }
}