using System.Threading.Tasks;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string htmlMessage);
    Task SendOrderConfirmationEmailAsync(string email, string orderNumber, decimal totalAmount, string claimCode);
}