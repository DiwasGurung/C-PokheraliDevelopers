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
    public class BooksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        private FileService _fileService;

        public BooksController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Books
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookResponseDto>>> GetBooks(
        int page = 1,
        int pageSize = 10,
        string search = "",
        string sort = "title",
        bool desc = false,
        string genre = "",
        decimal? minPrice = null,
        decimal? maxPrice = null,
        int? rating = null,
        bool? inStock = null)
        {
            // Set default values if page or pageSize are not provided
            page = page < 1 ? 1 : page;
            pageSize = pageSize < 1 ? 10 : pageSize;

            var query = _context.Books.AsQueryable();

            // Search filter
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(b =>
                    b.Title.ToLower().Contains(search) ||
                    b.Author.ToLower().Contains(search) ||
                    (b.ISBN != null && b.ISBN.ToLower().Contains(search)));
            }

            // Genre filter
            if (!string.IsNullOrEmpty(genre))
            {
                query = query.Where(b => b.Genre == genre);
            }

            // Price range filter
            if (minPrice.HasValue)
            {
                query = query.Where(b => b.Price >= minPrice);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(b => b.Price <= maxPrice);
            }

            // Rating filter
            if (rating.HasValue)
            {
                // Add a filter condition based on rating if applicable
                query = query.Where(b => b.Reviews.Any() && b.Reviews.Average(r => r.Rating) >= rating.Value);
            }

            // In Stock filter
            if (inStock.HasValue && inStock.Value)
            {
                query = query.Where(b => b.Stock > 0);
            }

            // Sorting
            switch (sort.ToLower())
            {
                case "price":
                    query = desc
                        ? query.OrderByDescending(b => b.Price)
                        : query.OrderBy(b => b.Price);
                    break;
                case "author":
                    query = desc
                        ? query.OrderByDescending(b => b.Author)
                        : query.OrderBy(b => b.Author);
                    break;
                case "title":
                default:
                    query = desc
                        ? query.OrderByDescending(b => b.Title)
                        : query.OrderBy(b => b.Title);
                    break;
            }

            // Get total count for pagination
            var totalBooks = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalBooks / pageSize);

            // Pagination
            var skip = (page - 1) * pageSize;
            var books = await query.Skip(skip).Take(pageSize).ToListAsync();

            // Check if the user is authenticated to determine bookmarks
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAuthenticated = !string.IsNullOrEmpty(userId);

            // Transform to DTOs with additional properties
            var bookDtos = books.Select(book => new BookResponseDto
            {
                Id = book.Id,
                Title = book.Title,
                Author = book.Author,
                ISBN = book.ISBN,
                Description = book.Description,
                Price = book.Price,
                ImageUrl = book.ImageUrl,
                Genre = book.Genre,
                StockQuantity = book.Stock,
                IsOnSale = book.IsOnSale &&
                          book.DiscountPercentage.HasValue &&
                          book.DiscountStartDate <= DateTime.UtcNow &&
                          (!book.DiscountEndDate.HasValue || book.DiscountEndDate >= DateTime.UtcNow),
                DiscountPercentage = book.DiscountPercentage,
                DiscountStartDate = book.DiscountStartDate,
                DiscountEndDate = book.DiscountEndDate,
                OriginalPrice = book.OriginalPrice,
                IsBookmarked = isAuthenticated && _context.Bookmarks.Any(bm => bm.BookId == book.Id && bm.UserId == userId)
            }).ToList();

            return Ok(new
            {
                books = bookDtos,
                totalPages,
                totalBooks,
                currentPage = page,
                pageSize
            });
        }

        // GET: api/Books/genres - Get all unique genres
        [HttpGet("genres")]
        public async Task<ActionResult<IEnumerable<string>>> GetGenres()
        {
            var genres = await _context.Books
                .Where(b => b.Genre != null && b.Genre != "")
                .Select(b => b.Genre)
                .Distinct()
                .OrderBy(g => g)
                .ToListAsync();

            return genres;
        }

        // GET: api/Books/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<BookDto>> GetBook(int id)
        {
            var book = await _context.Books
                .Include(b => b.Reviews)
                .Include(b => b.BookAwards)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (book == null)
            {
                return NotFound();
            }

            // Get current user id if authenticated
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAuthenticated = !string.IsNullOrEmpty(userId);

            var bookDto = new BookDto
            {
                Id = book.Id,
                Title = book.Title,
                ISBN = book.ISBN,
                Description = book.Description,
                Author = book.Author,
                Publisher = book.Publisher,
                PublicationDate = book.PublishDate,
                Price = book.Price,
                StockQuantity = book.Stock,
                Language = book.Language,
                Format = book.Format,
                Genre = book.Genre,
                ImageUrl = book.ImageUrl,
                Pages = book.Pages,
                Dimensions = book.Dimensions,
                Weight = book.Weight,
                IsBestseller = book.IsBestseller,
                IsAwardWinner = book.BookAwards.Any(),
                IsNewRelease = book.IsNewRelease || (book.PublishDate.HasValue && book.PublishDate >= DateTime.UtcNow.AddMonths(-3)),
                IsNewArrival = book.CreatedAt >= DateTime.UtcNow.AddMonths(-1),
                IsComingSoon = book.PublishDate.HasValue && book.PublishDate > DateTime.UtcNow,
                IsOnSale = book.IsOnSale &&
                          book.DiscountPercentage.HasValue &&
                          book.DiscountStartDate <= DateTime.UtcNow &&
                          (!book.DiscountEndDate.HasValue || book.DiscountEndDate >= DateTime.UtcNow),
                DiscountPercentage = book.DiscountPercentage,
                DiscountStartDate = book.DiscountStartDate,
                DiscountEndDate = book.DiscountEndDate,
                OriginalPrice = book.OriginalPrice,
                AverageRating = book.Reviews.Any() ? book.Reviews.Average(r => r.Rating) : 0,
                ReviewCount = book.Reviews.Count,
                IsBookmarked = isAuthenticated && _context.Bookmarks.Any(bm => bm.BookId == id && bm.UserId == userId),
                Awards = book.BookAwards.Select(a => a.Award.Name).ToList(),
                CreatedAt = book.CreatedAt,
                UpdatedAt = book.UpdatedAt
            };

            return bookDto;
        }

        // POST: api/Books
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<BookDto>> CreateBook(CreateBookDto createBookDto)
        {
            var book = new Book
            {
                Title = createBookDto.Title,
                ISBN = createBookDto.ISBN,
                Description = createBookDto.Description,
                Author = createBookDto.Author,
                Publisher = createBookDto.Publisher,
                PublishDate = createBookDto.PublicationDate,
                Price = createBookDto.Price,
                Stock = createBookDto.StockQuantity,
                Language = createBookDto.Language,
                Format = createBookDto.Format,
                Genre = createBookDto.Genre,
                ImageUrl = createBookDto.ImageUrl,
                Pages = createBookDto.Pages,
                Dimensions = createBookDto.Dimensions,
                Weight = createBookDto.Weight,
                IsBestseller = createBookDto.IsBestseller,
                IsNewRelease = createBookDto.IsNewRelease,
                // Feature 13: Admin can set timed discounts, optionally with "On Sale" flag
                IsOnSale = createBookDto.IsOnSale,
                DiscountPercentage = createBookDto.DiscountPercentage,
                DiscountStartDate = createBookDto.DiscountStartDate,
                DiscountEndDate = createBookDto.DiscountEndDate,
                OriginalPrice = createBookDto.OriginalPrice ?? createBookDto.Price,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBook), new { id = book.Id }, new BookDto
            {
                Id = book.Id,
                Title = book.Title,
                ISBN = book.ISBN,
                Description = book.Description,
                Author = book.Author,
                Publisher = book.Publisher,
                PublicationDate = book.PublishDate,
                Price = book.Price,
                StockQuantity = book.Stock,
                Language = book.Language,
                Format = book.Format,
                Genre = book.Genre,
                ImageUrl = book.ImageUrl,
                Pages = book.Pages,
                Dimensions = book.Dimensions,
                Weight = book.Weight,
                IsBestseller = book.IsBestseller,
                IsNewRelease = book.IsNewRelease,
                IsNewArrival = true,
                IsComingSoon = book.PublishDate.HasValue && book.PublishDate > DateTime.UtcNow,
                IsOnSale = book.IsOnSale,
                DiscountPercentage = book.DiscountPercentage,
                DiscountStartDate = book.DiscountStartDate,
                DiscountEndDate = book.DiscountEndDate,
                OriginalPrice = book.OriginalPrice,
                CreatedAt = book.CreatedAt,
                UpdatedAt = book.UpdatedAt
            });
        }

        // PUT: api/Books/{id}
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBook(int id, [FromBody] UpdateBookDto updateBookDto)
        {
            if (id != updateBookDto.Id)
            {
                return BadRequest("ID in the URL doesn't match the ID in the request body");
            }

            var book = await _context.Books.FindAsync(id);
            if (book == null)
            {
                return NotFound();
            }

            // Only update properties that are provided
            if (updateBookDto.Title != null)
                book.Title = updateBookDto.Title;

            if (updateBookDto.ISBN != null)
                book.ISBN = updateBookDto.ISBN;

            if (updateBookDto.Description != null)
                book.Description = updateBookDto.Description;

            if (updateBookDto.Author != null)
                book.Author = updateBookDto.Author;

            if (updateBookDto.Publisher != null)
                book.Publisher = updateBookDto.Publisher;

            if (updateBookDto.PublicationDate.HasValue)
                book.PublishDate = updateBookDto.PublicationDate;

            if (updateBookDto.Price.HasValue)
                book.Price = updateBookDto.Price.Value;

            if (updateBookDto.StockQuantity.HasValue)
                book.Stock = updateBookDto.StockQuantity.Value;

            if (updateBookDto.Language != null)
                book.Language = updateBookDto.Language;

            if (updateBookDto.Format != null)
                book.Format = updateBookDto.Format;

            if (updateBookDto.Genre != null)
                book.Genre = updateBookDto.Genre;

            if (updateBookDto.Pages.HasValue)
                book.Pages = updateBookDto.Pages;

            if (updateBookDto.Dimensions != null)
                book.Dimensions = updateBookDto.Dimensions;

            if (updateBookDto.Weight != null)
                book.Weight = updateBookDto.Weight;

            if (updateBookDto.IsBestseller.HasValue)
                book.IsBestseller = updateBookDto.IsBestseller.Value;

            if (updateBookDto.IsNewRelease.HasValue)
                book.IsNewRelease = updateBookDto.IsNewRelease.Value;

            // Handle discount properties specifically
            if (updateBookDto.IsOnSale.HasValue)
            {
                book.IsOnSale = updateBookDto.IsOnSale.Value;

                // If turning off the sale, clear discount fields
                if (!updateBookDto.IsOnSale.Value)
                {
                    book.DiscountPercentage = null;
                    book.DiscountStartDate = null;
                    book.DiscountEndDate = null;
                    // Keep original price for reference
                }
            }

            if (updateBookDto.DiscountPercentage.HasValue)
            {
                book.DiscountPercentage = updateBookDto.DiscountPercentage;

                // If setting a discount and no original price is set, store current price
                if (book.OriginalPrice == null || book.OriginalPrice <= 0)
                {
                    book.OriginalPrice = book.Price;
                }
            }

            if (updateBookDto.OriginalPrice.HasValue)
                book.OriginalPrice = updateBookDto.OriginalPrice;

            if (updateBookDto.DiscountStartDate.HasValue)
                book.DiscountStartDate = updateBookDto.DiscountStartDate;

            if (updateBookDto.DiscountEndDate.HasValue)
                book.DiscountEndDate = updateBookDto.DiscountEndDate;

            // Handle image URL (if provided)
            if (!string.IsNullOrEmpty(updateBookDto.ImageUrl))
            {
                book.ImageUrl = updateBookDto.ImageUrl;
            }

            // Always update the UpdatedAt timestamp
            book.UpdatedAt = DateTime.UtcNow;

            _context.Entry(book).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BookExists(id))
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

        // DELETE: api/Books/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
            {
                return NotFound();
            }

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/Books/{id}/inventory - Update inventory quantity
        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/inventory")]
        public async Task<IActionResult> UpdateInventory(int id, [FromBody] int quantity)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
            {
                return NotFound();
            }

            book.Stock = quantity;
            book.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Books/{id}/discount - Add or update discount
        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/discount")]
        public async Task<IActionResult> SetDiscount(int id, [FromBody] DiscountDto discountDto)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
            {
                return NotFound();
            }

            // Store original price if not set and adding a discount
            if ((book.OriginalPrice == null || book.OriginalPrice <= 0) && discountDto.IsOnSale)
            {
                book.OriginalPrice = book.Price;
            }

            // Update discount fields
            book.IsOnSale = discountDto.IsOnSale;
            book.DiscountPercentage = discountDto.DiscountPercentage;
            book.DiscountStartDate = discountDto.StartDate;
            book.DiscountEndDate = discountDto.EndDate;
            book.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Discount updated successfully",
                bookId = book.Id,
                isOnSale = book.IsOnSale,
                discountPercentage = book.DiscountPercentage,
                startDate = book.DiscountStartDate,
                endDate = book.DiscountEndDate
            });
        }

        // DELETE: api/Books/{id}/discount - Remove discount
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}/discount")]
        public async Task<IActionResult> RemoveDiscount(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
            {
                return NotFound();
            }

            // Remove discount fields but keep original price for reference
            book.IsOnSale = false;
            book.DiscountPercentage = null;
            book.DiscountStartDate = null;
            book.DiscountEndDate = null;
            book.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Discount removed successfully",
                bookId = book.Id
            });
        }

        private bool BookExists(int id)
        {
            return _context.Books.Any(e => e.Id == id);
        }
    }
}