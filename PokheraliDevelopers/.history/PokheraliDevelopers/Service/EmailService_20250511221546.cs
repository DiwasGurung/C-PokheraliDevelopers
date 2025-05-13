using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace PokheraliDevelopers.Service
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> emailSettings, IConfiguration configuration, ILogger<EmailService> logger)
        {
            _emailSettings = emailSettings.Value;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string htmlMessage)
        {
            try
            {
                var client = new SmtpClient(_emailSettings.SmtpServer, _emailSettings.SmtpPort)
                {
                    Credentials = new NetworkCredential(_emailSettings.SmtpUsername, _emailSettings.SmtpPassword),
                    EnableSsl = _emailSettings.EnableSsl
                };

                var message = new MailMessage
                {
                    From = new MailAddress(_emailSettings.SenderEmail, _emailSettings.SenderName),
                    Subject = subject,
                    Body = htmlMessage,
                    IsBodyHtml = true
                };

                message.To.Add(to);

                await client.SendMailAsync(message);
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
            string subject = $"Your BookStore Order Confirmation - {orderNumber}";
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
                            
                            <p>Thank you for shopping with us!</p>
                            <p>The BookStore Team</p>
                        </div>
                        <div class='footer'>
                            <p>&copy; {DateTime.Now.Year} BookStore. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(email, subject, body);
        }

        public async Task SendPasswordResetEmailAsync(string email, string resetToken)
        {
            string subject = "BookStore - Password Reset Request";
            string resetUrl = $"{_emailSettings.WebsiteBaseUrl}/reset-password?token={resetToken}&email={email}";
            string body = $@"
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #6b46c1; color: white; padding: 10px 20px; text-align: center; }}
                        .content {{ padding: 20px; }}
                        .footer {{ background-color: #f3f4f6; padding: 10px 20px; text-align: center; font-size: 12px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>Password Reset Request</h1>
                        </div>
                        <div class='content'>
                            <p>Hello,</p>
                            <p>We received a request to reset your password for your BookStore account.</p>
                            <p>Please click the link below to reset your password. This link will expire in 30 minutes.</p>
                            
                            <p><a href='{resetUrl}'>Reset Your Password</a></p>
                            
                            <p>If you did not request a password reset, please ignore this email.</p>
                            
                            <p>Thank you,</p>
                            <p>The BookStore Team</p>
                        </div>
                        <div class='footer'>
                            <p>&copy; {DateTime.Now.Year} BookStore. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(email, subject, body);
        }

        public async Task SendWelcomeEmailAsync(string email, string userName)
        {
            string subject = "Welcome to BookStore!";
            string body = $@"
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #6b46c1; color: white; padding: 10px 20px; text-align: center; }}
                        .content {{ padding: 20px; }}
                        .footer {{ background-color: #f3f4f6; padding: 10px 20px; text-align: center; font-size: 12px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>Welcome to BookStore!</h1>
                        </div>
                        <div class='content'>
                            <p>Dear {userName},</p>
                            <p>Thank you for joining BookStore! We're excited to have you as a member.</p>
                            
                            <p>As a member, you can:</p>
                            <ul>
                                <li>Bookmark your favorite books</li>
                                <li>Get special discounts</li>
                                <li>Review books you've purchased</li>
                                <li>Track your orders</li>
                            </ul>
                            
                            <p>Happy reading!</p>
                            <p>The BookStore Team</p>
                        </div>
                        <div class='footer'>
                            <p>&copy; {DateTime.Now.Year} BookStore. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>";

            await SendEmailAsync(email, subject, body);
        }
    }

    public class EmailSettings
    {
        public string SmtpServer { get; set; }
        public int SmtpPort { get; set; }
        public string SmtpUsername { get; set; }
        public string SmtpPassword { get; set; }
        public bool EnableSsl { get; set; }
        public string SenderEmail { get; set; }
        public string SenderName { get; set; }
        public string WebsiteBaseUrl { get; set; }
    }
}