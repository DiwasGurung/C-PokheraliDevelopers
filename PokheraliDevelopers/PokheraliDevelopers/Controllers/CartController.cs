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
using PokheraliDevelopers.Service;
using PokheraliDevelopers.Services;

namespace PokheraliDevelopers.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IDiscountService _discountService;

        public CartController(ApplicationDbContext context, IDiscountService discountService)
        {
            _context = context;
            _discountService = discountService;
        }

        // GET: api/Cart
        [HttpGet]
        public async Task<ActionResult<CartDto>> GetCart()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _context.Users.FindAsync(userId);

            var cartItems = await _context.CartItems
                .Where(ci => ci.UserId == userId)
                .Include(ci => ci.Book)
                .ToListAsync();

            var cartItemDtos = cartItems.Select(ci => new CartItemDto
            {
                Id = ci.Id,
                BookId = ci.BookId,
                BookTitle = ci.Book.Title,
                BookAuthor = ci.Book.Author,
                BookImageUrl = ci.Book.ImageUrl,
                BookPrice = GetDiscountedPrice(ci.Book),
                Quantity = ci.Quantity,
                Subtotal = GetDiscountedPrice(ci.Book) * ci.Quantity
            }).ToList();

            var subTotal = cartItemDtos.Sum(ci => ci.Subtotal);

            // Feature 9: Member can get 5% discounts for an order of 5+ books and the 10% stackable discount after 10 successful orders
            var totalItems = cartItems.Sum(ci => ci.Quantity);
            var hasVolumeDiscount = totalItems >= 5;
            var hasLoyaltyDiscount = user.HasLoyaltyDiscount;

            var discountAmount = _discountService.CalculateDiscountAmount(subTotal, hasVolumeDiscount, hasLoyaltyDiscount);
            var totalPrice = subTotal - discountAmount;

            return new CartDto
            {
                Items = cartItemDtos,
                TotalItems = totalItems,
                SubTotal = subTotal,
                DiscountAmount = discountAmount,
                TotalPrice = totalPrice,
                HasVolumeDiscount = hasVolumeDiscount,
                HasLoyaltyDiscount = hasLoyaltyDiscount
            };
        }

        // Feature 6: Member can cart books (Add to Cart)
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart(AddToCartDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Check if the book exists
            var book = await _context.Books.FindAsync(dto.BookId);
            if (book == null)
            {
                return NotFound(new { message = "Book not found" });
            }

            // Check if the book is in stock
            if (book.Stock < dto.Quantity)
            {
                return BadRequest(new { message = "Not enough stock available" });
            }

            // Check if the book is already in the cart
            var existingCartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.BookId == dto.BookId);

            if (existingCartItem != null)
            {
                // Update the quantity
                existingCartItem.Quantity += dto.Quantity;
                _context.CartItems.Update(existingCartItem);
            }
            else
            {
                // Create a new cart item
                var cartItem = new CartItem
                {
                    UserId = userId,
                    BookId = dto.BookId,
                    Quantity = dto.Quantity,
                    DateAdded = DateTime.UtcNow
                };
                _context.CartItems.Add(cartItem);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Book added to cart successfully" });
        }

        [HttpPut("update/{cartItemId}")]
        public async Task<IActionResult> UpdateCartItem(int cartItemId, [FromBody] int quantity)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var cartItem = await _context.CartItems
                .Include(ci => ci.Book)
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId && ci.UserId == userId);

            if (cartItem == null)
            {
                return NotFound(new { message = "Cart item not found" });
            }

            if (quantity <= 0)
            {
                // Remove the item if quantity is 0 or negative
                _context.CartItems.Remove(cartItem);
            }
            else
            {
                // Check if there's enough stock
                if (cartItem.Book.Stock < quantity)
                {
                    return BadRequest(new { message = "Not enough stock available" });
                }

                // Update the quantity
                cartItem.Quantity = quantity;
                _context.CartItems.Update(cartItem);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cart updated successfully" });
        }

        [HttpDelete("remove/{cartItemId}")]
        public async Task<IActionResult> RemoveFromCart(int cartItemId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId && ci.UserId == userId);

            if (cartItem == null)
            {
                return NotFound(new { message = "Cart item not found" });
            }

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Item removed from cart successfully" });
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var cartItems = await _context.CartItems
                .Where(ci => ci.UserId == userId)
                .ToListAsync();

            _context.CartItems.RemoveRange(cartItems);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cart cleared successfully" });
        }

        // Helper method to get discounted price
        private decimal GetDiscountedPrice(Book book)
        {
            if (book.IsOnSale &&
                book.DiscountPercentage.HasValue &&
                book.DiscountStartDate <= DateTime.UtcNow &&
                (!book.DiscountEndDate.HasValue || book.DiscountEndDate >= DateTime.UtcNow))
            {
                var discountAmount = book.Price * (book.DiscountPercentage.Value / 100);
                return book.Price - discountAmount;
            }

            return book.Price;
        }
    }
}