using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using TuneVault.Application.Interfaces;

namespace TuneVault.Infrastructure.Services;

public class GeminiAiService(HttpClient httpClient, IConfiguration configuration) : IAiService
{
    public async Task<IEnumerable<(string Title, string Artist)>> GetRecommendationsAsync(string playHistoryContext, string favoritesContext, CancellationToken cancellationToken)
    {
        var apiKey = configuration["Gemini:ApiKey"];
        if (string.IsNullOrEmpty(apiKey) || apiKey == "API_KEY_CỦA_BẠN_ĐỂ_Ở_ĐÂY" || apiKey == "your_gemini_api_key_here")
        {
            // Trả về mock data nếu chưa cấu hình API Key để không bị sập ứng dụng
            return new List<(string, string)>
            {
                ("Chưa cấu hình Gemini API Key", "Hệ thống")
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
            contents = new[]
            {
                new 
                { 
                    parts = new[] { new { text = prompt } } 
                }
            },
            generationConfig = new
            {
                responseMimeType = "application/json"
            }
        };

        var requestUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={apiKey}";

        var response = await httpClient.PostAsJsonAsync(requestUrl, requestBody, cancellationToken);
        
        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
            Console.WriteLine($"[Gemini API Error] Status: {response.StatusCode}, Detail: {errorContent}");
            // Fallback nếu API lỗi
            return new List<(string, string)>();
        }

        var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
        
        try
        {
            using var document = JsonDocument.Parse(responseJson);
            var candidates = document.RootElement.GetProperty("candidates");
            if (candidates.GetArrayLength() == 0) return new List<(string, string)>();
            
            var contentPart = candidates[0].GetProperty("content").GetProperty("parts")[0];
            var textContent = contentPart.GetProperty("text").GetString();

            if (string.IsNullOrEmpty(textContent)) return new List<(string, string)>();

            // Xử lý json nếu model bọc trong markdown
            textContent = textContent.Replace("```json", "").Replace("```", "").Trim();

            var result = JsonSerializer.Deserialize<List<GeminiRecommendationResponse>>(textContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            
            if (result == null) return new List<(string, string)>();

            return result.Select(x => (x.Title, x.Artist));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Gemini API Parse Error] {ex.Message}");
            return new List<(string, string)>();
        }
    }

    private class GeminiRecommendationResponse
    {
        public string Title { get; set; } = string.Empty;
        public string Artist { get; set; } = string.Empty;
    }
}
