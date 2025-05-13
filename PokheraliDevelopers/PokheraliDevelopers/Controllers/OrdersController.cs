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

        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
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

            string claimCode = Guid.NewGuid().ToString().Substring(0, 10);
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
                OrderNumber = orderNumber,  // Assign the generated order number
                ClaimCode = claimCode,      // Assign the claim code (unique or default)
                DiscountCode = "DEFAULT"  
                // Assign a default discount code (if required)
            };
            order.TransactionId = order.TransactionId ?? Guid.NewGuid().ToString();
            order.ClaimCodeUsedByStaffId = userId;  // Assuming 'userId' is the staff ID


            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(new { orderNumber = order.OrderNumber, message = "Order placed successfully" });
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