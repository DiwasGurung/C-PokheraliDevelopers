using PokheraliDevelopers.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class Review
{
    [Key]
    public int Id { get; set; }

    public int BookId { get; set; }

    public string UserId { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    public string Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("BookId")]
    public virtual Book Book { get; set; }

    [ForeignKey("UserId")]
    public virtual ApplicationUser User { get; set; }
}
