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
    public async Task<ActionResult<IEnumerable<Announcement>>> GetActiveAnnouncements()
    {
        var now = DateTime.UtcNow;

        var announcements = await _context.Announcements
            .Where(a => a.IsActive && a.StartDate <= now &&
                   (!a.EndDate.HasValue || a.EndDate.Value >= now))
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return announcements;
    }

    // GET: api/Announcements/admin - Get all announcements (for admin)
    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<Announcement>>> GetAllAnnouncements()
    {
        var announcements = await _context.Announcements
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return announcements;
    }

    // GET: api/Announcements/{id} - Get a specific announcement
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Announcement>> GetAnnouncement(int id)
    {
        var announcement = await _context.Announcements.FindAsync(id);

        if (announcement == null)
        {
            return NotFound();
        }

        return announcement;
    }

    // POST: api/Announcements - Create a new announcement
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Announcement>> CreateAnnouncement([FromBody] CreateAnnouncementDto announcementDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Set creation info
        var announcement = new Announcement
        {
            Title = announcementDto.Title,
            Content = announcementDto.Content,
            StartDate = announcementDto.StartDate,
            EndDate = announcementDto.EndDate,
            IsActive = true,
            CreatedById = userId,
            CreatedAt = DateTime.UtcNow,
            BgColor = "#f3f4f6", // Default light gray
            TextColor = "#1f2937" // Default dark gray
        };

        _context.Announcements.Add(announcement);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAnnouncement), new { id = announcement.Id }, announcement);
    }

    // PUT: api/Announcements/{id} - Update an announcement
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateAnnouncement(int id, [FromBody] CreateAnnouncementDto announcementDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var announcement = await _context.Announcements.FindAsync(id);
        if (announcement == null)
        {
            return NotFound();
        }

        // Update properties
        announcement.Title = announcementDto.Title;
        announcement.Content = announcementDto.Content;
        announcement.StartDate = announcementDto.StartDate;
        announcement.EndDate = announcementDto.EndDate;

        _context.Entry(announcement).State = EntityState.Modified;

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

    // PUT: api/Announcements/{id}/toggle - Toggle announcement active status
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