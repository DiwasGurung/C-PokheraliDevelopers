using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class UploadsController : ControllerBase
{
    private readonly IFileService _fileService;

    public UploadsController(IFileService fileService)
    {
        _fileService = fileService;
    }

    [HttpPost("book-cover")]
    public async Task<ActionResult<string>> UploadBookCover(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded");
        }

        // Check file type
        string fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        string[] allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif" };

        if (!allowedExtensions.Contains(fileExtension))
        {
            return BadRequest("Invalid file type. Only JPG, PNG and GIF files are allowed.");
        }

        // Check file size (max 10MB)
        if (file.Length > 10 * 1024 * 1024)
        {
            return BadRequest("File size exceeds 10MB limit.");
        }

        string filePath = await _fileService.SaveFileAsync(file);

        return Ok(new { filePath });
    }
}