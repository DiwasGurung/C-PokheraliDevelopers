<<<<<<< HEAD
﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PokheraliDevelopers.Data;
=======
﻿// Controllers/BookmarksController.cs (updated)
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

<<<<<<< HEAD
[ApiController]
[Route("api/[controller]")]
public class BookmarksController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BookmarksController(ApplicationDbContext context)
=======
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class BookmarksController : ControllerBase
{
    private readonly DatabaseHandlerEfCoreExample _context;

    public BookmarksController(DatabaseHandlerEfCoreExample context)
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60
    {
        _context = context;
    }

<<<<<<< HEAD
    // GET: api/Bookmarks - Get all bookmarks for the logged-in user
    [HttpGet]
    [Authorize(Roles = "Member")]
    public async Task<ActionResult<IEnumerable<BookResponseDto>>> GetUserBookmarks()
=======
    // GET: api/Bookmarks
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookmarkDto>>> GetBookmarks()
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var bookmarks = await _context.Bookmarks
<<<<<<< HEAD
            .Include(b => b.Book)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        var bookDtos = bookmarks.Select(b => new BookResponseDto
        {
            Id = b.Book.Id,
            Title = b.Book.Title,
            Author = b.Book.Author,
            Description = b.Book.Description,
            Price = b.Book.Price,
            Stock = b.Book.Stock,
            Genre = b.Book.Genre,
            ISBN = b.Book.ISBN,
            Publisher = b.Book.Publisher,
            PublishDate = b.Book.PublishDate,
            Language = b.Book.Language,
            Format = b.Book.Format,
            Pages = b.Book.Pages,
            Dimensions = b.Book.Dimensions,
            Weight = b.Book.Weight,
            ImageUrl = b.Book.ImageUrl,
            CreatedAt = b.Book.CreatedAt,
            UpdatedAt = b.Book.UpdatedAt
        }).ToList();

        return bookDtos;
    }

    // POST: api/Bookmarks - Add a book to bookmarks
    [HttpPost]
    [Authorize(Roles = "Member")]
    public async Task<IActionResult> AddBookmark([FromBody] int bookId)
=======
            .Where(b => b.UserId == userId)
            .Include(b => b.Book)
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
    public async Task<ActionResult<BookmarkDto>> AddBookmark(int bookId)
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Check if book exists
        var book = await _context.Books.FindAsync(bookId);
        if (book == null)
        {
            return NotFound("Book not found");
        }

<<<<<<< HEAD
        // Check if bookmark already exists
        var existingBookmark = await _context.Bookmarks
            .FirstOrDefaultAsync(b => b.BookId == bookId && b.UserId == userId);

        if (existingBookmark != null)
        {
            return BadRequest("Book is already in your bookmarks");
        }

        // Create bookmark
        var bookmark = new Bookmark
        {
            BookId = bookId,
            UserId = userId,
=======
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
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60
            CreatedAt = DateTime.UtcNow
        };

        _context.Bookmarks.Add(bookmark);
        await _context.SaveChangesAsync();

<<<<<<< HEAD
        return Ok(new { message = "Book added to bookmarks" });
    }

    // DELETE: api/Bookmarks/{bookId} - Remove a book from bookmarks
    [HttpDelete("{bookId}")]
    [Authorize(Roles = "Member")]
    public async Task<IActionResult> RemoveBookmark(int bookId)
=======
        return CreatedAtAction(nameof(GetBookmark), new { id = bookmark.Id }, new BookmarkDto
        {
            Id = bookmark.Id,
            BookId = book.Id,
            BookTitle = book.Title,
            BookAuthor = book.Author,
            BookImageUrl = book.ImageUrl,
            BookPrice = book.Price,
            // Continuing BookmarksController.cs from where we left off
            BookDiscountPercentage = book.DiscountPercentage,
            CreatedAt = bookmark.CreatedAt
        });
    }

    // GET: api/Bookmarks/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<BookmarkDto>> GetBookmark(int id)
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var bookmark = await _context.Bookmarks
<<<<<<< HEAD
            .FirstOrDefaultAsync(b => b.BookId == bookId && b.UserId == userId);

        if (bookmark == null)
        {
            return NotFound("Bookmark not found");
=======
            .Include(b => b.Book)
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (bookmark == null)
        {
            return NotFound();
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
    public async Task<IActionResult> DeleteBookmark(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var bookmark = await _context.Bookmarks
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (bookmark == null)
        {
            return NotFound();
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60
        }

        _context.Bookmarks.Remove(bookmark);
        await _context.SaveChangesAsync();

<<<<<<< HEAD
        return Ok(new { message = "Book removed from bookmarks" });
=======
        return NoContent();
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60
    }
}