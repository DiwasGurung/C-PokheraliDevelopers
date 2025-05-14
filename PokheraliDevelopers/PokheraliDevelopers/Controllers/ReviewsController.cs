using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PokheraliDevelopers.Data;
using PokheraliDevelopers.Dto;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ReviewsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Reviews/book/{bookId} - Get all reviews for a book
    [HttpGet("book/{bookId}")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetBookReviews(int bookId)
    {
        var book = await _context.Books.FindAsync(bookId);
        if (book == null)
        {
            return NotFound("Book not found");
        }

        var reviews = await _context.Reviews
            .Include(r => r.User)
            .Where(r => r.BookId == bookId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var reviewDtos = reviews.Select(r => new ReviewDto
        {
            Id = r.Id,
            BookId = r.BookId,
            UserId = r.UserId,
            UserName = r.User.UserName,
            Rating = r.Rating,
            Comment = r.Comment,
            CreatedAt = r.CreatedAt
        }).ToList();

        return reviewDtos;
    }

    // GET: api/Reviews/user - Get all reviews by the logged-in user
    [HttpGet("user")]
    [Authorize(Roles = "Member")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetUserReviews()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var reviews = await _context.Reviews
            .Include(r => r.Book)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var reviewDtos = reviews.Select(r => new ReviewDto
        {
            Id = r.Id,
            BookId = r.BookId,
            UserId = r.UserId,
            UserName = User.Identity.Name,
            Rating = r.Rating,
            Comment = r.Comment,
            CreatedAt = r.CreatedAt
        }).ToList();

        return reviewDtos;
    }

    [HttpPost]
    public async Task<ActionResult<ReviewDto>> AddReview([FromBody] ReviewDto reviewDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var userName = User.Identity?.Name;

        try
        {
            // Check if book exists
            var book = await _context.Books.FindAsync(reviewDto.BookId);
            if (book == null)
            {
                return NotFound("Book not found");
            }

            // Check if user has purchased the book
            // For testing purposes, you might want to temporarily comment this out
            var hasPurchased = await _context.OrderItems
                .Include(oi => oi.Order)
                .AnyAsync(oi =>
                    oi.BookId == reviewDto.BookId &&
                    oi.Order.UserId == userId &&
                    oi.Order.OrderStatus != OrderStatus.Cancelled);

            if (!hasPurchased)
            {
                return BadRequest("You can only review books you have purchased");
            }

            // Check if user has already reviewed this book
            var existingReview = await _context.Reviews
                .FirstOrDefaultAsync(r => r.BookId == reviewDto.BookId && r.UserId == userId);

            if (existingReview != null)
            {
                return BadRequest("You have already reviewed this book");
            }

            // Verify the rating is between 1 and 5
            if (reviewDto.Rating < 1 || reviewDto.Rating > 5)
            {
                return BadRequest("Rating must be between 1 and 5");
            }

            // Create review
            var review = new Review
            {
                BookId = reviewDto.BookId,
                UserId = userId,
                Rating = reviewDto.Rating,
                Comment = reviewDto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            // Return the created review
            var createdReviewDto = new ReviewDto
            {
                Id = review.Id,
                BookId = review.BookId,
                BookTitle = book.Title,
                UserId = review.UserId,
                UserName = userName,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt
            };

            return CreatedAtAction(nameof(GetBookReviews), new { bookId = review.BookId }, createdReviewDto);
        }
        catch (Exception ex)
        {
            // Log the exception for debugging
            Console.WriteLine($"Error in AddReview: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    // PUT: api/Reviews/{id} - Update a review
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateReview(int id, [FromBody] ReviewDto reviewDto)
    {
        if (id != reviewDto.Id)
        {
            return BadRequest("Review ID mismatch");
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var review = await _context.Reviews.FindAsync(id);
        if (review == null)
        {
            return NotFound("Review not found");
        }

        // Ensure the review belongs to the user
        if (review.UserId != userId)
        {
            return Forbid();
        }

        // Update review
        review.Rating = reviewDto.Rating;
        review.Comment = reviewDto.Comment;
      

        _context.Entry(review).State = EntityState.Modified;

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

    // DELETE: api/Reviews/{id} - Delete a review
    [HttpDelete("{id}")]
    [Authorize(Roles = "Member,Admin")]
    public async Task<IActionResult> DeleteReview(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var userRoles = User.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList();

        var review = await _context.Reviews.FindAsync(id);
        if (review == null)
        {
            return NotFound("Review not found");
        }

        // Ensure the review belongs to the user or the user is an admin
        if (review.UserId != userId && !userRoles.Contains("Admin"))
        {
            return Forbid();
        }

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ReviewExists(int id)
    {
        return _context.Reviews.Any(e => e.Id == id);
    }
}