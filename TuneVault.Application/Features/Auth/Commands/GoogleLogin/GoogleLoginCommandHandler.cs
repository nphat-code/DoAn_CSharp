using System.Text.Json;
using MediatR;
using Microsoft.Extensions.Configuration;
using Google.Apis.Auth;
using TuneVault.Application.Exceptions;
using TuneVault.Application.Features.Auth.DTOs;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Auth.Commands.GoogleLogin;

public class GoogleLoginCommandHandler(
    IUserRepository userRepository, 
    IJwtTokenGenerator jwtTokenGenerator,
    IConfiguration configuration) : IRequestHandler<GoogleLoginCommand, LoginResponseDto>
{
    public async Task<LoginResponseDto> Handle(GoogleLoginCommand request, CancellationToken cancellationToken)
    {
        // 1. Verify id_token with Google
        var clientId = configuration["Google:ClientId"];
        var settings = new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = new[] { clientId }
        };

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(request.Token, settings);
        }
        catch (InvalidJwtException)
        {
            throw new UnauthorizedException("Invalid Google token.");
        }

        if (payload == null || string.IsNullOrEmpty(payload.Email))
        {
            throw new UnauthorizedException("Could not retrieve email from Google.");
        }

        var googleEmail = payload.Email;
        var googleName = payload.Name;
        var googlePicture = payload.Picture;

        // 2. Check if user exists
        var user = await userRepository.GetByEmailAsync(googleEmail, cancellationToken);
        
        if (user == null)
        {
            // Register new user
            user = new UserProfile
            {
                Email = googleEmail,
                Username = googleName ?? googleEmail.Split('@')[0],
                PasswordHash = "", // No password for Google users
                AvatarUrl = googlePicture
            };
            await userRepository.AddAsync(user, cancellationToken);
        }
        else
        {
            // Update avatar if missing
            if (string.IsNullOrEmpty(user.AvatarUrl) && !string.IsNullOrEmpty(googlePicture))
            {
                await userRepository.UpdateAvatarAsync(user.Id, googlePicture, cancellationToken);
                user.AvatarUrl = googlePicture;
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


