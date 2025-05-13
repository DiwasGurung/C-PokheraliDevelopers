using PokheraliDevelopers.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class Bookmark
{
    [Key]
    public int Id { get; set; }

    public string UserId { get; set; }

    public int BookId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual ApplicationUser User { get; set; }

    [ForeignKey("BookId")]
    public virtual Book Book { get; set; }
}