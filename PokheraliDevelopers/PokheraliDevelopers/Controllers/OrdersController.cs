using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using PokheraliDevelopers.Data;
using PokheraliDevelopers.Dto;
using PokheraliDevelopers.Hubs;
using PokheraliDevelopers.Models;

namespace PokheraliDevelopers.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IHubContext<OrderHub> _orderHubContext;

        public OrdersController(ApplicationDbContext context, IEmailService emailService, IHubContext<OrderHub> orderHubContext)
        {
            _context = context;
            _emailService = emailService;
            _orderHubContext = orderHubContext;
        }

        [HttpPost("claim-code")]
        public async Task<IActionResult> ProcessClaimCode([FromBody] string claimCode)
        {
            // Validate the claim code
            if (string.IsNullOrEmpty(claimCode))
            {
                return BadRequest("Claim code is required.");
            }

            // Fetch the order associated with the claim code
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Book)
                .FirstOrDefaultAsync(o => o.ClaimCode == claimCode &&
                                         o.OrderStatus == OrderStatus.Pending &&
                                         !o.IsClaimCodeUsed);

            if (order == null)
            {
                return BadRequest("Invalid or already used claim code.");
            }

            // Fulfill the order
            order.OrderStatus = OrderStatus.Completed;
            order.IsClaimCodeUsed = true;
            order.ClaimCodeUsedAt = DateTime.UtcNow;
            order.UpdatedAt = DateTime.UtcNow;

            // Get the staff ID if authenticated
            var staffId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(staffId))
            {
                order.ClaimCodeUsedByStaffId = staffId;
            }

            // Increment the user's successful order count
            if (order.User != null)
            {
                order.User.SuccessfulOrderCount++;
                await _context.SaveChangesAsync();
            }

            // Create a response with the order details for the frontend
            var orderDetails = new
            {
                order = new
                {
                    orderId = order.Id,
                    orderNumber = order.OrderNumber,
                    totalAmount = order.TotalAmount,
                    discountAmount = order.DiscountAmount,
                    receivedVolumeDiscount = order.ReceivedVolumeDiscount,
                    receivedLoyaltyDiscount = order.ReceivedLoyaltyDiscount,
                    createdAt = order.CreatedAt,
                    orderStatus = order.OrderStatus.ToString(),
                    items = order.OrderItems.Select(oi => new
                    {
                        id = oi.Id,
                        bookId = oi.BookId,
                        bookTitle = oi.Book.Title,
                        bookImageUrl = oi.Book.ImageUrl, // Assuming your Book model has ImageUrl
                        quantity = oi.Quantity,
                        unitPrice = oi.UnitPrice,
                        totalPrice = oi.Quantity * oi.UnitPrice
                    }).ToList()
                },
                message = "Claim code processed successfully.",
                userInfo = order.User != null ? new
                {
                    successfulOrders = order.User.SuccessfulOrderCount,
                    hasLoyaltyDiscount = order.User.SuccessfulOrderCount >= 10
                } : null
            };

            return Ok(orderDetails);
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto orderDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Validate if the user exists
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return Unauthorized();
            }

            // Check if the cart is empty
            if (orderDto.Items == null || !orderDto.Items.Any())
            {
                return BadRequest("No items in the cart");
            }

            // Calculate the order subtotal
            var orderItems = new List<OrderItem>();
            decimal subTotal = 0;
            int totalBookCount = 0;
            var bookTitles = new List<string>();

            foreach (var item in orderDto.Items)
            {
                var book = await _context.Books.FindAsync(item.BookId);
                if (book == null)
                {
                    return NotFound(new { message = "Book not found" });
                }

                // Create the order item and add to the list
                var orderItem = new OrderItem
                {
                    BookId = item.BookId,
                    Quantity = item.Quantity,
                    UnitPrice = book.Price
                };

                orderItems.Add(orderItem);

                // Update the subtotal
                subTotal += orderItem.Quantity * orderItem.UnitPrice;
                totalBookCount += orderItem.Quantity;

                // Add book title to list for broadcasting
                bookTitles.Add(book.Title);
            }

            // Apply discounts
            decimal discountAmount = 0;
            bool receivedVolumeDiscount = false;
            bool receivedLoyaltyDiscount = false;

            // 5% discount for orders with 5+ books
            if (totalBookCount >= 5)
            {
                decimal volumeDiscount = subTotal * 0.05m;
                discountAmount += volumeDiscount;
                receivedVolumeDiscount = true;
            }

            // 10% loyalty discount for users with 10+ successful orders
            if (user.SuccessfulOrderCount >= 10)
            {
                decimal loyaltyDiscount = subTotal * 0.10m;
                discountAmount += loyaltyDiscount;
                receivedLoyaltyDiscount = true;
            }

            // Calculate final total
            decimal totalAmount = subTotal - discountAmount;

            // Add shipping cost
            decimal shippingCost = 5.99m;
            totalAmount += shippingCost;

            // Generate the OrderNumber
            string orderNumber = $"ORD{DateTime.UtcNow.ToString("yyyyMMddHHmmss")}";

            // Generate a unique claim code (6 characters)
            string claimCode = GenerateRandomCode(6);

            // Set default discount code if none
            string discountCode = discountAmount > 0 ? "AUTOMATIC" : "DEFAULT"; // Ensure this is never null

            // Create the order
            var order = new Order
            {
                UserId = userId,
                SubTotal = subTotal,
                DiscountAmount = discountAmount > 0 ? discountAmount : null,
                TotalAmount = totalAmount,
                ReceivedVolumeDiscount = receivedVolumeDiscount,
                ReceivedLoyaltyDiscount = receivedLoyaltyDiscount,
                ShippingAddress = orderDto.ShippingAddress,
                ShippingCity = orderDto.ShippingCity,
                ShippingState = orderDto.ShippingState,
                ShippingZipCode = orderDto.ShippingZipCode,
                OrderItems = orderItems,
                OrderStatus = OrderStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                OrderNumber = orderNumber,
                ClaimCode = claimCode,
                DiscountCode = discountCode // Ensure this is set
            };

            // Ensure we have a transaction ID
            order.TransactionId = order.TransactionId ?? Guid.NewGuid().ToString();

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Send confirmation email
            try
            {
                await _emailService.SendOrderConfirmationEmailAsync(
                    user.Email,
                    orderNumber,
                    totalAmount,
                    claimCode
                );
            }
            catch (Exception ex)
            {
                // Log the error but don't fail the order
                Console.WriteLine($"Failed to send confirmation email: {ex.Message}");
            }

            // Broadcast the successful order creation to SignalR clients
            await _orderHubContext.Clients.All.SendAsync("ReceiveOrderUpdate", new
            {
                OrderNumber = order.OrderNumber,
                TotalAmount = order.TotalAmount,
                Items = bookTitles
            });

            // Return order details including the claim code
            return Ok(new
            {
                orderNumber = order.OrderNumber,
                message = "Order placed successfully",
                totalAmount = order.TotalAmount,
                claimCode = order.ClaimCode,
                discountApplied = discountAmount > 0,
                discountAmount = discountAmount,
                volumeDiscount = receivedVolumeDiscount,
                loyaltyDiscount = receivedLoyaltyDiscount
            });
        }

        // Helper method to generate a random claim code
        private string GenerateRandomCode(int length)
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding similar looking characters
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        [HttpGet("purchased/{bookId}")]
        public async Task<ActionResult<bool>> HasPurchasedBook(int bookId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var hasPurchased = await _context.OrderItems
                .Include(oi => oi.Order)
                .AnyAsync(oi =>
                    oi.BookId == bookId &&
                    oi.Order.UserId == userId &&
                    oi.Order.OrderStatus != OrderStatus.Cancelled);

            return hasPurchased;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetOrders()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var orders = await _context.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Book)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(o => new
            {
                o.Id,
                o.OrderNumber,
                o.SubTotal,
                o.TotalAmount,
                Status = o.OrderStatus.ToString(),
                o.CreatedAt,
                o.ClaimCode,
                // Include shipping details
                ShippingAddress = o.ShippingAddress,
                ShippingCity = o.ShippingCity,
                ShippingState = o.ShippingState,
                ShippingZipCode = o.ShippingZipCode,
                Items = o.OrderItems.Select(oi => new
                {
                    oi.BookId,
                    oi.Book.Title,
                    oi.Quantity,
                    oi.UnitPrice,
                    Total = oi.Quantity * oi.UnitPrice
                })
            }).ToList();
        }

        // PUT: api/Orders/{id}/cancel
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var order = await _context.Orders.FindAsync(id);

            if (order == null || order.UserId != userId)
                return NotFound();

            if (order.OrderStatus != OrderStatus.Pending && order.OrderStatus != OrderStatus.Confirmed)
                return BadRequest("Cannot cancel this order");

            order.OrderStatus = OrderStatus.Cancelled;
            order.CancelledAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
