using PokheraliDevelopers.Models;

public class ClaimCode
{
    public int Id { get; set; }
    public string Code { get; set; }
    public decimal DiscountPercentage { get; set; }
    public DateTime ExpiryDate { get; set; }
    public bool IsUsed { get; set; }

    // Navigation properties
    public virtual ICollection<Order> Orders { get; set; }
}
