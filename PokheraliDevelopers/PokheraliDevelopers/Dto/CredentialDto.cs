using System.ComponentModel.DataAnnotations;

namespace PokheraliDevelopers.Dto
{
    public class CredentialDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }

    }
}