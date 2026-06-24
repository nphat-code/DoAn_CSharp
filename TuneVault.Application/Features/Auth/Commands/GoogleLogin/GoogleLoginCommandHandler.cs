using System.Text.Json;
using MediatR;
using TuneVault.Application.Exceptions;
using TuneVault.Application.Features.Auth.DTOs;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Auth.Commands.GoogleLogin;

public class GoogleLoginCommandHandler(
    IUserRepository userRepository, 
    IJwtTokenGenerator jwtTokenGenerator) : IRequestHandler<GoogleLoginCommand, LoginResponseDto>
{
    public async Task<LoginResponseDto> Handle(GoogleLoginCommand request, CancellationToken cancellationToken)
    {
        // 1. Verify access_token with Google
        using var client = new HttpClient();
        var response = await client.GetAsync($"https://www.googleapis.com/oauth2/v3/userinfo?access_token={request.Token}", cancellationToken);
        
        if (!response.IsSuccessStatusCode)
        {
            throw new UnauthorizedException("Invalid Google token.");
        }

        var content = await response.Content.ReadAsStringAsync(cancellationToken);
        var googleUser = JsonSerializer.Deserialize<GoogleUserInfo>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (googleUser == null || string.IsNullOrEmpty(googleUser.Email))
        {
            throw new UnauthorizedException("Could not retrieve email from Google.");
        }

        // 2. Check if user exists
        var user = await userRepository.GetByEmailAsync(googleUser.Email, cancellationToken);
        
        if (user == null)
        {
            // Register new user
            user = new UserProfile
            {
                Email = googleUser.Email,
                Username = googleUser.Name ?? googleUser.Email.Split('@')[0],
                PasswordHash = "", // No password for Google users
                AvatarUrl = googleUser.Picture
            };
            await userRepository.AddAsync(user, cancellationToken);
        }
        else
        {
            // Update avatar if missing
            if (string.IsNullOrEmpty(user.AvatarUrl) && !string.IsNullOrEmpty(googleUser.Picture))
            {
                await userRepository.UpdateAvatarAsync(user.Id, googleUser.Picture, cancellationToken);
                user.AvatarUrl = googleUser.Picture;
            }
        }

        // 3. Generate Token
        var token = jwtTokenGenerator.GenerateToken(user);

        // 4. Return DTO
        return new LoginResponseDto
        {
            UserId = user.Id,
            Username = user.Username,
            AvatarUrl = user.AvatarUrl ?? string.Empty,
            Role = user.Role,
            Token = token
        };
    }
}

public class GoogleUserInfo
{
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Picture { get; set; } = string.Empty;
}
