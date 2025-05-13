using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PokheraliDevelopers.Data;
using PokheraliDevelopers.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PokheraliDevelopers.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnnouncementsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AnnouncementsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Announcements - Get active announcements
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AnnouncementDto>>> GetActiveAnnouncements()
        {
            var now = DateTime.UtcNow;

            var announcements = await _context.Announcements
                .Where(a => a.IsActive && a.StartDate <= now && a.EndDate >= now)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return announcements.Select(a => new AnnouncementDto
            {
                Id = a.Id,
                Title = a.Title,
                Content = a.Content,
                StartDate = a.StartDate,
                EndDate = a.EndDate,
                IsActive = a.IsActive
            }).ToList();
        }

        // GET: api/Announcements/admin - Get all announcements (for admin)
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<AnnouncementDto>>> GetAllAnnouncements()
        {
            var announcements = await _context.Announcements
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return announcements.Select(a => new AnnouncementDto
            {
                Id = a.Id,
                Title = a.Title,
                Content = a.Content,
                StartDate = a.StartDate,
                EndDate = a.EndDate,
                IsActive = a.IsActive
            }).ToList();
        }

        // GET: api/Announcements/{id} - Get a specific announcement
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AnnouncementDto>> GetAnnouncement(int id)
        {
            var announcement = await _context.Announcements.FindAsync(id);

            if (announcement == null)
            {
                return NotFound();
            }

            return new AnnouncementDto
            {
                Id = announcement.Id,
                Title = announcement.Title,
                Content = announcement.Content,
                StartDate = announcement.StartDate,
                EndDate = announcement.EndDate,
                IsActive = announcement.IsActive
            };
        }

        // POST: api/Announcements - Create a new announcement
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AnnouncementDto>> CreateAnnouncement([FromBody] CreateAnnouncementDto createAnnouncementDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var announcement = new Announcement
            {
                Title = createAnnouncementDto.Title,
                Content = createAnnouncementDto.Content,
                BgColor = createAnnouncementDto.BgColor ?? "#f3f4f6",
                TextColor = createAnnouncementDto.TextColor ?? "#1f2937",
                StartDate = createAnnouncementDto.StartDate,
                EndDate = createAnnouncementDto.EndDate,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedById = userId
            };

            _context.Announcements.Add(announcement);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAnnouncement), new { id = announcement.Id }, new AnnouncementDto
            {
                Id = announcement.Id,
                Title = announcement.Title,
                Content = announcement.Content,
                StartDate = announcement.StartDate,
                EndDate = announcement.EndDate,
                IsActive = announcement.IsActive
            });
        }

        // PUT: api/Announcements/{id} - Update an announcement
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateAnnouncement(int id, [FromBody] CreateAnnouncementDto updateAnnouncementDto)
        {
            var existingAnnouncement = await _context.Announcements.FindAsync(id);
            if (existingAnnouncement == null)
            {
                return NotFound();
            }

            existingAnnouncement.Title = updateAnnouncementDto.Title;
            existingAnnouncement.Content = updateAnnouncementDto.Content;
            existingAnnouncement.BgColor = updateAnnouncementDto.BgColor ?? existingAnnouncement.BgColor;
            existingAnnouncement.TextColor = updateAnnouncementDto.TextColor ?? existingAnnouncement.TextColor;
            existingAnnouncement.StartDate = updateAnnouncementDto.StartDate;
            existingAnnouncement.EndDate = updateAnnouncementDto.EndDate;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AnnouncementExists(id))
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

        // PUT: api/Announcements/{id}/toggle - Toggle announcement status
        [HttpPut("{id}/toggle")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleAnnouncementStatus(int id)
        {
            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null)
            {
                return NotFound();
            }

            announcement.IsActive = !announcement.IsActive;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AnnouncementExists(id))
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

        // DELETE: api/Announcements/{id} - Delete an announcement
        [HttpDelete("{id}")]
    public AnnouncementsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Announcements - Get active announcements
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AnnouncementDto>>> GetActiveAnnouncements()
    {
        var now = DateTime.UtcNow;

        var announcements = await _context.Announcements
            .Where(a => a.IsActive && a.StartDate <= now && a.EndDate >= now)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return announcements.Select(a => new AnnouncementDto
        {
            Id = a.Id,
            Title = a.Title,
            Content = a.Content,
            StartDate = a.StartDate,
            EndDate = a.EndDate,
            IsActive = a.IsActive
        }).ToList();
    }

    // GET: api/Announcements/admin - Get all announcements (for admin)
    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<AnnouncementDto>>> GetAllAnnouncements()
    {
        var announcements = await _context.Announcements
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return announcements.Select(a => new AnnouncementDto
        {
            Id = a.Id,
            Title = a.Title,
            Content = a.Content,
            StartDate = a.StartDate,
            EndDate = a.EndDate,
            IsActive = a.IsActive
        }).ToList();
    }

    // GET: api/Announcements/{id} - Get a specific announcement
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AnnouncementDto>> GetAnnouncement(int id)
    {
        var announcement = await _context.Announcements.FindAsync(id);

        if (announcement == null)
        {
            return NotFound();
        }

        return new AnnouncementDto
        {
            Id = announcement.Id,
            Title = announcement.Title,
            Content = announcement.Content,
            StartDate = announcement.StartDate,
            EndDate = announcement.EndDate,
            IsActive = announcement.IsActive
        };
    }

    // POST: api/Announcements - Create a new announcement
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AnnouncementDto>> CreateAnnouncement([FromBody] CreateAnnouncementDto createAnnouncementDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var announcement = new Announcement
        {
            Title = createAnnouncementDto.Title,
            Content = createAnnouncementDto.Content,
            BgColor = createAnnouncementDto.BgColor ?? "#f3f4f6",
            TextColor = createAnnouncementDto.TextColor ?? "#1f2937",
            StartDate = createAnnouncementDto.StartDate,
            EndDate = createAnnouncementDto.EndDate,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedById = userId
        };

        _context.Announcements.Add(announcement);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAnnouncement), new { id = announcement.Id }, new AnnouncementDto
        {
            Id = announcement.Id,
            Title = announcement.Title,
            Content = announcement.Content,
            StartDate = announcement.StartDate,
            EndDate = announcement.EndDate,
            IsActive = announcement.IsActive
        });
    }

    // PUT: api/Announcements/{id} - Update an announcement
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateAnnouncement(int id, [FromBody] CreateAnnouncementDto updateAnnouncementDto)
    {
        var existingAnnouncement = await _context.Announcements.FindAsync(id);
        if (existingAnnouncement == null)
        {
            return NotFound();
        }

        existingAnnouncement.Title = updateAnnouncementDto.Title;
        existingAnnouncement.Content = updateAnnouncementDto.Content;
        existingAnnouncement.BgColor = updateAnnouncementDto.BgColor ?? existingAnnouncement.BgColor;
        existingAnnouncement.TextColor = updateAnnouncementDto.TextColor ?? existingAnnouncement.TextColor;
        existingAnnouncement.StartDate = updateAnnouncementDto.StartDate;
        existingAnnouncement.EndDate = updateAnnouncementDto.EndDate;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!AnnouncementExists(id))
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

    // PUT: api/Announcements/{id}/toggle - Toggle announcement status
    [HttpPut("{id}/toggle")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ToggleAnnouncementStatus(int id)
    {
        var announcement = await _context.Announcements.FindAsync(id);
        if (announcement == null)
        {
            return NotFound();
        }

        announcement.IsActive = !announcement.IsActive;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!AnnouncementExists(id))
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

    // DELETE: api/Announcements/{id} - Delete an announcement
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteAnnouncement(int id)
    {
        var announcement = await _context.Announcements.FindAsync(id);
        if (announcement == null)
        {
            return NotFound();
        }

        _context.Announcements.Remove(announcement);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool AnnouncementExists(int id)
    {
        return _context.Announcements.Any(e => e.Id == id);
    }
}