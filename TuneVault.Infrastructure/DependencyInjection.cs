using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using TuneVault.Application.Interfaces;
using Microsoft.Data.SqlClient;
using TuneVault.Infrastructure.Storage;
using System.Data;
using TuneVault.Infrastructure.Authentication;
using TuneVault.Infrastructure.Repositories;

namespace TuneVault.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services, 
        IConfiguration configuration)
    {
        // Đọc chuỗi kết nối an toàn từ appsettings.json
        var connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        // Cấu hình IDbConnection cho Dapper
        services.AddScoped<IDbConnection>(sp => new SqlConnection(connectionString));

        services.AddAuth(configuration);
        
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IMediaItemRepository, MediaItemRepository>();
        services.AddScoped<IFileStorageService, FileStorageService>();

        return services;
    }

    private static IServiceCollection AddAuth(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var jwtSettings = new JwtSettings();
        configuration.Bind(JwtSettings.SectionName, jwtSettings);
        
        services.AddSingleton(Microsoft.Extensions.Options.Options.Create(jwtSettings));
        
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddSingleton<IPasswordHasher, PasswordHasher>();

        services.AddAuthentication(defaultScheme: JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options => options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings.Issuer,
                ValidAudience = jwtSettings.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtSettings.Secret))
            });

        return services;
    }
}
