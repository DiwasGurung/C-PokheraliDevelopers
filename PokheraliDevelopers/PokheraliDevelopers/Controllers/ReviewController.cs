// Controllers/ReviewsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class ReviewsController : ControllerBase
{
    private readonly DatabaseHandlerEfCoreExample _context;

    public ReviewsController(DatabaseHandlerEfCoreExample context)
    {
        _context = context;
    }

    // GET: api/Reviews/Book/{bookId}
    [HttpGet("Book/{bookId}")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetBookReviews(int bookId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.BookId == bookId)
            .Include(r => r.User)
            .Include(r => r.Book)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return reviews.Select(r => new ReviewDto
        {
            Id = r.Id,
            BookId = r.BookId,
            BookTitle = r.Book.Title,
            UserName = GetUserDisplayName(r.User),
            Rating = r.Rating,
            Comment = r.Comment,
            CreatedAt = r.CreatedAt
        }).ToList();
    }

    // GET: api/Reviews/User
    [Authorize]
    [HttpGet("User")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetUserReviews()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var reviews = await _context.Reviews
            .Where(r => r.UserId == userId)
            .Include(r => r.Book)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return reviews.Select( r => new ReviewDto
        {
            Id = r.Id,
            BookId = r.BookId,
            BookTitle = r.Book.Title,
            UserName = GetUserDisplayName( _context.Users.FindAsync(userId)),
            Rating = r.Rating,
            Comment = r.Comment,
            CreatedAt = r.CreatedAt
        }).ToList();
    }

    // GET: api/Reviews/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<ReviewDto>> GetReview(int id)
    {
        var review = await _context.Reviews
            .Include(r => r.User)
            .Include(r => r.Book)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (review == null)
        {
            return NotFound();
        }

        return new ReviewDto
        {
            Id = review.Id,
            BookId = review.BookId,
            BookTitle = review.Book.Title,
            UserName = GetUserDisplayName(review.User),
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }

    // POST: api/Reviews
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ReviewDto>> CreateReview(CreateReviewDto createReviewDto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Check if book exists
        var book = await _context.Books.FindAsync(createReviewDto.BookId);
        if (book == null)
        {
            return NotFound("Book not found");
        }

        // Check if user has purchased the book
        var hasPurchased = await _context.OrderItems
            .AnyAsync(oi => oi.BookId == createReviewDto.BookId &&
                           oi.Order.UserId == userId &&
                           oi.Order.Status == OrderStatus.Completed);

        if (!hasPurchased)
        {
            return BadRequest("You can only review books you have purchased");
        }

        // Check if user already reviewed this book
        var existingReview = await _context.Reviews
            .FirstOrDefaultAsync(r => r.BookId == createReviewDto.BookId && r.UserId == userId);

        if (existingReview != null)
        {
            return Conflict("You have already reviewed this book");
        }

        var review = new Review
        {
            UserId = userId,
            BookId = createReviewDto.BookId,
            Rating = createReviewDto.Rating,
            Comment = createReviewDto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(userId);

        return CreatedAtAction(nameof(GetReview), new { id = review.Id }, new ReviewDto
        {
            Id = review.Id,
            BookId = review.BookId,
            BookTitle = book.Title,
            UserName = GetUserDisplayName(user),
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        });
    }

    // PUT: api/Reviews/{id}
    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateReview(int id, CreateReviewDto updateReviewDto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var review = await _context.Reviews
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        if (review == null)
        {
            return NotFound();
        }

        // Ensure book ID hasn't changed
        if (review.BookId != updateReviewDto.BookId)
        {
            return BadRequest("Cannot change the book being reviewed");
        }

        review.Rating = updateReviewDto.Rating;
        review.Comment = updateReviewDto.Comment;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ReviewExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // DELETE: api/Reviews/{id}
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReview(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var review = await _context.Reviews.FindAsync(id);
        if (review == null)
        {
            return NotFound();
        }

        // Only allow the author or an admin to delete a review
        if (review.UserId != userId && !isAdmin)
        {
            return Forbid();
        }

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // Helper method to check if review exists
    private bool ReviewExists(int id)
    {
        return _context.Reviews.Any(e => e.Id == id);
    }

    // Helper method to get user display name
    private string GetUserDisplayName(IdentityUser user)
    {
        if (user == null)
            return "Unknown User";

        // Try to get the user profile for first/last name
        var userProfile = _context.UserProfiles.FirstOrDefault(up => up.UserId == user.Id);
        if (userProfile != null && !string.IsNullOrEmpty(userProfile.FirstName))
        {
            return $"{userProfile.FirstName} {userProfile.LastName}".Trim();
        }

        // Fall back to email or username
        return user.Email?.Split('@')[0] ?? user.UserName;
    }
}