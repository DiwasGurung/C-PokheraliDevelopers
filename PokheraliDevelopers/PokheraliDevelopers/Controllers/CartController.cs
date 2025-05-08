<<<<<<< HEAD
﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PokheraliDevelopers.Data;
using PokheraliDevelopers.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace PokheraliDevelopers.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public CartController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/Cart
        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var cartItems = await _context.CartItems
                .Where(ci => ci.UserId == userId)
                .Include(ci => ci.Book)
                .ToListAsync();

            var cartDto = new
            {
                items = cartItems.Select(ci => new
                {
                    id = ci.Id,
                    bookId = ci.BookId,
                    bookTitle = ci.Book.Title,
                    bookAuthor = ci.Book.Author,
                    bookImageUrl = ci.Book.ImageUrl,
                    bookPrice = ci.Book.Price,
                    quantity = ci.Quantity,
                    subtotal = ci.Book.Price * ci.Quantity
                }).ToList(),
                totalItems = cartItems.Sum(ci => ci.Quantity),
                totalPrice = cartItems.Sum(ci => ci.Book.Price * ci.Quantity)
            };

            return Ok(cartDto);
        }

        // POST: api/Cart/add
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto addToCartDto)
        {
            if (!ModelState.IsValid)
            {
                
                return BadRequest(ModelState);
            }

            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            // Check if the book exists
            var book = await _context.Books.FindAsync(addToCartDto.BookId);
            if (book == null)
            {
                return NotFound("Book not found");
            }

            // Check if the book is already in the cart
            var existingCartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.BookId == addToCartDto.BookId);

            if (existingCartItem != null)
            {
                // Update the quantity
                existingCartItem.Quantity += addToCartDto.Quantity;

                // Check if quantity exceeds stock
                if (book.Stock > 0 && existingCartItem.Quantity > book.Stock)
                {
                    existingCartItem.Quantity = book.Stock;
                }

                _context.CartItems.Update(existingCartItem);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    id = existingCartItem.Id,
                    bookId = existingCartItem.BookId,
                    bookTitle = book.Title,
                    bookAuthor = book.Author,
                    bookImageUrl = book.ImageUrl,
                    bookPrice = book.Price,
                    quantity = existingCartItem.Quantity,
                    subtotal = book.Price * existingCartItem.Quantity
                });
            }
            else
            {
                // Create a new cart item
                var quantity = addToCartDto.Quantity;

                // Check if quantity exceeds stock
                if (book.Stock > 0 && quantity > book.Stock)
                {
                    quantity = book.Stock;
                }

                var newCartItem = new CartItem
                {
                    UserId = userId,
                    BookId = addToCartDto.BookId,
                    Quantity = quantity,
                    DateAdded = DateTime.UtcNow
                };

                _context.CartItems.Add(newCartItem);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    id = newCartItem.Id,
                    bookId = newCartItem.BookId,
                    bookTitle = book.Title,
                    bookAuthor = book.Author,
                    bookImageUrl = book.ImageUrl,
                    bookPrice = book.Price,
                    quantity = newCartItem.Quantity,
                    subtotal = book.Price * newCartItem.Quantity
                });
            }
        }

        // PUT: api/Cart/update
        [HttpPut("update")]
        public async Task<IActionResult> UpdateCartItem([FromBody] UpdateCartItemDto updateCartItemDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var cartItem = await _context.CartItems
                .Include(ci => ci.Book)
                .FirstOrDefaultAsync(ci => ci.Id == updateCartItemDto.CartItemId && ci.UserId == userId);

            if (cartItem == null)
            {
                return NotFound("Cart item not found");
            }

            // Check if the requested quantity is valid
            if (updateCartItemDto.Quantity <= 0)
            {
                // Remove the item if quantity is 0 or negative
                _context.CartItems.Remove(cartItem);
            }
            else
            {
                // Update the quantity
                if (cartItem.Book.Stock > 0 && updateCartItemDto.Quantity > cartItem.Book.Stock)
                {
                    cartItem.Quantity = cartItem.Book.Stock;
                }
                else
                {
                    cartItem.Quantity = updateCartItemDto.Quantity;
                }

                _context.CartItems.Update(cartItem);
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        // DELETE: api/Cart/{cartItemId}
        [HttpDelete("{cartItemId}")]
        public async Task<IActionResult> RemoveFromCart(int cartItemId)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId && ci.UserId == userId);

            if (cartItem == null)
            {
                return NotFound("Cart item not found");
            }

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // DELETE: api/Cart/clear
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User is not authenticated.");
            }

            var cartItems = await _context.CartItems
                .Where(ci => ci.UserId == userId)
                .ToListAsync();

            _context.CartItems.RemoveRange(cartItems);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }

    public class AddToCartDto
    {
        public int BookId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public class UpdateCartItemDto
    {
        public int CartItemId { get; set; }
        public int Quantity { get; set; }
=======
﻿// Controllers/CartController.cs (updated)
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CartController : ControllerBase
{
    private readonly DatabaseHandlerEfCoreExample _context;

    public CartController(DatabaseHandlerEfCoreExample context)
    {
        _context = context;
    }

    // GET: api/Cart
    [HttpGet]
    public async Task<ActionResult<CartDto>> GetCart()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var cartItems = await _context.CartItems
            .Where(c => c.UserId == userId)
            .Include(c => c.Book)
            .ToListAsync();

        // Check if user has a profile, if not create one
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

        var cartDto = new CartDto
        {
            Items = cartItems.Select(c => new CartItemDto
            {
                Id = c.Id,
                BookId = c.BookId,
                BookTitle = c.Book.Title,
                BookAuthor = c.Book.Author,
                BookImageUrl = c.Book.ImageUrl,
                Quantity = c.Quantity,
                UnitPrice = c.Book.Price,
                DiscountPercentage = c.Book.IsOnSale &&
                                   c.Book.DiscountPercentage.HasValue &&
                                   c.Book.DiscountStartDate <= DateTime.UtcNow &&
                                   (!c.Book.DiscountEndDate.HasValue || c.Book.DiscountEndDate >= DateTime.UtcNow)
                                   ? c.Book.DiscountPercentage
                                   : null,
                LineTotal = CalculateLineTotal(c.Book, c.Quantity)
            }).ToList()
        };

        // Calculate totals and check for discounts
        cartDto.Subtotal = cartDto.Items.Sum(i => i.LineTotal);

        // Check if order qualifies for bulk discount (5+ books)
        cartDto.QualifiesForBulkDiscount = cartItems.Sum(c => c.Quantity) >= 5;

        // Check if user has stackable discount
        cartDto.HasStackableDiscount = userProfile.SuccessfulOrdersCount > 0
                                    && userProfile.SuccessfulOrdersCount % 10 == 0
                                    && !userProfile.StackableDiscountUsed;

        // Calculate discount amount
        decimal discountRate = 0;
        if (cartDto.QualifiesForBulkDiscount)
        {
            discountRate += 0.05m; // 5% bulk discount
        }

        if (cartDto.HasStackableDiscount)
        {
            discountRate += 0.10m; // 10% stackable discount
        }

        cartDto.DiscountAmount = cartDto.Subtotal * discountRate;
        cartDto.FinalAmount = cartDto.Subtotal - cartDto.DiscountAmount;

        return cartDto;
    }

    // POST: api/Cart
    [HttpPost]
    public async Task<ActionResult<CartItemDto>> AddToCart(AddCartItemDto addCartItemDto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Check if book exists and is in stock
        var book = await _context.Books.FindAsync(addCartItemDto.BookId);
        if (book == null)
        {
            return NotFound("Book not found");
        }

        if (book.StockQuantity < addCartItemDto.Quantity)
        {
            return BadRequest("Requested quantity exceeds available stock");
        }

        // Check if item already in cart
        var existingCartItem = await _context.CartItems
            .FirstOrDefaultAsync(c => c.UserId == userId && c.BookId == addCartItemDto.BookId);

        if (existingCartItem != null)
        {
            // Update quantity
            existingCartItem.Quantity += addCartItemDto.Quantity;
            existingCartItem.ModifiedAt = DateTime.UtcNow;

            // Check stock again after adding
            if (existingCartItem.Quantity > book.StockQuantity)
            {
                return BadRequest("Total quantity exceeds available stock");
            }

            await _context.SaveChangesAsync();

            return Ok(new CartItemDto
            {
                Id = existingCartItem.Id,
                BookId = book.Id,
                BookTitle = book.Title,
                BookAuthor = book.Author,
                BookImageUrl = book.ImageUrl,
                Quantity = existingCartItem.Quantity,
                UnitPrice = book.Price,
                DiscountPercentage = book.IsOnSale &&
                                  book.DiscountPercentage.HasValue &&
                                  book.DiscountStartDate <= DateTime.UtcNow &&
                                  (!book.DiscountEndDate.HasValue || book.DiscountEndDate >= DateTime.UtcNow)
                                  ? book.DiscountPercentage
                                  : null,
                LineTotal = CalculateLineTotal(book, existingCartItem.Quantity)
            });
        }

        // Add new cart item
        var cartItem = new CartItem
        {
            UserId = userId,
            BookId = addCartItemDto.BookId,
            Quantity = addCartItemDto.Quantity,
            CreatedAt = DateTime.UtcNow,
            ModifiedAt = DateTime.UtcNow
        };

        _context.CartItems.Add(cartItem);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCartItem), new { id = cartItem.Id }, new CartItemDto
        {
            Id = cartItem.Id,
            BookId = book.Id,
            BookTitle = book.Title,
            BookAuthor = book.Author,
            BookImageUrl = book.ImageUrl,
            Quantity = cartItem.Quantity,
            UnitPrice = book.Price,
            DiscountPercentage = book.IsOnSale &&
                              book.DiscountPercentage.HasValue &&
                              book.DiscountStartDate <= DateTime.UtcNow &&
                              (!book.DiscountEndDate.HasValue || book.DiscountEndDate >= DateTime.UtcNow)
                              ? book.DiscountPercentage
                              : null,
            LineTotal = CalculateLineTotal(book, cartItem.Quantity)
        });
    }

    // GET: api/Cart/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<CartItemDto>> GetCartItem(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var cartItem = await _context.CartItems
            .Include(c => c.Book)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (cartItem == null)
        {
            return NotFound();
        }

        return new CartItemDto
        {
            Id = cartItem.Id,
            BookId = cartItem.BookId,
            BookTitle = cartItem.Book.Title,
            BookAuthor = cartItem.Book.Author,
            BookImageUrl = cartItem.Book.ImageUrl,
            Quantity = cartItem.Quantity,
            UnitPrice = cartItem.Book.Price,
            DiscountPercentage = cartItem.Book.IsOnSale &&
                              cartItem.Book.DiscountPercentage.HasValue &&
                              cartItem.Book.DiscountStartDate <= DateTime.UtcNow &&
                              (!cartItem.Book.DiscountEndDate.HasValue || cartItem.Book.DiscountEndDate >= DateTime.UtcNow)
                              ? cartItem.Book.DiscountPercentage
                              : null,
            LineTotal = CalculateLineTotal(cartItem.Book, cartItem.Quantity)
        };
    }

    // PUT: api/Cart/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCartItem(int id, UpdateCartItemDto updateCartItemDto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var cartItem = await _context.CartItems
            .Include(c => c.Book)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (cartItem == null)
        {
            return NotFound();
        }

        // Check stock
        if (updateCartItemDto.Quantity > cartItem.Book.StockQuantity)
        {
            return BadRequest("Requested quantity exceeds available stock");
        }

        cartItem.Quantity = updateCartItemDto.Quantity;
        cartItem.ModifiedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Cart/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> RemoveFromCart(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var cartItem = await _context.CartItems
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (cartItem == null)
        {
            return NotFound();
        }

        _context.CartItems.Remove(cartItem);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // Helper method to calculate line total with discounts
    private decimal CalculateLineTotal(Book book, int quantity)
    {
        decimal price = book.Price;

        // Apply book-specific discount if applicable
        if (book.IsOnSale &&
            book.DiscountPercentage.HasValue &&
            book.DiscountStartDate <= DateTime.UtcNow &&
            (!book.DiscountEndDate.HasValue || book.DiscountEndDate >= DateTime.UtcNow))
        {
            price -= price * (book.DiscountPercentage.Value / 100m);
        }

        return price * quantity;
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60
    }
}