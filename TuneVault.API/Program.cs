using Microsoft.AspNetCore.Http.Features;
using TuneVault.Application;
using TuneVault.Infrastructure;
using TuneVault.Infrastructure.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình giới hạn kích thước upload (2GB) để cho phép up video FHD/4K
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 2147483648; // 2GB
});

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 2147483648; // 2GB
});

// Add CORS policy for React Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", builder =>
    {
        builder.WithOrigins("http://localhost:5173") // React Dev Server
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials(); // Quan trọng cho SignalR JWT
    });
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApiDocument(config =>
{
    config.Title = "TuneVault API";
    config.AddSecurity("Bearer", Enumerable.Empty<string>(), new NSwag.OpenApiSecurityScheme
    {
        Type = NSwag.OpenApiSecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        Description = "Copy mã Token ở API Login/Register và dán vào đây (không cần chữ Bearer)."
    });
    
    config.OperationProcessors.Add(new NSwag.Generation.Processors.Security.AspNetCoreOperationSecurityScopeProcessor("Bearer"));
});

// Register Clean Architecture Layers

builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// Đăng ký Current User Service
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<TuneVault.Application.Interfaces.ICurrentUserService, TuneVault.API.Services.CurrentUserService>();

var app = builder.Build();

// Đăng ký Global Exception Handler (Người hứng bom toàn cục)
app.UseMiddleware<TuneVault.API.Middlewares.ExceptionHandlingMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
}

app.UseHttpsRedirection();

// Bật CORS (Phải để trước UseStaticFiles để ảnh có header CORS)
app.UseCors("CorsPolicy");

// Cấu hình Middleware phục vụ các file tĩnh (trong wwwroot) và cho phép CORS để lấy màu
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "http://localhost:5173");
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Methods", "GET, OPTIONS");
    }
});

// Cấu hình Middleware Xác thực và Phân quyền
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Đăng ký SignalR Hub endpoint
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();
