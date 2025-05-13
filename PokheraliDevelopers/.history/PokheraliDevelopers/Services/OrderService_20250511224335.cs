using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PokheraliDevelopers.Data;
using PokheraliDevelopers.Models;

namespace PokheraliDevelopers.Services
{
    public interface IOrderService
    {
        Task<decimal> CalculateOrderTotalAsync(int orderId);
        Task<string> GenerateClaimCodeAsync(int orderId);
        Task<bool> ProcessClaimCodeAsync(string claimCode);
        Task UpdateUserDiscountsAsync(string userId);
    }

    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public OrderService(ApplicationDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public async Task<decimal> CalculateOrderTotalAsync(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Book)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                throw new ArgumentException("Order not found");

            var userProfile = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == order.UserId);

            decimal total = order.OrderItems.Sum(oi => oi.Book.Price * oi.Quantity);

            // Apply bulk discount (5% for 5+ books)
            if (order.OrderItems.Sum(oi => oi.Quantity) >= 5)
            {
                total *= 0.95m;
                userProfile.HasBulkDiscount = true;
            }

            // Apply loyalty discount (10% after 10 successful orders)
            if (userProfile.SuccessfulOrders >= 10)
            {
                total *= 0.90m;
                userProfile.HasLoyaltyDiscount = true;
            }

            await _context.SaveChangesAsync();
            return total;
        }

        public async Task<string> GenerateClaimCodeAsync(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                throw new ArgumentException("Order not found");

            // Generate a unique claim code
            string claimCode = Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();
            order.ClaimCode = claimCode;
            await _context.SaveChangesAsync();

            // Send email with claim code
            await _emailService.SendEmailAsync(
                order.User.Email,
                "Your Order Claim Code",
                $"Your claim code is: {claimCode}. Please present this code to collect your order."
            );

            return claimCode;
        }

        public async Task<bool> ProcessClaimCodeAsync(string claimCode)
        {
            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.ClaimCode == claimCode);

            if (order == null)
                return false;

            order.OrderStatus = OrderStatus.Delivered;
            await _context.SaveChangesAsync();

            // Update user profile
            var userProfile = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == order.UserId);

            if (userProfile != null)
            {
                userProfile.SuccessfulOrders++;
                userProfile.LastOrderDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return true;
        }

        public async Task UpdateUserDiscountsAsync(string userId)
        {
            var userProfile = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (userProfile == null)
                return;

            // Check for bulk discount eligibility
            var recentOrders = await _context.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.UserId == userId && o.OrderStatus == OrderStatus.Delivered)
                .OrderByDescending(o => o.OrderDate)
                .Take(5)
                .ToListAsync();

            userProfile.HasBulkDiscount = recentOrders.Any(o => 
                o.OrderItems.Sum(oi => oi.Quantity) >= 5);

            // Check for loyalty discount
            userProfile.HasLoyaltyDiscount = userProfile.SuccessfulOrders >= 10;

            await _context.SaveChangesAsync();
        }
    }
} 