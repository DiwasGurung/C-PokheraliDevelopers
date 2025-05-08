<<<<<<< HEAD
﻿using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using PokheraliDevelopers.Models;
=======
﻿using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60

public class Bookmark
{
    [Key]
    public int Id { get; set; }

<<<<<<< HEAD
    public int BookId { get; set; }
    public string UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("BookId")]
    public virtual Book Book { get; set; }

    [ForeignKey("UserId")]
    public virtual ApplicationUser User { get; set; }
}
=======
    [Required]
    public string UserId { get; set; }

    [Required]
    public int BookId { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual IdentityUser User { get; set; }

    public virtual Book Book { get; set; }
}
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60
