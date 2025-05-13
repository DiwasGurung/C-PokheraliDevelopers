using System.ComponentModel.DataAnnotations;

namespace PokheraliDevelopers.Dto
{
    public class CreateReviewDto
    {
        [Required]
        public int BookId { get; set; }

        [Required, Range(1, 5)]
        public int Rating { get; set; }

        public string Comment { get; set; }
    }
}