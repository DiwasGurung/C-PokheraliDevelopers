using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string htmlMessage)
    {
        try
        {
            var smtpSettings = _configuration.GetSection("SmtpSettings");
            var host = smtpSettings["Host"];
            var port = int.Parse(smtpSettings["Port"]);
            var enableSsl = bool.Parse(smtpSettings["EnableSsl"]);
            var userName = smtpSettings["UserName"];
            var password = smtpSettings["Password"];
            var senderEmail = smtpSettings["SenderEmail"];
            var senderName = smtpSettings["SenderName"];

            using var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(userName, password),
                EnableSsl = enableSsl
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail, senderName),
                Subject = subject,
                Body = htmlMessage,
                IsBodyHtml = true
            };

            mailMessage.To.Add(to);

            await client.SendMailAsync(mailMessage);
            _logger.LogInformation($"Email sent to {to} with subject: {subject}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to send email to {to} with subject: {subject}");
            throw;
        }
    }

    public async Task SendOrderConfirmationEmailAsync(string email, string orderNumber, decimal totalAmount, string claimCode)
    {
        string subject = $"Your Order Confirmation - {orderNumber}";
        string body = $@"
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #6b46c1; color: white; padding: 10px 20px; text-align: center; }}
                .content {{ padding: 20px; }}
                .footer {{ background-color: #f3f4f6; padding: 10px 20px; text-align: center; font-size: 12px; }}
                .claim-code {{ background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Your Order Confirmation</h1>
                </div>
                <div class='content'>
                    <p>Dear Customer,</p>
                    <p>Thank you for your order! We're pleased to confirm that your order has been received and is being processed.</p>
                    
                    <h2>Order Details</h2>
                    <p><strong>Order Number:</strong> {orderNumber}</p>
                    <p><strong>Order Total:</strong> ${totalAmount.ToString("0.00")}</p>
                    
                    <h2>Your Claim Code</h2>
                    <p>Present this code when picking up your order:</p>
                    <div class='claim-code'>{claimCode}</div>
                    
                    <p>You can view your order details and track its status in your account.</p>
                    
                    <p>If you have any questions, please contact our customer service team.</p>
                    
                    <p>Thank you for shopping with us!</p>
                </div>
                <div class='footer'>
                    <p>&copy; {DateTime.Now.Year} Pokherali Developers. All rights reserved.</p>
                    <p>This email was sent to {email}</p>
                </div>
            </div>
        </body>
        </html>";

        await SendEmailAsync(email, subject, body);
    }
}