public class BookResponseDto : BookDto
{
    public int Id { get; set; }
    public decimal? OriginalPrice { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
}