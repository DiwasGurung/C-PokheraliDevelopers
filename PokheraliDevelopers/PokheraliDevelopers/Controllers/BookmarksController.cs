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

namespace PokheraliDevelopers.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BookmarksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public BookmarksController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Bookmarks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookmarkDto>>> GetBookmarks()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var bookmarks = await _context.Bookmarks
                .Where(b => b.UserId == userId)
                .Include(b => b.Book)
                .Select(b => new BookmarkDto
                {
                    Id = b.BookId, // Changed to return BookId as Id for simplicity in frontend
                    BookId = b.BookId,
                    Title = b.Book.Title,
                    Author = b.Book.Author,
                    ImageUrl = b.Book.ImageUrl,
                    Price = b.Book.Price,
                    IsOnSale = b.Book.IsOnSale &&
                              b.Book.DiscountPercentage.HasValue &&
                              b.Book.DiscountStartDate <= DateTime.UtcNow &&
                              (!b.Book.DiscountEndDate.HasValue || b.Book.DiscountEndDate >= DateTime.UtcNow),
                    DiscountPercentage = b.Book.DiscountPercentage,
                    AddedOn = b.CreatedAt
                })
                .ToListAsync();

            return bookmarks;
        }

        // POST: api/Bookmarks - Add bookmark
        [HttpPost]
        public async Task<IActionResult> AddBookmark([FromBody] int bookId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Check if bookmark already exists
            var existingBookmark = await _context.Bookmarks
                .FirstOrDefaultAsync(b => b.BookId == bookId && b.UserId == userId);

            if (existingBookmark != null)
            {
                return Ok(new { message = "Book already bookmarked" });
            }

            // Check if book exists
            var book = await _context.Books.FindAsync(bookId);
            if (book == null)
            {
                return NotFound(new { message = "Book not found" });
            }

            var bookmark = new Bookmark
            {
                BookId = bookId,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Bookmarks.Add(bookmark);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Book bookmarked successfully",
                bookmarkId = bookmark.Id,
                bookId = bookmark.BookId
            });
        }

        // DELETE: api/Bookmarks/{bookId} - Remove bookmark
        [HttpDelete("{bookId}")]
        public async Task<IActionResult> RemoveBookmark(int bookId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var bookmark = await _context.Bookmarks
                .FirstOrDefaultAsync(b => b.BookId == bookId && b.UserId == userId);

            if (bookmark == null)
            {
                return Ok(new { message = "Bookmark not found" }); // Changed to Ok to avoid frontend errors
            }

            _context.Bookmarks.Remove(bookmark);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Bookmark removed successfully",
                bookId = bookId
            });
        }
    }
}