using System;
using System.ComponentModel.DataAnnotations;

public class BookAward
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int BookId { get; set; }

    [Required]
    public int AwardId { get; set; }

    public int Year { get; set; }

    // Navigation properties
    public virtual Book Book { get; set; }
    public virtual Award Award { get; set; }
}
