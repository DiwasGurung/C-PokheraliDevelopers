// Services/UserProfileService.cs
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using PokheraliDevelopers.Data;

public class UserProfileService : IUserProfileService
{
    private readonly ApplicationDbContext _context;

    public UserProfileService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserProfileDto> GetUserProfileAsync(string userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return null;
        }

        var userProfile = await _context.UserProfiles.FindAsync(userId);
        if (userProfile == null)
        {
            // Create a new profile if it doesn't exist
            userProfile = new UserProfile
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };
            _context.UserProfiles.Add(userProfile);
            await _context.SaveChangesAsync();
        }

        return new UserProfileDto
        {
            UserId = userProfile.UserId,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            FirstName = userProfile.FirstName,
            LastName = userProfile.LastName,
            SuccessfulOrdersCount = userProfile.SuccessfulOrdersCount,
            HasStackableDiscount = userProfile.SuccessfulOrdersCount > 0 &&
                                userProfile.SuccessfulOrdersCount % 10 == 0 &&
                                !userProfile.StackableDiscountUsed
        };
    }

    public async Task<UserProfileDto> CreateUserProfileAsync(string userId, string firstName, string lastName)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return null;
        }

        var existingProfile = await _context.UserProfiles.FindAsync(userId);
        if (existingProfile != null)
        {
            return await UpdateUserProfileAsync(userId, firstName, lastName);
        }

        var userProfile = new UserProfile
        {
            UserId = userId,
            FirstName = firstName,
            LastName = lastName,
            CreatedAt = DateTime.UtcNow
        };

        _context.UserProfiles.Add(userProfile);
        await _context.SaveChangesAsync();

        return new UserProfileDto
        {
            UserId = userProfile.UserId,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            FirstName = userProfile.FirstName,
            LastName = userProfile.LastName,
            SuccessfulOrdersCount = userProfile.SuccessfulOrdersCount,
            HasStackableDiscount = false
        };
    }

    public async Task<UserProfileDto> UpdateUserProfileAsync(string userId, string firstName, string lastName)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return null;
        }

        var userProfile = await _context.UserProfiles.FindAsync(userId);
        if (userProfile == null)
        {
            return await CreateUserProfileAsync(userId, firstName, lastName);
        }

        userProfile.FirstName = firstName;
        userProfile.LastName = lastName;

        await _context.SaveChangesAsync();

        return new UserProfileDto
        {
            UserId = userProfile.UserId,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            FirstName = userProfile.FirstName,
            LastName = userProfile.LastName,
            SuccessfulOrdersCount = userProfile.SuccessfulOrdersCount,
            HasStackableDiscount = userProfile.SuccessfulOrdersCount > 0 &&
                                userProfile.SuccessfulOrdersCount % 10 == 0 &&
                                !userProfile.StackableDiscountUsed
        };
    }

    public async Task<bool> HasPurchasedBookAsync(string userId, int bookId)
    {
        return await _context.Orders
            .Where(o => o.UserId == userId && o.Status == OrderStatus.Completed)
            .SelectMany(o => o.OrderItems)
            .AnyAsync(oi => oi.BookId == bookId);
    }

    public async Task<bool> HasStackableDiscountAsync(string userId)
    {
        var userProfile = await _context.UserProfiles.FindAsync(userId);
        if (userProfile == null)
        {
            return false;
        }

        return userProfile.SuccessfulOrdersCount > 0 &&
               userProfile.SuccessfulOrdersCount % 10 == 0 &&
               !userProfile.StackableDiscountUsed;
    }
}

// DTOs/UserProfileDto.cs
public class UserProfileDto
{
    public string UserId { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public int SuccessfulOrdersCount { get; set; }
    public bool HasStackableDiscount { get; set; }
}