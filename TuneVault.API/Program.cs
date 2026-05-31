using TuneVault.Application;
using TuneVault.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Register Clean Architecture Layers
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Cấu hình Middleware phục vụ các file tĩnh (trong wwwroot)
app.UseStaticFiles();

// Cấu hình Middleware Xác thực và Phân quyền
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
