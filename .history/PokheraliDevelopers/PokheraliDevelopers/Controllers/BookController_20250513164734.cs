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
using Microsoft.Extensions.Logging;

namespace PokheraliDevelopers.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IFileService _fileService;
        private readonly ILogger<BookController> _logger;

        public BookController(
            ApplicationDbContext context,
            IFileService fileService,
            ILogger<BookController> logger)
        {
            _context = context;
            _fileService = fileService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetBooks(
            [FromQuery] string searchTerm = "",
            [FromQuery] string sortBy = "title",
            [FromQuery] string sortOrder = "asc",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var query = _context.Books
                    .Include(b => b.Reviews)
                    .AsQueryable();

                // Apply search filter
                if (!string.IsNullOrWhiteSpace(searchTerm))
                {
                    searchTerm = searchTerm.ToLower();
                    query = query.Where(b =>
                        b.Title.ToLower().Contains(searchTerm) ||
                        b.Author.ToLower().Contains(searchTerm) ||
                        b.ISBN.Contains(searchTerm));
                }

                // Apply sorting
                query = sortBy.ToLower() switch
                {
                    "price" => sortOrder.ToLower() == "desc" 
                        ? query.OrderByDescending(b => b.Price)
                        : query.OrderBy(b => b.Price),
                    "publicationdate" => sortOrder.ToLower() == "desc"
                        ? query.OrderByDescending(b => b.PublicationDate)
                        : query.OrderBy(b => b.PublicationDate),
                    "author" => sortOrder.ToLower() == "desc"
                        ? query.OrderByDescending(b => b.Author)
                        : query.OrderBy(b => b.Author),
                    _ => sortOrder.ToLower() == "desc"
                        ? query.OrderByDescending(b => b.Title)
                        : query.OrderBy(b => b.Title)
                };

                // Calculate total count for pagination
                var totalCount = await query.CountAsync();
                var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

                // Apply pagination
                var books = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(b => new BookDto
                    {
                        Id = b.Id,
                        Title = b.Title,
                        ISBN = b.ISBN,
                        Description = b.Description,
                        Author = b.Author,
                        Publisher = b.Publisher,
                        PublicationDate = b.PublicationDate,
                        Price = b.Price,
                        StockQuantity = b.StockQuantity,
                        Language = b.Language,
                        Format = b.Format,
                        ImageUrl = b.ImageUrl,
                        DiscountPercentage = b.DiscountPercentage,
                        IsOnSale = b.IsOnSale,
                        DiscountStartDate = b.DiscountStartDate,
                        DiscountEndDate = b.DiscountEndDate,
                        IsBestseller = b.IsBestseller,
                        IsNewRelease = b.IsNewRelease,
                        OriginalPrice = b.OriginalPrice,
                        AverageRating = b.Reviews.Any() 
                            ? b.Reviews.Average(r => r.Rating) 
                            : 0,
                        ReviewCount = b.Reviews.Count
                    })
                    .ToListAsync();

                return Ok(new
                {
                    Books = books,
                    TotalCount = totalCount,
                    TotalPages = totalPages,
                    CurrentPage = page,
                    PageSize = pageSize
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving books");
                return StatusCode(500, "An error occurred while retrieving books");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BookDto>> GetBook(int id)
        {
            try
            {
                var book = await _context.Books
                    .Include(b => b.Reviews)
                    .FirstOrDefaultAsync(b => b.Id == id);

                if (book == null)
                {
                    return NotFound();
                }

                return Ok(new BookDto
                {
                    Id = book.Id,
                    Title = book.Title,
                    ISBN = book.ISBN,
                    Description = book.Description,
                    Author = book.Author,
                    Publisher = book.Publisher,
                    PublicationDate = book.PublicationDate,
                    Price = book.Price,
                    StockQuantity = book.StockQuantity,
                    Language = book.Language,
                    Format = book.Format,
                    ImageUrl = book.ImageUrl,
                    DiscountPercentage = book.DiscountPercentage,
                    IsOnSale = book.IsOnSale,
                    DiscountStartDate = book.DiscountStartDate,
                    DiscountEndDate = book.DiscountEndDate,
                    IsBestseller = book.IsBestseller,
                    IsNewRelease = book.IsNewRelease,
                    OriginalPrice = book.OriginalPrice,
                    AverageRating = book.Reviews.Any() 
                        ? book.Reviews.Average(r => r.Rating) 
                        : 0,
                    ReviewCount = book.Reviews.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving book {BookId}", id);
                return StatusCode(500, "An error occurred while retrieving the book");
            }
        }

        [Authorize(Roles = "Admin,Staff")]
        [HttpPost]
        public async Task<ActionResult<BookDto>> CreateBook([FromForm] CreateBookDto createBookDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var book = new Book
                {
                    Title = createBookDto.Title,
                    ISBN = createBookDto.ISBN,
                    Description = createBookDto.Description,
                    Author = createBookDto.Author,
                    Publisher = createBookDto.Publisher,
                    PublicationDate = createBookDto.PublicationDate,
                    Price = createBookDto.Price,
                    StockQuantity = createBookDto.StockQuantity,
                    Language = createBookDto.Language,
                    Format = createBookDto.Format,
                    DiscountPercentage = createBookDto.DiscountPercentage,
                    IsOnSale = createBookDto.IsOnSale,
                    DiscountStartDate = createBookDto.DiscountStartDate,
                    DiscountEndDate = createBookDto.DiscountEndDate,
                    IsBestseller = createBookDto.IsBestseller,
                    IsNewRelease = createBookDto.IsNewRelease,
                    CreatedAt = DateTime.UtcNow,
                    ModifiedAt = DateTime.UtcNow
                };

                if (createBookDto.Image != null)
                {
                    book.ImageUrl = await _fileService.SaveFileAsync(createBookDto.Image, "books");
                }

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
                    PublicationDate = book.PublicationDate,
                    Price = book.Price,
                    StockQuantity = book.StockQuantity,
                    Language = book.Language,
                    Format = book.Format,
                    ImageUrl = book.ImageUrl,
                    DiscountPercentage = book.DiscountPercentage,
                    IsOnSale = book.IsOnSale,
                    DiscountStartDate = book.DiscountStartDate,
                    DiscountEndDate = book.DiscountEndDate,
                    IsBestseller = book.IsBestseller,
                    IsNewRelease = book.IsNewRelease
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating book");
                return StatusCode(500, "An error occurred while creating the book");
            }
        }

        [Authorize(Roles = "Admin,Staff")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBook(int id, [FromForm] UpdateBookDto updateBookDto)
        {
            try
            {
                var book = await _context.Books.FindAsync(id);
                if (book == null)
                {
                    return NotFound();
                }

                if (updateBookDto.Title != null) book.Title = updateBookDto.Title;
                if (updateBookDto.ISBN != null) book.ISBN = updateBookDto.ISBN;
                if (updateBookDto.Description != null) book.Description = updateBookDto.Description;
                if (updateBookDto.Author != null) book.Author = updateBookDto.Author;
                if (updateBookDto.Publisher != null) book.Publisher = updateBookDto.Publisher;
                if (updateBookDto.PublicationDate.HasValue) book.PublicationDate = updateBookDto.PublicationDate.Value;
                if (updateBookDto.Price.HasValue) book.Price = updateBookDto.Price.Value;
                if (updateBookDto.StockQuantity.HasValue) book.StockQuantity = updateBookDto.StockQuantity.Value;
                if (updateBookDto.Language != null) book.Language = updateBookDto.Language;
                if (updateBookDto.Format != null) book.Format = updateBookDto.Format;
                if (updateBookDto.DiscountPercentage.HasValue) book.DiscountPercentage = updateBookDto.DiscountPercentage;
                if (updateBookDto.IsOnSale.HasValue) book.IsOnSale = updateBookDto.IsOnSale.Value;
                if (updateBookDto.DiscountStartDate.HasValue) book.DiscountStartDate = updateBookDto.DiscountStartDate;
                if (updateBookDto.DiscountEndDate.HasValue) book.DiscountEndDate = updateBookDto.DiscountEndDate;
                if (updateBookDto.IsBestseller.HasValue) book.IsBestseller = updateBookDto.IsBestseller.Value;
                if (updateBookDto.IsNewRelease.HasValue) book.IsNewRelease = updateBookDto.IsNewRelease.Value;

                if (updateBookDto.Image != null)
                {
                    // Delete old image if exists
                    if (!string.IsNullOrEmpty(book.ImageUrl))
                    {
                        await _fileService.DeleteFileAsync(book.ImageUrl);
                    }
                    book.ImageUrl = await _fileService.SaveFileAsync(updateBookDto.Image, "books");
                }

                book.ModifiedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating book {BookId}", id);
                return StatusCode(500, "An error occurred while updating the book");
            }
        }

        [Authorize(Roles = "Admin,Staff")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            try
            {
                var book = await _context.Books.FindAsync(id);
                if (book == null)
                {
                    return NotFound();
                }

                // Delete associated image if exists
                if (!string.IsNullOrEmpty(book.ImageUrl))
                {
                    await _fileService.DeleteFileAsync(book.ImageUrl);
                }

                _context.Books.Remove(book);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting book {BookId}", id);
                return StatusCode(500, "An error occurred while deleting the book");
            }
        }

        [HttpGet("bestsellers")]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetBestsellers([FromQuery] int count = 5)
        {
            try
            {
                var bestsellers = await _context.Books
                    .Where(b => b.IsBestseller)
                    .Include(b => b.Reviews)
                    .OrderByDescending(b => b.Reviews.Average(r => r.Rating))
                    .Take(count)
                    .Select(b => new BookDto
                    {
                        Id = b.Id,
                        Title = b.Title,
                        ISBN = b.ISBN,
                        Description = b.Description,
                        Author = b.Author,
                        Publisher = b.Publisher,
                        PublicationDate = b.PublicationDate,
                        Price = b.Price,
                        StockQuantity = b.StockQuantity,
                        Language = b.Language,
                        Format = b.Format,
                        ImageUrl = b.ImageUrl,
                        DiscountPercentage = b.DiscountPercentage,
                        IsOnSale = b.IsOnSale,
                        DiscountStartDate = b.DiscountStartDate,
                        DiscountEndDate = b.DiscountEndDate,
                        IsBestseller = b.IsBestseller,
                        IsNewRelease = b.IsNewRelease,
                        OriginalPrice = b.OriginalPrice,
                        AverageRating = b.Reviews.Any() 
                            ? b.Reviews.Average(r => r.Rating) 
                            : 0,
                        ReviewCount = b.Reviews.Count
                    })
                    .ToListAsync();

                return Ok(bestsellers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving bestsellers");
                return StatusCode(500, "An error occurred while retrieving bestsellers");
            }
        }

        [HttpGet("new-releases")]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetNewReleases([FromQuery] int count = 5)
        {
            try
            {
                var newReleases = await _context.Books
                    .Where(b => b.IsNewRelease)
                    .Include(b => b.Reviews)
                    .OrderByDescending(b => b.PublicationDate)
                    .Take(count)
                    .Select(b => new BookDto
                    {
                        Id = b.Id,
                        Title = b.Title,
                        ISBN = b.ISBN,
                        Description = b.Description,
                        Author = b.Author,
                        Publisher = b.Publisher,
                        PublicationDate = b.PublicationDate,
                        Price = b.Price,
                        StockQuantity = b.StockQuantity,
                        Language = b.Language,
                        Format = b.Format,
                        ImageUrl = b.ImageUrl,
                        DiscountPercentage = b.DiscountPercentage,
                        IsOnSale = b.IsOnSale,
                        DiscountStartDate = b.DiscountStartDate,
                        DiscountEndDate = b.DiscountEndDate,
                        IsBestseller = b.IsBestseller,
                        IsNewRelease = b.IsNewRelease,
                        OriginalPrice = b.OriginalPrice,
                        AverageRating = b.Reviews.Any() 
                            ? b.Reviews.Average(r => r.Rating) 
                            : 0,
                        ReviewCount = b.Reviews.Count
                    })
                    .ToListAsync();

                return Ok(newReleases);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving new releases");
                return StatusCode(500, "An error occurred while retrieving new releases");
            }
        }

        [HttpGet("on-sale")]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetOnSale([FromQuery] int count = 5)
        {
            try
            {
                var onSale = await _context.Books
                    .Where(b => b.IsOnSale && b.DiscountPercentage > 0)
                    .Include(b => b.Reviews)
                    .OrderByDescending(b => b.DiscountPercentage)
                    .Take(count)
                    .Select(b => new BookDto
                    {
                        Id = b.Id,
                        Title = b.Title,
                        ISBN = b.ISBN,
                        Description = b.Description,
                        Author = b.Author,
                        Publisher = b.Publisher,
                        PublicationDate = b.PublicationDate,
                        Price = b.Price,
                        StockQuantity = b.StockQuantity,
                        Language = b.Language,
                        Format = b.Format,
                        ImageUrl = b.ImageUrl,
                        DiscountPercentage = b.DiscountPercentage,
                        IsOnSale = b.IsOnSale,
                        DiscountStartDate = b.DiscountStartDate,
                        DiscountEndDate = b.DiscountEndDate,
                        IsBestseller = b.IsBestseller,
                        IsNewRelease = b.IsNewRelease,
                        OriginalPrice = b.OriginalPrice,
                        AverageRating = b.Reviews.Any() 
                            ? b.Reviews.Average(r => r.Rating) 
                            : 0,
                        ReviewCount = b.Reviews.Count
                    })
                    .ToListAsync();

                return Ok(onSale);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving on-sale books");
                return StatusCode(500, "An error occurred while retrieving on-sale books");
            }
        }
    }
}