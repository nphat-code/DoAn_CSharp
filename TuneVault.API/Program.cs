using TuneVault.Application;
using TuneVault.Infrastructure;
using TuneVault.Infrastructure.Hubs;

var builder = WebApplication.CreateBuilder(args);

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

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
}

app.UseHttpsRedirection();

// Cấu hình Middleware phục vụ các file tĩnh (trong wwwroot)
app.UseStaticFiles();

// Bật CORS
app.UseCors("CorsPolicy");

// Cấu hình Middleware Xác thực và Phân quyền
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Đăng ký SignalR Hub endpoint
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();
