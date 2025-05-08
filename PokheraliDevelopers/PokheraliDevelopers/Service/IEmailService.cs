// Services/IEmailService.cs
using System.Net.Mail;
using System.Net;
using System.Threading.Tasks;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string htmlMessage);
}