using System;

namespace PokheraliDevelopers.Dto
{
    public class BookmarkDto
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public string BookTitle { get; set; }
        public string BookAuthor { get; set; }
        public string ImageUrl { get; set; }
        public string BookImageUrl { get; set; }
        public decimal Price { get; set; }
        public decimal BookPrice { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public decimal? BookDiscountPercentage { get; set; }
        public bool IsOnSale { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime AddedOn { get; set; }
    }
}