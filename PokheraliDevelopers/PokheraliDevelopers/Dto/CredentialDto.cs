<<<<<<< HEAD
﻿using System.ComponentModel.DataAnnotations;

public class CredentialDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    [MinLength(6)]
    public string Password { get; set; }



=======
﻿// Update your CredentialDto class to include PhoneNumber
public class CredentialDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60
}