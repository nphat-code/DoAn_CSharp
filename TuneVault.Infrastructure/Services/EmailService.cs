using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using TuneVault.Application.Interfaces;

namespace TuneVault.Infrastructure.Services;

public class EmailService(IConfiguration configuration) : IEmailService
{
    public async Task SendEmailAsync(string toEmail, string subject, string body, CancellationToken cancellationToken)
    {
        var smtpServer = configuration["EmailSettings:SmtpServer"] ?? "smtp.gmail.com";
        var port = int.Parse(configuration["EmailSettings:Port"] ?? "587");
        var senderEmail = configuration["EmailSettings:SenderEmail"] ?? "ntphat.131106@gmail.com";
        var senderName = configuration["EmailSettings:SenderName"] ?? "TuneVault";
        var appPassword = configuration["EmailSettings:AppPassword"];

        if (string.IsNullOrEmpty(appPassword))
        {
            throw new Exception("Vui lòng cấu hình AppPassword cho EmailSettings trong appsettings.json.");
        }

        using var smtpClient = new SmtpClient(smtpServer, port)
        {
            Credentials = new NetworkCredential(senderEmail, appPassword),
            EnableSsl = true
        };

        // Dùng overload string giống hệt file test_email.cs
        smtpClient.Send(senderEmail, toEmail, subject, body);
        await Task.CompletedTask;
    }
}
