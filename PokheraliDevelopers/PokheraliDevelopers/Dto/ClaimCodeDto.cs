using System.ComponentModel.DataAnnotations;

namespace PokheraliDevelopers.Dto
{
    public class ClaimCodeDto
    {
        [Required]
        public string Code { get; set; }
    }
}