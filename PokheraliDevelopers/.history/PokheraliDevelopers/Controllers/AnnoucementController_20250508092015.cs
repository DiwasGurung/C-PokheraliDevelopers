// Controllers/AnnouncementsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class AnnouncementsController : ControllerBase
{
    private readonly DatabaseHandlerEfCoreExample _context;

    public AnnouncementsController(DatabaseHandlerEfCoreExample context)
    {
        _context = context;
    }

    // GET: api/Announcements
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AnnouncementDto>>> GetActiveAnnouncements()
    {
        var now = DateTime.UtcNow;
        var announcements = await _context.Announcements
            .Where(a => a.IsActive && a.StartDate <= now && (!a.EndDate.HasValue || a.EndDate >= now))
            .OrderByDescending(a => a.StartDate)
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

    // GET: api/Announcements/all
    [Authorize(Roles = "Admin")]
    [HttpGet("all")]
    public async Task<ActionResult<IEnumerable<AnnouncementDto>>> GetAllAnnouncements()
    {
        var announcements = await _context.Announcements
            .OrderByDescending(a => a.StartDate)
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

    // GET: api/Announcements/{id}
    [HttpGet("{id}")]
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

    // POST: api/Announcements
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<AnnouncementDto>> CreateAnnouncement(CreateAnnouncementDto createAnnouncementDto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var announcement = new Announcement
        {
            Title = createAnnouncementDto.Title,
            Content = createAnnouncementDto.Content,
            StartDate = createAnnouncementDto.StartDate,
            EndDate = createAnnouncementDto.EndDate,
            IsActive = true,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            ModifiedAt = DateTime.UtcNow
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

    // PUT: api/Announcements/{id}
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAnnouncement(int id, CreateAnnouncementDto updateAnnouncementDto)
    {
        var announcement = await _context.Announcements.FindAsync(id);
        if (announcement == null)
        {
            return NotFound();
        }

        announcement.Title = updateAnnouncementDto.Title;
        announcement.Content = updateAnnouncementDto.Content;
        announcement.StartDate = updateAnnouncementDto.StartDate;
        announcement.EndDate = updateAnnouncementDto.EndDate;
        announcement.ModifiedAt = DateTime.UtcNow;

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

    // PUT: api/Announcements/{id}/toggle
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/toggle")]
    public async Task<IActionResult> ToggleAnnouncementStatus(int id)
    {
        var announcement = await _context.Announcements.FindAsync(id);
        if (announcement == null)
        {
            return NotFound();
        }

        announcement.IsActive = !announcement.IsActive;
        announcement.ModifiedAt = DateTime.UtcNow;

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

    // DELETE: api/Announcements/{id}
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
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