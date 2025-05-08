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
            .Where(a => a.IsActive && a.StartDate <= now && a.EndDate >= now)
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
    public async Task<ActionResult<Announcement>> CreateAnnouncement([FromBody] Announcement announcement)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Set creation info
        announcement.CreatedAt = DateTime.UtcNow;
        announcement.CreatedById = userId;

        _context.Announcements.Add(announcement);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAnnouncement), new { id = announcement.Id }, announcement);
    }

    // PUT: api/Announcements/{id} - Update an announcement
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateAnnouncement(int id, [FromBody] Announcement announcement)
    {
        if (id != announcement.Id)
        {
            return BadRequest("Announcement ID mismatch");
        }

        var existingAnnouncement = await _context.Announcements.FindAsync(id);
        if (existingAnnouncement == null)
        {
            return NotFound();
        }

        // Update properties
        existingAnnouncement.Title = announcement.Title;
        existingAnnouncement.Content = announcement.Content;
        existingAnnouncement.BgColor = announcement.BgColor;
        existingAnnouncement.TextColor = announcement.TextColor;
        existingAnnouncement.StartDate = announcement.StartDate;
        existingAnnouncement.EndDate = announcement.EndDate;
        existingAnnouncement.IsActive = announcement.IsActive;

        _context.Entry(existingAnnouncement).State = EntityState.Modified;

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