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
    private readonly bool _isConfigured;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;

        // Check if email is properly configured
        var smtpSettings = _configuration.GetSection("EmailSettings");
        _isConfigured = !string.IsNullOrEmpty(smtpSettings["SmtpServer"]) &&
                        !string.IsNullOrEmpty(smtpSettings["Port"]) &&
                        !string.IsNullOrEmpty(smtpSettings["UserName"]) &&
                        !string.IsNullOrEmpty(smtpSettings["Password"]) &&
                        !string.IsNullOrEmpty(smtpSettings["SenderEmail"]);

        if (!_isConfigured)
        {
            _logger.LogWarning("Email service is not properly configured. Emails will be logged but not sent.");
        }
    }

    public async Task SendEmailAsync(string to, string subject, string htmlMessage)
    {
        // Log the email content regardless of whether it's sent
        _logger.LogInformation($"Email to: {to}, Subject: {subject}, Body (truncated): {htmlMessage.Substring(0, Math.Min(100, htmlMessage.Length))}...");

        // If not configured, log the message but don't try to send
        if (!_isConfigured)
        {
            _logger.LogWarning("Email not sent because the service is not configured.");
            return;
        }

        try
        {
            var smtpSettings = _configuration.GetSection("EmailSettings");

            // Get settings with null checks and defaults
            var host = smtpSettings["SmtpServer"];

            // Parse with fallback to default values if parsing fails
            int port = 587; // Default port for TLS
            if (!int.TryParse(smtpSettings["Port"], out port))
            {
                _logger.LogWarning($"Invalid port configuration: {smtpSettings["Port"]}. Using default port 587.");
            }

            bool enableSsl = true; // Default to true for security
            if (!bool.TryParse(smtpSettings["EnableSsl"], out enableSsl))
            {
                _logger.LogWarning("Invalid EnableSsl configuration. Defaulting to true.");
            }

            var userName = smtpSettings["UserName"];
            var password = smtpSettings["Password"];
            var senderEmail = smtpSettings["SenderEmail"];
            var senderName = smtpSettings["SenderName"] ?? "Pokherali Developers";

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
            _logger.LogInformation($"Email sent successfully to {to}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to send email to {to} with subject: {subject}");
            // Don't rethrow the exception - this allows the application to continue even if email fails
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