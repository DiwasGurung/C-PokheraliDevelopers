using Microsoft.AspNetCore.Http;

namespace PokheraliDevelopers.Service
{
    public interface IFileService
    {
        Task<string> SaveFileAsync(IFormFile file, string folder);
        Task DeleteFileAsync(string filePath);
        bool IsValidFileType(IFormFile file, string[] allowedExtensions);
        bool IsValidFileSize(IFormFile file, long maxSize);
    }
} 