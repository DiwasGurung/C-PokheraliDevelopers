// Services/IUserProfileService.cs
using Microsoft.EntityFrameworkCore;
using PokheraliDevelopers.Dto;
using System.Threading.Tasks;

public interface IUserProfileService
{
    Task<UserProfileDto> GetUserProfileAsync(string userId);
    Task<UserProfileDto> CreateUserProfileAsync(string userId, string firstName, string lastName);
    Task<UserProfileDto> UpdateUserProfileAsync(string userId, string firstName, string lastName);
    Task<bool> HasPurchasedBookAsync(string userId, int bookId);
    Task<bool> HasStackableDiscountAsync(string userId);
}