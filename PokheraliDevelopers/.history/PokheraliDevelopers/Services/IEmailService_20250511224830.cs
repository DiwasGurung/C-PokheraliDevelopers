using System.Threading.Tasks;

namespace PokheraliDevelopers.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
    }
} 