using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using TuneVault.Application.Interfaces;

namespace TuneVault.Infrastructure.Services;

public class EmailService(IConfiguration configuration) : IEmailService
{
    private static readonly HttpClient _httpClient = new HttpClient();

    public async Task SendEmailAsync(string toEmail, string subject, string body, CancellationToken cancellationToken)
    {
        
        var scriptUrl = configuration["EmailSettings:GoogleScriptUrl"];

        if (string.IsNullOrEmpty(scriptUrl))
        {
            throw new Exception("Vui lòng cấu hình GoogleScriptUrl cho EmailSettings.");
        }

        var payload = new
        {
            to = toEmail,
            subject = subject,
            body = body.Replace("\n", "<br>") 
        };

        var request = new HttpRequestMessage(HttpMethod.Post, scriptUrl)
        {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
        };

        var response = await _httpClient.SendAsync(request, cancellationToken);
        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode || responseContent.Contains("\"success\":false"))
        {
            throw new Exception($"Lỗi gửi mail qua Google Script: {responseContent}");
        }
    }
}
