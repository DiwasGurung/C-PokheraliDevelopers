namespace PokheraliDevelopers.Dto
{
    public class CreateOrderDto
    {
        public string ShippingAddress { get; set; }
        public string ShippingCity { get; set; }
        public string ShippingState { get; set; }
        public string ShippingZipCode { get; set; }
        
        public List<CreateOrderItemDto> Items { get; set; }
    }

    public class CreateOrderItemDto
    {
        public int BookId { get; set; }
        public int Quantity { get; set; }
    }

}
