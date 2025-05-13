using System.ComponentModel.DataAnnotations;

namespace PokheraliDevelopers.Dto
{
    public class UpdateCartItemDto
    {
        [Required, Range(1, 100)]
        public int Quantity { get; set; }
    }
}