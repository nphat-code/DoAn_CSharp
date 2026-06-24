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
        
        // Fix lỗi IPv6 Blackhole trên .NET Core: Ép buộc dùng IPv4 để kết nối tới Google
        using var socket = new System.Net.Sockets.Socket(System.Net.Sockets.AddressFamily.InterNetwork, System.Net.Sockets.SocketType.Stream, System.Net.Sockets.ProtocolType.Tcp);
        await socket.ConnectAsync(smtpServer, 465, cancellationToken);

        await client.ConnectAsync(socket, smtpServer, 465, SecureSocketOptions.SslOnConnect, cancellationToken);
        await client.AuthenticateAsync(senderEmail, appPassword, cancellationToken);
        await client.SendAsync(message, cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);
    }
}
