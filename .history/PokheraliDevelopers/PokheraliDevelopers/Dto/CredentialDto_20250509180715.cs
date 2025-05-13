using System.ComponentModel.DataAnnotations;

public class CredentialDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;
}