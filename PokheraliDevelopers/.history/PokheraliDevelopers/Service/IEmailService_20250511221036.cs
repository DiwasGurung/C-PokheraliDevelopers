// Services/IEmailService.cs
using System.Net.Mail;
using System.Net;
using System.Threading.Tasks;

namespace PokheraliDevelopers.Service
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string htmlMessage);
        Task SendOrderConfirmationEmailAsync(string email, string orderNumber, decimal totalAmount, string claimCode);
        Task SendPasswordResetEmailAsync(string email, string resetToken);
        Task SendWelcomeEmailAsync(string email, string userName);
    }
}