using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class OrderItem
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int OrderId { get; set; }

    [Required]
    public int BookId { get; set; }

    [Required]
    public int Quantity { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? DiscountPercentage { get; set; } // Discount on the unit price (e.g., percentage)

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalPrice { get; set; } // Calculated based on Quantity * UnitPrice (and Discount if applicable)

    // Navigation properties
    [ForeignKey("OrderId")]
    public virtual Order Order { get; set; }

    [ForeignKey("BookId")]
    public virtual Book Book { get; set; }
}
