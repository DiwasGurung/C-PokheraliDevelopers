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

        // GET: api/Books
        // Feature 1: User can browse the paginated book catalogue
        // Feature 3: User can apply search, sort and filters
        [HttpGet]
        public async Task<ActionResult<PaginatedResponseDto<BookDto>>> GetBooks([FromQuery] BookFilterDto filter)
        {
            var query = _context.Books.AsQueryable();

            // Apply search term filter
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                query = query.Where(b =>
                    b.Title.ToLower().Contains(searchTerm) ||
                    b.Author.ToLower().Contains(searchTerm) ||
                    b.ISBN.ToLower().Contains(searchTerm) ||
                    b.Description.ToLower().Contains(searchTerm));
            }

            // Apply filters
            if (filter.Authors != null && filter.Authors.Any())
                query = query.Where(b => filter.Authors.Contains(b.Author));

            if (filter.Genres != null && filter.Genres.Any())
                query = query.Where(b => filter.Genres.Contains(b.Genre));

            if (filter.InStock.HasValue)
                query = query.Where(b => filter.InStock.Value ? b.Stock > 0 : b.Stock == 0);

            if (filter.MinPrice.HasValue)
                query = query.Where(b => b.Price >= filter.MinPrice.Value);

            if (filter.MaxPrice.HasValue)
                query = query.Where(b => b.Price <= filter.MaxPrice.Value);

            if (filter.Languages != null && filter.Languages.Any())
                query = query.Where(b => filter.Languages.Contains(b.Language));

            if (filter.Publishers != null && filter.Publishers.Any())
                query = query.Where(b => filter.Publishers.Contains(b.Publisher));

            if (filter.OnSale.HasValue && filter.OnSale.Value)
                query = query.Where(b => b.IsOnSale &&
                                        b.DiscountPercentage.HasValue &&
                                        b.DiscountStartDate <= DateTime.UtcNow &&
                                        (!b.DiscountEndDate.HasValue || b.DiscountEndDate >= DateTime.UtcNow));

            if (filter.NewRelease.HasValue && filter.NewRelease.Value)
                query = query.Where(b => b.IsNewRelease || (b.PublishDate.HasValue && b.PublishDate >= DateTime.UtcNow.AddMonths(-3)));

            if (filter.NewArrival.HasValue && filter.NewArrival.Value)
                query = query.Where(b => b.CreatedAt >= DateTime.UtcNow.AddMonths(-1));

            if (filter.ComingSoon.HasValue && filter.ComingSoon.Value)
                query = query.Where(b => b.PublishDate.HasValue && b.PublishDate > DateTime.UtcNow);

            if (filter.AwardWinner.HasValue && filter.AwardWinner.Value)
                query = query.Where(b => b.BookAwards.Any());

            if (filter.MinRating.HasValue)
                query = query.Where(b => b.Reviews.Count > 0 && b.Reviews.Average(r => r.Rating) >= filter.MinRating.Value);

            // Calculate the total count before applying sorting and pagination
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = filter.SortBy?.ToLower() switch
            {
                "title" => filter.SortDescending ? query.OrderByDescending(b => b.Title) : query.OrderBy(b => b.Title),
                "author" => filter.SortDescending ? query.OrderByDescending(b => b.Author) : query.OrderBy(b => b.Author),
                "price" => filter.SortDescending ? query.OrderByDescending(b => b.Price) : query.OrderBy(b => b.Price),
                "publicationdate" => filter.SortDescending ? query.OrderByDescending(b => b.PublishDate) : query.OrderBy(b => b.PublishDate),
                "popularity" => query.OrderByDescending(b => b.OrderItems.Count),
                _ => query.OrderBy(b => b.Title)
            };

            // Apply pagination
            var pageSize = filter.PageSize > 0 ? filter.PageSize : 10;
            var pageNumber = filter.PageNumber > 0 ? filter.PageNumber : 1;
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var books = await query
                .Include(b => b.Reviews)
                .Include(b => b.BookAwards)
                .Include(b => b.Bookmarks)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Get current user id if authenticated
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAuthenticated = !string.IsNullOrEmpty(userId);

            // Map to DTOs
            var bookDtos = books.Select(b => new BookDto
            {
                Id = b.Id,
                Title = b.Title,
                ISBN = b.ISBN,
                Description = b.Description,
                Author = b.Author,
                Publisher = b.Publisher,
                PublicationDate = b.PublishDate,
                Price = b.Price,
                StockQuantity = b.Stock,
                Language = b.Language,
                Format = b.Format,
                Genre = b.Genre,
                ImageUrl = b.ImageUrl,
                Pages = b.Pages,
                Dimensions = b.Dimensions,
                Weight = b.Weight,
                IsBestseller = b.IsBestseller,
                IsAwardWinner = b.BookAwards.Any(),
                IsNewRelease = b.IsNewRelease || (b.PublishDate.HasValue && b.PublishDate >= DateTime.UtcNow.AddMonths(-3)),
                IsNewArrival = b.CreatedAt >= DateTime.UtcNow.AddMonths(-1),
                IsComingSoon = b.PublishDate.HasValue && b.PublishDate > DateTime.UtcNow,
                IsOnSale = b.IsOnSale &&
                          b.DiscountPercentage.HasValue &&
                          b.DiscountStartDate <= DateTime.UtcNow &&
                          (!b.DiscountEndDate.HasValue || b.DiscountEndDate >= DateTime.UtcNow),
                DiscountPercentage = b.DiscountPercentage,
                OriginalPrice = b.OriginalPrice,
                AverageRating = b.Reviews.Any() ? b.Reviews.Average(r => r.Rating) : 0,
                ReviewCount = b.Reviews.Count,
                IsBookmarked = isAuthenticated && b.Bookmarks.Any(bm => bm.UserId == userId),
                Awards = b.BookAwards.Select(a => a.Award.Name).ToList(),
                CreatedAt = b.CreatedAt,
                UpdatedAt = b.UpdatedAt
            }).ToList();

            return new PaginatedResponseDto<BookDto>
            {
                Items = bookDtos,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages
            };
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

        // Admin methods - Feature 12: Admin can manage book catalogue (CRUD) and Inventory
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