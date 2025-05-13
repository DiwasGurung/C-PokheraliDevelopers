// Models/DTOs/AddCartItemDto.cs
using System.ComponentModel.DataAnnotations;

namespace PokheraliDevelopers.Dto
{
    public class AddCartItemDto
    {
        [Required]
        public int BookId { get; set; }

        [Required, Range(1, 100)]
        public int Quantity { get; set; } = 1;
    }
}