using System;

public class BookmarkDto
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public string BookTitle { get; set; }
    public string BookAuthor { get; set; }
    public string BookImageUrl { get; set; }
    public decimal BookPrice { get; set; }
    public decimal? BookDiscountPercentage { get; set; }
    public DateTime CreatedAt { get; set; }
}