using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using TuneVault.Application.Interfaces;

namespace TuneVault.Infrastructure.Services;

public class EmailService(IConfiguration configuration) : IEmailService
{
    public async Task SendEmailAsync(string toEmail, string subject, string body, CancellationToken cancellationToken)
    {
        var smtpServer = configuration["EmailSettings:SmtpServer"] ?? "smtp.gmail.com";
        var senderEmail = configuration["EmailSettings:SenderEmail"] ?? "ntphat.131106@gmail.com";
        var senderName = configuration["EmailSettings:SenderName"] ?? "TuneVault";
        var appPassword = configuration["EmailSettings:AppPassword"];

        if (string.IsNullOrEmpty(appPassword))
        {
            throw new Exception("Vui lòng cấu hình AppPassword cho EmailSettings trong appsettings.json.");
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(senderName, senderEmail));
        message.To.Add(new MailboxAddress("", toEmail));
        message.Subject = subject;

        message.Body = new TextPart("plain")
        {
            Text = body
        };

        using var client = new SmtpClient();
        // Dùng cổng 465 (SSL/TLS ngầm định) để vượt mặt các trình duyệt virus/firewall hay chặn cổng 587
        await client.ConnectAsync(smtpServer, 465, SecureSocketOptions.SslOnConnect, cancellationToken);
        await client.AuthenticateAsync(senderEmail, appPassword, cancellationToken);
        await client.SendAsync(message, cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);
    }
}
