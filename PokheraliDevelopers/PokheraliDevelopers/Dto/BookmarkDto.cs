using System;
namespace PokheraliDevelopers.Dto
{
    public class BookmarkDto
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public string ImageUrl { get; set; }
        public decimal Price { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public bool IsOnSale { get; set; }
        public DateTime AddedOn { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}