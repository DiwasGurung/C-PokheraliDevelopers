// Models/Award.cs
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

public class Award
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Name { get; set; }

    public string Description { get; set; }

    // Navigation properties
    public virtual ICollection<BookAward> BookAwards { get; set; }
}