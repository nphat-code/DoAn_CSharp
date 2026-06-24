using System.Data;
using System.Text;
using Dapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using TuneVault.Application.Interfaces;
using TuneVault.Infrastructure.Authentication;
using TuneVault.Infrastructure.Repositories;
using TuneVault.Infrastructure.Storage;

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

        // Cấu hình IDbConnection cho Dapper dùng Npgsql (PostgreSQL)
        services.AddScoped<IDbConnection>(sp => new NpgsqlConnection(connectionString));

        // Đăng ký TypeHandler cho TimeSpan của Dapper
        SqlMapper.AddTypeHandler(new TimeSpanHandler());

        services.AddAuth(configuration);


        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IArtistRepository, ArtistRepository>();
        services.AddScoped<IMediaItemRepository, MediaItemRepository>();
        services.AddScoped<IPlaylistRepository, PlaylistRepository>();
        services.AddScoped<IShareRepository, ShareRepository>();
        services.AddScoped<IFileStorageService, CloudinaryStorageService>();
        services.AddScoped<IPlayHistoryRepository, PlayHistoryRepository>();
        services.AddScoped<IFavoriteRepository, FavoriteRepository>();
        services.AddScoped<IAlbumRepository, AlbumRepository>();
        services.AddScoped<ISearchRepository, SearchRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IRecommendationRepository, RecommendationRepository>();
        services.AddScoped<IFollowRepository, FollowRepository>();
        services.AddScoped<INotificationService, TuneVault.Infrastructure.Services.NotificationService>();
        services.AddScoped<IEmailService, TuneVault.Infrastructure.Services.EmailService>();
        services.AddSingleton<ICacheService, TuneVault.Infrastructure.Services.MemoryCacheService>();
        services.AddHttpClient<IAiService, TuneVault.Infrastructure.Services.GeminiAiService>();

        services.AddSignalR();

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
            .AddJwtBearer(options =>

            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidAudience = jwtSettings.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtSettings.Secret))
                };

                // Xử lý token cho SignalR (WebSockets không gửi qua Header được)

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                        {
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            });

        return services;
    }
}

public class TimeSpanHandler : SqlMapper.TypeHandler<TimeSpan>
{
    public override void SetValue(IDbDataParameter parameter, TimeSpan value)
    {
        parameter.Value = value.ToString();
    }

    public override TimeSpan Parse(object value)
    {
        if (value is string s && TimeSpan.TryParse(s, out var ts))
        {
            return ts;
        }
        else if (value is TimeSpan timeSpan)
        {
            return timeSpan;
        }
        return TimeSpan.Zero;
    }
}
