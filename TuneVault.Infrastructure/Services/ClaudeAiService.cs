using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using TuneVault.Application.Interfaces;

namespace TuneVault.Infrastructure.Services;

public class ClaudeAiService(HttpClient httpClient, IConfiguration configuration) : IAiService
{
    public async Task<IEnumerable<(string Title, string Artist)>> GetRecommendationsAsync(string playHistoryContext, string favoritesContext, CancellationToken cancellationToken)
    {
        var apiKey = configuration["Anthropic:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
        {
            
            return new List<(string, string)>
            {
                ("Chưa cấu hình Claude API Key", "Hệ thống")
            };
        }

        var prompt = $@"Bạn là một chuyên gia gợi ý âm nhạc. 
Dựa vào lịch sử nghe: {playHistoryContext} 
Và danh sách bài hát yêu thích: {favoritesContext}. 
Hãy gợi ý 5 bài hát có phong cách tương tự (Có thể là US-UK, V-Pop, K-Pop tùy thuộc vào dữ liệu đầu vào).
Yêu cầu bắt buộc: Chỉ trả về ĐÚNG MỘT MẢNG JSON, không giải thích gì thêm, không có text bao quanh.
Định dạng JSON:
[
  {{ ""title"": ""Tên bài hát"", ""artist"": ""Tên ca sĩ"" }}
]";

        var requestBody = new
        {
            model = "claude-3-haiku-20240307",
            max_tokens = 1024,
            messages = new[]
            {
                new { role = "user", content = prompt }
            }
        };

        var jsonBody = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.anthropic.com/v1/messages")
        {
            Content = content
        };
        request.Headers.Add("x-api-key", apiKey);
        request.Headers.Add("anthropic-version", "2023-06-01");

        var response = await httpClient.SendAsync(request, cancellationToken);
        
        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
            Console.WriteLine($"[Claude API Error] Status: {response.StatusCode}, Detail: {errorContent}");
            
            return new List<(string, string)>();
        }

        var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
        
        try
        {
            using var document = JsonDocument.Parse(responseJson);
            var contentArray = document.RootElement.GetProperty("content");
            var textContent = contentArray[0].GetProperty("text").GetString();

            if (string.IsNullOrEmpty(textContent)) return new List<(string, string)>();

            
            textContent = textContent.Replace("```json", "").Replace("```", "").Trim();

            var result = JsonSerializer.Deserialize<List<ClaudeRecommendationResponse>>(textContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            
            if (result == null) return new List<(string, string)>();

            return result.Select(x => (x.Title, x.Artist));
        }
        catch
        {
            return new List<(string, string)>();
        }
    }

    private class ClaudeRecommendationResponse
    {
        public string Title { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty;
    }
}
