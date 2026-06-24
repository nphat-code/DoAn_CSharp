using MediatR;
using TuneVault.Application.Features.Auth.DTOs;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    IJwtTokenGenerator jwtTokenGenerator) : IRequestHandler<RegisterCommand, LoginResponseDto>
{
    public async Task<LoginResponseDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        
        var existingUser = await userRepository.GetByUsernameAsync(request.Username, cancellationToken);
        if (existingUser != null)
        {
            throw new Exception("Username đã tồn tại. Vui lòng chọn tên đăng nhập khác.");
        }

        
        var existingEmail = await userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingEmail != null)
        {
            throw new Exception("Email đã được sử dụng. Vui lòng dùng email khác.");
        }

        
        var passwordHash = passwordHasher.Hash(request.Password);

        
        var user = new UserProfile
        {
            Id = Guid.NewGuid(),
            Username = request.Username,
            Email = request.Email,
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow,
            Role = request.Username.ToLower() == "admin" ? "Admin" : "User"
        };

        
        await userRepository.AddAsync(user, cancellationToken);

        
        var token = jwtTokenGenerator.GenerateToken(user);

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
