using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PokheraliDevelopers.Data;
using PokheraliDevelopers.Dto;
using PokheraliDevelopers.Models;

namespace PokheraliDevelopers.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public OrdersController(ApplicationDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
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
            }

            // Generate the OrderNumber (this is just an example, you can customize it)
            string orderNumber = $"ORD{DateTime.UtcNow.ToString("yyyyMMddHHmmss")}";

            // Calculate total amount (e.g., including shipping)
            decimal shippingCost = 5.99m;
            decimal totalAmount = subTotal + shippingCost;

            // Generate a unique claim code
            string claimCode = Guid.NewGuid().ToString().Substring(0, 10).ToUpper();

            // Create the order
            var order = new Order
            {
                UserId = userId,
                SubTotal = subTotal,
                TotalAmount = totalAmount,
                ShippingAddress = orderDto.ShippingAddress,
                ShippingCity = orderDto.ShippingCity,
                ShippingState = orderDto.ShippingState,
                ShippingZipCode = orderDto.ShippingZipCode,
                OrderItems = orderItems,
                OrderStatus = OrderStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                OrderNumber = orderNumber,
                ClaimCode = claimCode,
                DiscountCode = "DEFAULT"
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
                // In a production environment, you might want to queue this for retry
                Console.WriteLine($"Failed to send confirmation email: {ex.Message}");
            }

            // Return order details including the claim code
            return Ok(new
            {
                orderNumber = order.OrderNumber,
                message = "Order placed successfully",
                totalAmount = order.TotalAmount,
                claimCode = order.ClaimCode
            });
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

        [HttpPut("{orderId}/fulfill")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> FulfillOrder(int orderId, [FromBody] string claimCode)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                return NotFound();
            }

            if (order.ClaimCode != claimCode)
            {
                return BadRequest("Invalid claim code");
            }

            // Process the fulfillment (mark as completed)
            order.OrderStatus = OrderStatus.Completed;
            await _context.SaveChangesAsync();

            return NoContent();
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