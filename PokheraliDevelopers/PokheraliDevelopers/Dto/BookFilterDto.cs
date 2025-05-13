public class BookFilterDto
{
    public string SearchTerm { get; set; }
    public List<string> Authors { get; set; }
    public List<string> Genres { get; set; }
    public bool? InStock { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public double? MinRating { get; set; }
    public List<string> Languages { get; set; }
    public List<string> Formats { get; set; }
    public List<string> Publishers { get; set; }
    public bool? OnSale { get; set; }
    public bool? NewRelease { get; set; }
    public bool? NewArrival { get; set; }
    public bool? ComingSoon { get; set; }
    public bool? AwardWinner { get; set; }
    public string SortBy { get; set; } = "Title";
    public bool SortDescending { get; set; } = false;
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}