using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PokheraliDevelopers.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
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
    [Authorize(Roles = "Member")]
    public async Task<ActionResult<IEnumerable<BookmarkDto>>> GetUserBookmarks()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var bookmarks = await _context.Bookmarks
            .Include(b => b.Book)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        return bookmarks.Select(b => new BookmarkDto
        {
            Id = b.Id,
            BookId = b.BookId,
            BookTitle = b.Book.Title,
            BookAuthor = b.Book.Author,
            BookImageUrl = b.Book.ImageUrl,
            BookPrice = b.Book.Price,
            BookDiscountPercentage = b.Book.DiscountPercentage,
            CreatedAt = b.CreatedAt
        }).ToList();
    }

    // POST: api/Bookmarks
    [HttpPost]
    [Authorize(Roles = "Member")]
    public async Task<ActionResult<BookmarkDto>> AddBookmark(int bookId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Check if book exists
        var book = await _context.Books.FindAsync(bookId);
        if (book == null)
        {
            return NotFound("Book not found");
        }

        // Check if already bookmarked
        var existingBookmark = await _context.Bookmarks
            .FirstOrDefaultAsync(b => b.UserId == userId && b.BookId == bookId);

        if (existingBookmark != null)
        {
            return Conflict("Book already bookmarked");
        }

        var bookmark = new Bookmark
        {
            UserId = userId,
            BookId = bookId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Bookmarks.Add(bookmark);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBookmark), new { id = bookmark.Id }, new BookmarkDto
        {
            Id = bookmark.Id,
            BookId = book.Id,
            BookTitle = book.Title,
            BookAuthor = book.Author,
            BookImageUrl = book.ImageUrl,
            BookPrice = book.Price,
            BookDiscountPercentage = book.DiscountPercentage,
            CreatedAt = bookmark.CreatedAt
        });
    }

    // GET: api/Bookmarks/{id}
    [HttpGet("{id}")]
    [Authorize(Roles = "Member")]
    public async Task<ActionResult<BookmarkDto>> GetBookmark(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var bookmark = await _context.Bookmarks
            .Include(b => b.Book)
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (bookmark == null)
        {
            return NotFound("Bookmark not found");
        }

        return new BookmarkDto
        {
            Id = bookmark.Id,
            BookId = bookmark.BookId,
            BookTitle = bookmark.Book.Title,
            BookAuthor = bookmark.Book.Author,
            BookImageUrl = bookmark.Book.ImageUrl,
            BookPrice = bookmark.Book.Price,
            BookDiscountPercentage = bookmark.Book.DiscountPercentage,
            CreatedAt = bookmark.CreatedAt
        };
    }

    // DELETE: api/Bookmarks/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Member")]
    public async Task<IActionResult> DeleteBookmark(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var bookmark = await _context.Bookmarks
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (bookmark == null)
        {
            return NotFound("Bookmark not found");
        }

        _context.Bookmarks.Remove(bookmark);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}