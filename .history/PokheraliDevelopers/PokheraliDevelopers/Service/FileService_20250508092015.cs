using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;

public interface IFileService
{
    Task<string> SaveFileAsync(IFormFile file);
}

public class FileService : IFileService
{
    private readonly IWebHostEnvironment _environment;

    public FileService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<string> SaveFileAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            Console.WriteLine("File is null or empty");
            return null;
        }

        try
        {
            // Ensure WebRootPath is not null
            string webRootPath = _environment.WebRootPath ?? Directory.GetCurrentDirectory();
            Console.WriteLine($"WebRootPath: {webRootPath}");

            // Create the uploads folder inside wwwroot
            string uploadsFolder = Path.Combine(webRootPath, "uploads", "books");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Generate a unique file name and save it
            string fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            string fileName = $"{Guid.NewGuid()}{fileExtension}";
            string filePath = Path.Combine(uploadsFolder, fileName);

            // Copy the file to the uploads folder
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return the relative URL to the file
            string returnPath = $"/uploads/books/{fileName}";
            return returnPath;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error saving file: {ex.Message}");
            return null;
        }
    }
}
