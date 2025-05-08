// Controllers/OrdersController.cs (updated)
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Text;

[Route("api/[controller]")]
[ApiController]
public class OrdersController : ControllerBase
{
    private readonly DatabaseHandlerEfCoreExample _context;
    private readonly IEmailService _emailService;
    private readonly IHubContext<OrderHub, IOrderHub> _orderHubContext;

    public OrdersController(
        DatabaseHandlerEfCoreExample context,
        IEmailService emailService,
        IHubContext<OrderHub, IOrderHub> orderHubContext)
    {
        _context = context;
        _emailService = emailService;
        _orderHubContext = orderHubContext;
    }

    // GET: api/Orders
    [Authorize]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrders()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var orders = await _context.Orders
            .Where(o => o.UserId == userId)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Book)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();

        return orders.Select(o => new OrderDto
        {
            Id = o.Id,
            OrderDate = o.OrderDate,
            ClaimCode = o.ClaimCode,
            TotalAmount = o.TotalAmount,
            DiscountAmount = o.DiscountAmount,
            FinalAmount = o.FinalAmount,
            Status = o.Status,
            BulkDiscount = o.BulkDiscount,
            StackableDiscount = o.StackableDiscount,
            ProcessedDate = o.ProcessedDate,
            Items = o.OrderItems.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                BookId = oi.BookId,
                BookTitle = oi.Book.Title,
                BookISBN = oi.Book.ISBN,
                BookAuthor = oi.Book.Author,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                DiscountPercentage = oi.DiscountPercentage,
                LineTotal = oi.Quantity * oi.UnitPrice * (1 - (oi.DiscountPercentage ?? 0) / 100)
            }).ToList()
        }).ToList();
    }

    // GET: api/Orders/{id}
    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetOrder(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Book)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        if (order == null)
        {
            return NotFound();
        }

        return new OrderDto
        {
            Id = order.Id,
            OrderDate = order.OrderDate,
            ClaimCode = order.ClaimCode,
            TotalAmount = order.TotalAmount,
            DiscountAmount = order.DiscountAmount,
            FinalAmount = order.FinalAmount,
            Status = order.Status,
            BulkDiscount = order.BulkDiscount,
            StackableDiscount = order.StackableDiscount,
            ProcessedDate = order.ProcessedDate,
            Items = order.OrderItems.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                BookId = oi.BookId,
                BookTitle = oi.Book.Title,
                BookISBN = oi.Book.ISBN,
                BookAuthor = oi.Book.Author,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                DiscountPercentage = oi.DiscountPercentage,
                LineTotal = oi.Quantity * oi.UnitPrice * (1 - (oi.DiscountPercentage ?? 0) / 100)
            }).ToList()
        };
    }

    // POST: api/Orders
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<OrderDto>> PlaceOrder(PlaceOrderDto placeOrderDto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Get user info
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return BadRequest("User not found");
        }

        // Get or create user profile
        var userProfile = await _context.UserProfiles.FindAsync(userId);
        if (userProfile == null)
        {
            userProfile = new UserProfile
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };
            _context.UserProfiles.Add(userProfile);
            await _context.SaveChangesAsync();
        }

        var cartItems = await _context.CartItems
            .Where(c => c.UserId == userId)
            .Include(c => c.Book)
            .ToListAsync();

        if (!cartItems.Any())
        {
            return BadRequest("Cart is empty");
        }

        // Verify stock availability
        foreach (var item in cartItems)
        {
            if (item.Book.StockQuantity < item.Quantity)
            {
                return BadRequest($"Not enough stock for '{item.Book.Title}'. Available: {item.Book.StockQuantity}");
            }
        }

        // Start transaction
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Calculate order totals
            decimal subtotal = 0;
            List<OrderItem> orderItems = new List<OrderItem>();

            foreach (var cartItem in cartItems)
            {
                decimal unitPrice = cartItem.Book.Price;
                decimal? discountPercentage = null;

                // Apply book-specific discount if applicable
                if (cartItem.Book.IsOnSale &&
                    cartItem.Book.DiscountPercentage.HasValue &&
                    cartItem.Book.DiscountStartDate <= DateTime.UtcNow &&
                    (!cartItem.Book.DiscountEndDate.HasValue || cartItem.Book.DiscountEndDate >= DateTime.UtcNow))
                {
                    discountPercentage = cartItem.Book.DiscountPercentage;
                }

                decimal lineTotal = unitPrice * cartItem.Quantity;
                if (discountPercentage.HasValue)
                {
                    lineTotal = lineTotal * (1 - (discountPercentage.Value / 100m));
                }

                subtotal += lineTotal;

                // Create order item
                orderItems.Add(new OrderItem
                {
                    BookId = cartItem.BookId,
                    Quantity = cartItem.Quantity,
                    UnitPrice = unitPrice,
                    DiscountPercentage = discountPercentage
                });

                // Update book stock
                cartItem.Book.StockQuantity -= cartItem.Quantity;
                _context.Books.Update(cartItem.Book);
            }

            // Check for discounts
            bool bulkDiscount = cartItems.Sum(c => c.Quantity) >= 5;
            bool stackableDiscount = userProfile.SuccessfulOrdersCount > 0 &&
                                   userProfile.SuccessfulOrdersCount % 10 == 0 &&
                                   !userProfile.StackableDiscountUsed &&
                                   placeOrderDto.UseStackableDiscount;

            // Calculate discount amount
            decimal discountRate = 0;
            if (bulkDiscount)
            {
                discountRate += 0.05m; // 5% bulk discount
            }

            if (stackableDiscount)
            {
                discountRate += 0.10m; // 10% stackable discount
            }

            decimal discountAmount = subtotal * discountRate;
            decimal finalAmount = subtotal - discountAmount;

            // Generate claim code
            string claimCode = GenerateClaimCode();

            // Create order
            var order = new Order
            {
                UserId = userId,
                OrderDate = DateTime.UtcNow,
                ClaimCode = claimCode,
                TotalAmount = subtotal,
                DiscountAmount = discountAmount,
                FinalAmount = finalAmount,
                Status = OrderStatus.Pending,
                BulkDiscount = bulkDiscount,
                StackableDiscount = stackableDiscount,
                OrderItems = orderItems
            };

            _context.Orders.Add(order);

            // Update user profile if stackable discount is used
            if (stackableDiscount)
            {
                userProfile.StackableDiscountUsed = true;
                _context.UserProfiles.Update(userProfile);
            }

            // Clear user's cart
            _context.CartItems.RemoveRange(cartItems);

            await _context.SaveChangesAsync();

            // Send confirmation email
            await SendOrderConfirmationEmail(user.Email, order);

            // Broadcast order creation via SignalR
            await BroadcastOrderCreation(order);

            // Commit transaction
            await transaction.CommitAsync();

            // Return order details
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, new OrderDto
            {
                Id = order.Id,
                OrderDate = order.OrderDate,
                ClaimCode = order.ClaimCode,
                TotalAmount = order.TotalAmount,
                DiscountAmount = order.DiscountAmount,
                FinalAmount = order.FinalAmount,
                Status = order.Status,
                BulkDiscount = order.BulkDiscount,
                StackableDiscount = order.StackableDiscount,
                Items = order.OrderItems.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    BookId = oi.BookId,
                    BookTitle = oi.Book.Title,
                    BookISBN = oi.Book.ISBN,
                    BookAuthor = oi.Book.Author,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    DiscountPercentage = oi.DiscountPercentage,
                    LineTotal = oi.Quantity * oi.UnitPrice * (1 - (oi.DiscountPercentage ?? 0) / 100)
                }).ToList()
            });
        }
        catch (Exception ex)
        {
            // Rollback transaction on error
            await transaction.RollbackAsync();
            return StatusCode(500, $"An error occurred while placing the order: {ex.Message}");
        }
    }

    // PUT: api/Orders/{id}/cancel
    [Authorize]
    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> CancelOrder(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Book)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        if (order == null)
        {
            return NotFound();
        }

        if (order.Status != OrderStatus.Pending)
        {
            return BadRequest("Only pending orders can be cancelled");
        }

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Update order status
            order.Status = OrderStatus.Cancelled;

            // Restore book stock
            foreach (var orderItem in order.OrderItems)
            {
                orderItem.Book.StockQuantity += orderItem.Quantity;
                _context.Books.Update(orderItem.Book);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return NoContent();
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, "An error occurred while cancelling the order");
        }
    }

    // POST: api/Orders/claim
    [Authorize(Roles = "Staff,Admin")]
    [HttpPost("claim")]
    public async Task<IActionResult> ClaimOrder(ClaimOrderDto claimOrderDto)
    {
        var staffId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Book)
            .FirstOrDefaultAsync(o => o.ClaimCode == claimOrderDto.ClaimCode && o.UserId == claimOrderDto.MemberId);

        if (order == null)
        {
            return NotFound("Invalid claim code or member ID");
        }

        if (order.Status != OrderStatus.Pending)
        {
            return BadRequest($"Order cannot be claimed. Current status: {order.Status}");
        }

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Update order status
            order.Status = OrderStatus.Completed;
            order.StaffId = staffId;
            order.ProcessedDate = DateTime.UtcNow;

            // Increment user's successful orders count
            var userProfile = await _context.UserProfiles.FindAsync(order.UserId);
            if (userProfile != null)
            {
                userProfile.SuccessfulOrdersCount++;

                // Reset stackable discount used flag if user has completed 10 orders
                if (userProfile.SuccessfulOrdersCount % 10 == 0)
                {
                    userProfile.StackableDiscountUsed = false;
                }

                _context.UserProfiles.Update(userProfile);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Broadcast order completion via SignalR
            await BroadcastOrderCompletion(order);

            return Ok(new
            {
                message = "Order claimed successfully",
                orderId = order.Id,
                totalAmount = order.FinalAmount,
                itemCount = order.OrderItems.Sum(oi => oi.Quantity)
            });
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, "An error occurred while claiming the order");
        }
    }

    // Helper methods
    private string GenerateClaimCode()
    {
        // Generate a random 8-character alphanumeric claim code
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        var code = new string(Enumerable.Repeat(chars, 8)
            .Select(s => s[random.Next(s.Length)]).ToArray());

        return code;
    }

    private async Task SendOrderConfirmationEmail(string email, Order order)
    {
        try
        {
            // Build email content
            var subject = $"Your Order Confirmation - Claim Code: {order.ClaimCode}";
            var body = $@"
                <h2>Order Confirmation</h2>
                <p>Thank you for your order. Your claim code is: <strong>{order.ClaimCode}</strong></p>
                <p>Please present this code along with your membership ID at our store to complete your purchase.</p>
                
                <h3>Order Details:</h3>
                <p>Order ID: {order.Id}</p>
                <p>Order Date: {order.OrderDate}</p>
                <p>Total: ${order.TotalAmount}</p>
                <p>Discount: ${order.DiscountAmount}</p>
                <p>Final Amount: ${order.FinalAmount}</p>
                
                <h3>Items:</h3>
                <ul>
            ";

            foreach (var item in order.OrderItems)
            {
                body += $"<li>{item.Book.Title} by {item.Book.Author} - {item.Quantity} x ${item.UnitPrice}</li>";
            }

            body += "</ul><p>Thank you for shopping with us!</p>";

            // Send email
            await _emailService.SendEmailAsync(email, subject, body);
        }
        catch (Exception ex)
        {
            // Log error but don't stop the order process
            Console.WriteLine($"Failed to send order confirmation email: {ex.Message}");
        }
    }

    private async Task BroadcastOrderCreation(Order order)
    {
        try
        {
            var books = string.Join(", ", order.OrderItems.Select(oi => oi.Book.Title));
            await _orderHubContext.Clients.All.NewOrderPlaced(new
            {
                OrderId = order.Id,
                Books = books,
                ItemCount = order.OrderItems.Sum(oi => oi.Quantity),
                Message = $"New order placed with {order.OrderItems.Sum(oi => oi.Quantity)} items!"
            });
        }
        catch (Exception ex)
        {
            // Log error but don't stop the order process
            Console.WriteLine($"Failed to broadcast order creation: {ex.Message}");
        }
    }

    private async Task BroadcastOrderCompletion(Order order)
    {
        try
        {
            var books = string.Join(", ", order.OrderItems.Select(oi => oi.Book.Title));
            await _orderHubContext.Clients.All.OrderCompleted(new
            {
                OrderId = order.Id,
                Books = books,
                ItemCount = order.OrderItems.Sum(oi => oi.Quantity),
                Message = $"Order fulfilled with {order.OrderItems.Sum(oi => oi.Quantity)} books: {books}"
            });
        }
        catch (Exception ex)
        {
            // Log error but don't stop the order process
            Console.WriteLine($"Failed to broadcast order completion: {ex.Message}");
        }
    }
}