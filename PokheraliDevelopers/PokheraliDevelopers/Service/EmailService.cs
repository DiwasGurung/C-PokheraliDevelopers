<<<<<<< HEAD
﻿using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

public interface IEmailService
{
    Task SendOrderConfirmationEmailAsync(string email, string orderNumber, decimal totalAmount, string claimCode);
    Task SendPasswordResetEmailAsync(string email, string resetToken);
    Task SendWelcomeEmailAsync(string email, string userName);
}

public class EmailService : IEmailService
{
    private readonly EmailSettings _emailSettings;

    public EmailService(IOptions<EmailSettings> emailSettings)
    {
        _emailSettings = emailSettings.Value;
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
                .button {{ display: inline-block; background-color: #6b46c1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }}
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
                    
                    <p>
                        <a href='{_emailSettings.WebsiteBaseUrl}/orders' class='button'>View Your Order</a>
                    </p>
                    
                    <p>If you have any questions, please contact our customer service team.</p>
                    
                    <p>Thank you for shopping with us!</p>
                    <p>The BookStore Team</p>
                </div>
                <div class='footer'>
                    <p>&copy; {DateTime.Now.Year} BookStore. All rights reserved.</p>
                    <p>This email was sent to {email}</p>
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
                .button {{ display: inline-block; background-color: #6b46c1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }}
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
                    <p>Please click the button below to reset your password. This link will expire in 30 minutes.</p>
                    
                    <p style='text-align: center; margin: 30px 0;'>
                        <a href='{resetUrl}' class='button'>Reset Your Password</a>
                    </p>
                    
                    <p>If you did not request a password reset, please ignore this email or contact us if you have concerns.</p>
                    
                    <p>Thank you,</p>
                    <p>The BookStore Team</p>
                </div>
                <div class='footer'>
                    <p>&copy; {DateTime.Now.Year} BookStore. All rights reserved.</p>
                    <p>This email was sent to {email}</p>
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
                .button {{ display: inline-block; background-color: #6b46c1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }}
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
                        <li>Get special discounts (5% off when ordering 5+ books)</li>
                        <li>Earn loyalty benefits (10% additional discount after 10 successful orders)</li>
                        <li>Review books you've purchased</li>
                        <li>Track your orders</li>
                    </ul>
                    
                    <p style='text-align: center; margin: 30px 0;'>
                        <a href='{_emailSettings.WebsiteBaseUrl}/browse' class='button'>Start Browsing Books</a>
                    </p>
                    
                    <p>If you have any questions, please don't hesitate to contact our customer service team.</p>
                    
                    <p>Happy reading!</p>
                    <p>The BookStore Team</p>
                </div>
                <div class='footer'>
                    <p>&copy; {DateTime.Now.Year} BookStore. All rights reserved.</p>
                    <p>This email was sent to {email}</p>
                </div>
            </div>
        </body>
        </html>";

        await SendEmailAsync(email, subject, body);
    }

    private async Task SendEmailAsync(string email, string subject, string htmlBody)
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
                Body = htmlBody,
                IsBodyHtml = true
            };

            message.To.Add(email);

            await client.SendMailAsync(message);
        }
        catch (Exception ex)
        {
            // Log the exception - in a real application, use a proper logging framework
            Console.WriteLine($"Error sending email: {ex.Message}");
            throw;
        }
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
=======
﻿

// Services/EmailService.cs
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
>>>>>>> 70b8483259c9c9e6f32724ef5545d77bef8e3a60
}