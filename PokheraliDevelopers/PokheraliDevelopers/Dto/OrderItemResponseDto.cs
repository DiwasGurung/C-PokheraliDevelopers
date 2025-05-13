namespace PokheraliDevelopers.Dto
{
    public class OrderItemResponseDto
    {
        public int Id { get; set; }

        public int BookId { get; set; }

        public string BookTitle { get; set; }

        public string BookImageUrl { get; set; }

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal? UnitDiscount { get; set; }

        public decimal TotalPrice { get; set; }
    }
}