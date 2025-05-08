using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using PokheraliDevelopers.Models;

public class Announcement
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; }

    [Required]
    [StringLength(500)]
    public string Content { get; set; }

    public string BgColor { get; set; } = "#f3f4f6"; // Default light gray
    public string TextColor { get; set; } = "#1f2937"; // Default dark gray

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedById { get; set; } // Admin who created it

    [ForeignKey("CreatedById")]
    public virtual ApplicationUser CreatedBy { get; set; }
}