using System;

namespace PokheraliDevelopers.Dto
{
    public class UserProfileDto
    {
        public string UserId { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int SuccessfulOrdersCount { get; set; }
        public bool HasStackableDiscount { get; set; }
        public bool HasLoyaltyDiscount { get; set; }
    }
}