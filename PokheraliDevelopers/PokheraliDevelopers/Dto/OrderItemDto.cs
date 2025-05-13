using System.ComponentModel.DataAnnotations;

namespace PokheraliDevelopers.Dto
{
    public class OrderItemDto
    {
        [Required]
        public int BookId { get; set; }

        [Required]
        [Range(1, 99, ErrorMessage = "Quantity must be between 1 and 99.")]
        public int Quantity { get; set; } = 1;
    }
}