using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Threading.Tasks;

public interface IFileService
{
    Task<string> SaveFileAsync(IFormFile file, string folder);
    Task DeleteFileAsync(string filePath);
    bool IsValidFileType(IFormFile file, string[] allowedExtensions);
    bool IsValidFileSize(IFormFile file, long maxSize);
}

namespace PokheraliDevelopers.Service
{
    public class FileService : IFileService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<FileService> _logger;
        private readonly string _uploadPath;
        private readonly string[] _allowedExtensions;
        private readonly long _maxFileSize;

        public FileService(
            IConfiguration configuration,
            ILogger<FileService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            _uploadPath = _configuration["FileUpload:UploadPath"] ?? "uploads";
            _allowedExtensions = _configuration.GetSection("FileUpload:AllowedExtensions").Get<string[]>() 
                ?? new[] { ".jpg", ".jpeg", ".png", ".pdf" };
            _maxFileSize = _configuration.GetValue<long>("FileUpload:MaxFileSize", 5 * 1024 * 1024); // Default 5MB
        }

        public async Task<string> SaveFileAsync(IFormFile file, string folder)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    throw new ArgumentException("File is empty");
                }

                if (!IsValidFileType(file, _allowedExtensions))
                {
                    throw new ArgumentException("Invalid file type");
                }

                if (!IsValidFileSize(file, _maxFileSize))
                {
                    throw new ArgumentException("File size exceeds the maximum allowed size");
                }

                // Create directory if it doesn't exist
                var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), _uploadPath, folder);
                Directory.CreateDirectory(uploadDir);

                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                var filePath = Path.Combine(uploadDir, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Return relative path for storage in database
                return $"/{_uploadPath}/{folder}/{fileName}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving file {FileName}", file?.FileName);
                throw;
            }
        }

        public async Task DeleteFileAsync(string filePath)
        {
            try
            {
                if (string.IsNullOrEmpty(filePath))
                {
                    return;
                }

                var fullPath = Path.Combine(Directory.GetCurrentDirectory(), filePath.TrimStart('/'));
                if (File.Exists(fullPath))
                {
                    await Task.Run(() => File.Delete(fullPath));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file {FilePath}", filePath);
                throw;
            }
        }

        public bool IsValidFileType(IFormFile file, string[] allowedExtensions)
        {
            if (file == null || string.IsNullOrEmpty(file.FileName))
            {
                return false;
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            return allowedExtensions.Contains(extension);
        }

        public bool IsValidFileSize(IFormFile file, long maxSize)
        {
            return file != null && file.Length > 0 && file.Length <= maxSize;
        }
    }
}
