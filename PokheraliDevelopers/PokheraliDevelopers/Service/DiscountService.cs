// Simple IDiscountService interface
namespace PokheraliDevelopers.Service
{
    public interface IDiscountService
    {
        decimal CalculateDiscountAmount(decimal subTotal, bool hasVolumeDiscount, bool hasLoyaltyDiscount);
    }



    public class DiscountService : IDiscountService
    {
        public decimal CalculateDiscountAmount(decimal subTotal, bool hasVolumeDiscount, bool hasLoyaltyDiscount)
        {
            decimal discountAmount = 0;

            if (hasVolumeDiscount)
            {
                discountAmount += subTotal * 0.05m; // 5% volume discount
            }

            if (hasLoyaltyDiscount)
            {
                discountAmount += subTotal * 0.10m; // 10% loyalty discount
            }

            return discountAmount;
        }
    }
}