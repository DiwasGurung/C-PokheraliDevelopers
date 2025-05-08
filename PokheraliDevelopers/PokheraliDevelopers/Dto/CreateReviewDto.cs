// DTOs/CreateReviewDto.cs
using System.ComponentModel.DataAnnotations;

public class CreateReviewDto
{
    [Required]
    public int BookId { get; set; }

    [Required, Range(1, 5)]
    public int Rating { get; set; }

    public string Comment { get; set; }
}