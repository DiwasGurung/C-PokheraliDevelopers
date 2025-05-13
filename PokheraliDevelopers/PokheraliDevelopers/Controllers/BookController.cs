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

        public BooksController(ApplicationDbContext context)
        {
            _context = context;
        }

    
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookResponseDto>>> GetBooks(
        int page = 1,
        int pageSize = 10,
        string search = "",
        string sort = "title",
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
                query = query.Where(b => b.Title.Contains(search) || b.Author.Contains(search));
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
                // Assuming rating is stored in a related table or can be calculated
                // Add a filter condition based on rating here if applicable
            }

            // In Stock filter
            if (inStock.HasValue)
            {
                query = query.Where(b => b.Stock > 0); // Assuming inStock filters books with stock > 0
            }

            // Sorting
            switch (sort.ToLower())
            {
                case "price":
                    query = query.OrderBy(b => b.Price);
                    break;
                case "title":
                default:
                    query = query.OrderBy(b => b.Title);
                    break;
            }

            // Pagination
            var skip = (page - 1) * pageSize;
            var books = await query.Skip(skip).Take(pageSize).ToListAsync();

            // Get total count for pagination
            var totalBooks = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalBooks / pageSize);

            return Ok(new
            {
                books,
                totalPages,
                totalBooks,
                currentPage = page,
                pageSize
            });
        }


        // GET: api/Books/{id}
        // Feature 2: User can view book details
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
                OriginalPrice = createBookDto.OriginalPrice,
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
                OriginalPrice = book.OriginalPrice,
                CreatedAt = book.CreatedAt,
                UpdatedAt = book.UpdatedAt
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBook(int id, UpdateBookDto updateBookDto)
        {
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
                
            if (updateBookDto.ImageUrl != null)
                book.ImageUrl = updateBookDto.ImageUrl;
                
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
                
            if (updateBookDto.IsOnSale.HasValue)
                book.IsOnSale = updateBookDto.IsOnSale.Value;
                
            if (updateBookDto.DiscountPercentage.HasValue)
                book.DiscountPercentage = updateBookDto.DiscountPercentage;
                
            if (updateBookDto.OriginalPrice.HasValue)
                book.OriginalPrice = updateBookDto.OriginalPrice;
                
            if (updateBookDto.DiscountStartDate.HasValue)
                book.DiscountStartDate = updateBookDto.DiscountStartDate;
                
            if (updateBookDto.DiscountEndDate.HasValue)
                book.DiscountEndDate = updateBookDto.DiscountEndDate;

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

        private bool BookExists(int id)
        {
            return _context.Books.Any(e => e.Id == id);
        }
    }
}