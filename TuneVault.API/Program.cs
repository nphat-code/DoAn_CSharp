using Microsoft.AspNetCore.Http.Features;
using TuneVault.Application;
using TuneVault.Infrastructure;
using TuneVault.Infrastructure.Hubs;

var builder = WebApplication.CreateBuilder(args);


builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 2147483648; 
});

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 2147483648; 
});


builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", builder =>
    {
        builder.SetIsOriginAllowed(origin => true) 
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials(); 
    });
});


builder.Services.AddControllers();
builder.Services.AddMemoryCache();
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



builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);


builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<TuneVault.Application.Interfaces.ICurrentUserService, TuneVault.API.Services.CurrentUserService>();

var app = builder.Build();


app.UseMiddleware<TuneVault.API.Middlewares.ExceptionHandlingMiddleware>();


if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
}

app.UseHttpsRedirection();


app.UseCors("CorsPolicy");


app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Methods", "GET, OPTIONS");
    }
});


app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();
