public class CartItemDto
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public string BookTitle { get; set; }
    public string BookAuthor { get; set; }
    public string BookImageUrl { get; set; }
    public decimal BookPrice { get; set; }
    public int Quantity { get; set; }
    public decimal Subtotal { get; set; }
}
