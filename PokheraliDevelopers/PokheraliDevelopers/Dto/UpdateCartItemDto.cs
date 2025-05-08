// DTOs/UpdateCartItemDto.cs
using System.ComponentModel.DataAnnotations;

public class UpdateCartItemDto
{
    [Required, Range(1, 100)]
    public int Quantity { get; set; }
}