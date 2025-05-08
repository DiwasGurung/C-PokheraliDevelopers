using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PokheraliDevelopers.Data;
using PokheraliDevelopers.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailService _emailService;

    public OrdersController(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        IEmailService emailService)
    {
        _context = context;
        _userManager = userManager;
        _emailService = emailService;
    }

    // GET: api/Orders - Get all orders for the logged-in user
    [HttpGet]
    [Authorize(Roles = "Member")]
    public async Task<ActionResult<IEnumerable<OrderResponseDto>>> GetUserOrders()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var orders = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Book)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var orderDtos = orders.Select(o => new OrderResponseDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            SubTotal = o.SubTotal,
            DiscountAmount = o.DiscountAmount,
            DiscountCode = o.DiscountCode,
            TotalAmount = o.TotalAmount,
            OrderStatus = o.OrderStatus,
            PaymentStatus = o.PaymentStatus,
            CreatedAt = o.CreatedAt,
            ClaimCode = o.ClaimCode,
            Items = o.OrderItems.Select(oi => new OrderItemResponseDto
            {
                Id = oi.Id,
                BookId = oi.BookId,
                BookTitle = oi.Book.Title,
                BookImageUrl = oi.Book.ImageUrl,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                UnitDiscount = oi.UnitDiscount,
                TotalPrice = oi.TotalPrice
            }).ToList()
        }).ToList();

        return orderDtos;
    }

    // GET: api/Orders/{id} - Get a specific order
    [HttpGet("{id}")]
    [Authorize(Roles = "Member,Admin,Staff")]
    public async Task<ActionResult<OrderResponseDto>> GetOrder(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var userRoles = User.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList();

        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Book)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
        {
            return NotFound();
        }

        // Only allow the order owner, admins, or staff to view the order
        if (order.UserId != userId && !userRoles.Contains("Admin") && !userRoles.Contains("Staff"))
        {
            return Forbid();
        }

        var orderDto = new OrderResponseDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            SubTotal = order.SubTotal,
            DiscountAmount = order.DiscountAmount,
            DiscountCode = order.DiscountCode,
            TotalAmount = order.TotalAmount,
            OrderStatus = order.OrderStatus,
            PaymentStatus = order.PaymentStatus,
            CreatedAt = order.CreatedAt,
            ClaimCode = order.ClaimCode,
            Items = order.OrderItems.Select(oi => new OrderItemResponseDto
            {
                Id = oi.Id,
                BookId = oi.BookId,
                BookTitle = oi.Book.Title,
                BookImageUrl = oi.Book.ImageUrl,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                UnitDiscount = oi.UnitDiscount,
                TotalPrice = oi.TotalPrice
            }).ToList()
        };

        return orderDto;
    }

    // POST: api/Orders - Create a new order
    [HttpPost]
    [Authorize(Roles = "Member")]
    public async Task<ActionResult<OrderResponseDto>> CreateOrder([FromBody] OrderDto orderDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
        {
            return BadRequest("User not found");
        }

        // Validate that all books exist and are in stock
        var bookIds = orderDto.Items.Select(item => item.BookId).ToList();
        var books = await _context.Books.Where(b => bookIds.Contains(b.Id)).ToListAsync();

        if (books.Count != bookIds.Count)
        {
            return BadRequest("One or more books not found");
        }

        // Check stock
        foreach (var item in orderDto.Items)
        {
            var book = books.First(b => b.Id == item.BookId);
            if (book.Stock < item.Quantity)
            {
                return BadRequest($"Insufficient stock for book: {book.Title}");
            }
        }

        // Calculate order details
        decimal subTotal = 0;
        decimal? discountAmount = 0;

        // Create order items
        var orderItems = new List<OrderItem>();
        foreach (var item in orderDto.Items)
        {
            var book = books.First(b => b.Id == item.BookId);

            // Get the actual price (handle sales/discounts)
            decimal unitPrice = book.Price;
            decimal? unitDiscount = null;

            // Check if book is on sale
            if (book is Book extendedBook &&
                extendedBook.IsOnSale &&
                extendedBook.DiscountPercentage.HasValue &&
                extendedBook.DiscountStartDate <= DateTime.UtcNow &&
                extendedBook.DiscountEndDate >= DateTime.UtcNow)
            {
                decimal discountedPrice = unitPrice * (1 - extendedBook.DiscountPercentage.Value / 100);
                unitDiscount = unitPrice - discountedPrice;
                unitPrice = discountedPrice;
            }

            decimal totalPrice = unitPrice * item.Quantity;
            subTotal += totalPrice;

            var orderItem = new OrderItem
            {
                BookId = item.BookId,
                Quantity = item.Quantity,
                UnitPrice = unitPrice,
                UnitDiscount = unitDiscount,
                TotalPrice = totalPrice
            };

            orderItems.Add(orderItem);
        }

        // Apply volume discount (5% for 5+ books)
        bool volumeDiscount = orderDto.Items.Sum(i => i.Quantity) >= 5;

        // Apply loyalty discount (10% for 10+ successful orders)
        bool loyaltyDiscount = user.SuccessfulOrderCount >= 10;

        // Calculate total discounts
        if (volumeDiscount)
        {
            discountAmount += subTotal * 0.05m;
        }

        if (loyaltyDiscount)
        {
            discountAmount += subTotal * 0.10m;
        }

        decimal totalAmount = subTotal - discountAmount.Value;

        // Generate shorter unique order number and claim code
        string orderNumber = GenerateOrderNumber();
        string claimCode = GenerateClaimCode();

        // Create the order
        var order = new Order
        {
            UserId = userId,
            OrderNumber = orderNumber,
            SubTotal = subTotal,
            DiscountAmount = discountAmount,
            DiscountCode = "",
            TotalAmount = totalAmount,
            OrderStatus = "Pending",
            ShippingAddress = orderDto.ShippingAddress,
            ShippingCity = orderDto.ShippingCity,
            ShippingState = orderDto.ShippingState,
            ShippingZipCode = orderDto.ShippingZipCode,
            PaymentStatus = "Pending", // In a real app, integrate with payment gateway
            PaymentMethod = orderDto.PaymentMethod,
            ClaimCode = claimCode,
            TransactionId = "",
            ClaimCodeUsedByStaffId = "", // Set empty string for ClaimCodeUsedByStaffId
            IsClaimCodeUsed = false,
            ReceivedVolumeDiscount = volumeDiscount,
            ReceivedLoyaltyDiscount = loyaltyDiscount,
            CreatedAt = DateTime.UtcNow,
            OrderItems = orderItems
        };

        _context.Orders.Add(order);

        // Update stock
        foreach (var item in orderDto.Items)
        {
            var book = books.First(b => b.Id == item.BookId);
            book.Stock -= item.Quantity;
        }

        await _context.SaveChangesAsync();

        // Send order confirmation email
        try
        {
            await _emailService.SendOrderConfirmationEmailAsync(
                user.Email,
                order.OrderNumber,
                order.TotalAmount,
                order.ClaimCode
            );
        }
        catch (Exception ex)
        {
            // Log the error but don't fail the order process
            Console.WriteLine($"Error sending order confirmation email: {ex.Message}");
            // In a production app, you would use a proper logging framework
        }

        // Return response
        var orderResponseDto = new OrderResponseDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            SubTotal = order.SubTotal,
            DiscountAmount = order.DiscountAmount,
            TotalAmount = order.TotalAmount,
            OrderStatus = order.OrderStatus,
            PaymentStatus = order.PaymentStatus,
            CreatedAt = order.CreatedAt,
            ClaimCode = order.ClaimCode,
            Items = order.OrderItems.Select(oi => new OrderItemResponseDto
            {
                Id = oi.Id,
                BookId = oi.BookId,
                BookTitle = books.First(b => b.Id == oi.BookId).Title,
                BookImageUrl = books.First(b => b.Id == oi.BookId).ImageUrl,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                UnitDiscount = oi.UnitDiscount,
                TotalPrice = oi.TotalPrice
            }).ToList()
        };

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, orderResponseDto);
    }

    // PUT: api/Orders/{id}/cancel - Cancel an order
    [HttpPut("{id}/cancel")]
    [Authorize(Roles = "Member")]
    public async Task<IActionResult> CancelOrder(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        if (order == null)
        {
            return NotFound();
        }

        // Only allow cancellation of pending or processing orders
        if (order.OrderStatus != "Pending" && order.OrderStatus != "Processing")
        {
            return BadRequest("Cannot cancel an order that has been shipped or delivered");
        }

        // Update order status
        order.OrderStatus = "Cancelled";
        order.CancelledAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        // Restore stock
        foreach (var orderItem in order.OrderItems)
        {
            var book = await _context.Books.FindAsync(orderItem.BookId);
            if (book != null)
            {
                book.Stock += orderItem.Quantity;
            }
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/Orders/claim-code - Process claim code (for staff)
    [HttpPost("claim-code")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> ProcessClaimCode([FromBody] string claimCode)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Book)
            .FirstOrDefaultAsync(o => o.ClaimCode == claimCode && !o.IsClaimCodeUsed);

        if (order == null)
        {
            return NotFound("Invalid or used claim code");
        }

        // Mark claim code as used
        var staffId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        order.IsClaimCodeUsed = true;
        order.ClaimCodeUsedAt = DateTime.UtcNow;
        order.ClaimCodeUsedByStaffId = staffId;
        order.OrderStatus = "Processing";
        order.UpdatedAt = DateTime.UtcNow;

        // If payment was pending, mark as completed (simplified)
        if (order.PaymentStatus == "Pending")
        {
            order.PaymentStatus = "Completed";
        }

        await _context.SaveChangesAsync();

        // Update user's successful order count if this is their first time using this claim code
        var user = await _userManager.FindByIdAsync(order.UserId);
        if (user != null)
        {
            user.SuccessfulOrderCount += 1;
            await _userManager.UpdateAsync(user);
        }

        return Ok(new
        {
            message = "Claim code processed successfully",
            order = new OrderResponseDto
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                SubTotal = order.SubTotal,
                DiscountAmount = order.DiscountAmount,
                TotalAmount = order.TotalAmount,
                OrderStatus = order.OrderStatus,
                PaymentStatus = order.PaymentStatus,
                CreatedAt = order.CreatedAt,
                Items = order.OrderItems.Select(oi => new OrderItemResponseDto
                {
                    Id = oi.Id,
                    BookId = oi.BookId,
                    BookTitle = oi.Book.Title,
                    BookImageUrl = oi.Book.ImageUrl,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    UnitDiscount = oi.UnitDiscount,
                    TotalPrice = oi.TotalPrice
                }).ToList()
            }
        });
    }

    // GET: api/Orders/admin - Get all orders (admin only)
    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<OrderResponseDto>>> GetAllOrders([FromQuery] string status = null)
    {
        var query = _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Book)
            .Include(o => o.User)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(o => o.OrderStatus == status);
        }

        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Take(100) // Limit to 100 for performance
            .ToListAsync();

        var orderDtos = orders.Select(o => new OrderResponseDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            SubTotal = o.SubTotal,
            DiscountAmount = o.DiscountAmount,
            DiscountCode = o.DiscountCode,
            TotalAmount = o.TotalAmount,
            OrderStatus = o.OrderStatus,
            PaymentStatus = o.PaymentStatus,
            CreatedAt = o.CreatedAt,
            ClaimCode = o.ClaimCode,
            Items = o.OrderItems.Select(oi => new OrderItemResponseDto
            {
                Id = oi.Id,
                BookId = oi.BookId,
                BookTitle = oi.Book.Title,
                BookImageUrl = oi.Book.ImageUrl,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                UnitDiscount = oi.UnitDiscount,
                TotalPrice = oi.TotalPrice
            }).ToList()
        }).ToList();

        return orderDtos;
    }

    // Helper methods - Updated to create shorter strings
    private string GenerateOrderNumber()
    {
        // Generate a shorter order number (max 19 characters)
        return "ORD" + DateTime.UtcNow.ToString("yyMMdd") + Guid.NewGuid().ToString().Substring(0, 6).ToUpper();
        // Example: ORD2505071A2B3C (16 characters)
    }

    private string GenerateClaimCode()
    {
        // Generate a shorter claim code (6 characters)
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 6)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }
}