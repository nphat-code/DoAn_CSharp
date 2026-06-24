using System.Net;
using System.Text.Json;
using TuneVault.Application.Exceptions;

namespace TuneVault.API.Middlewares;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex, logger);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception, ILogger<ExceptionHandlingMiddleware> logger)
    {
        var response = context.Response;
        response.ContentType = "application/json";

        var responseModel = new ErrorResponse
        {
            Message = exception.Message
        };

        switch (exception)
        {
            case ValidationException validationEx:
                var errorDetails = string.Join(", ", validationEx.Errors.Select(e => $"{e.Key}: {string.Join(" | ", e.Value)}"));
                logger.LogWarning("Validation failed: {Message}. Details: {Details}", exception.Message, errorDetails);
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                responseModel.Errors = validationEx.Errors;
                break;
            case UnauthorizedException:
                logger.LogWarning("Unauthorized access attempt: {Message}", exception.Message);
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                break;
            case ForbiddenAccessException:
                logger.LogWarning("Forbidden access attempt: {Message}", exception.Message);
                response.StatusCode = (int)HttpStatusCode.Forbidden;
                break;
            case KeyNotFoundException:
                logger.LogWarning("Resource not found: {Message}", exception.Message);
                response.StatusCode = (int)HttpStatusCode.NotFound;
                break;
            default:
                
                logger.LogError(exception, "Đã xảy ra lỗi hệ thống nội bộ nghiêm trọng!");
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                responseModel.Message = "Đã xảy ra lỗi hệ thống nội bộ. Vui lòng thử lại sau.";
                break;
        }

        var result = JsonSerializer.Serialize(responseModel, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        await response.WriteAsync(result);
    }
}

public class ErrorResponse
{
    public bool Success { get; set; } = false;
    public string Message { get; set; } = string.Empty;
    public IDictionary<string, string[]>? Errors { get; set; }
}
