// DTOs/OrderItemDto.cs
public class OrderItemDto
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public string BookTitle { get; set; }
    public string BookISBN { get; set; }
    public string BookAuthor { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public decimal LineTotal { get; set; }
}