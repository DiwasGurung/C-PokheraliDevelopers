// DTOs/ClaimOrderDto.cs
using System.ComponentModel.DataAnnotations;

public class ClaimOrderDto
{
    [Required]
    public string MemberId { get; set; }

    [Required]
    public string ClaimCode { get; set; }
}