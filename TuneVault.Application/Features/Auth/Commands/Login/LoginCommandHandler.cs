using MediatR;
using TuneVault.Application.Exceptions;
using TuneVault.Application.Features.Auth.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Auth.Commands.Login;

public class LoginCommandHandler(
    IUserRepository userRepository, 
    IPasswordHasher passwordHasher, 
    IJwtTokenGenerator jwtTokenGenerator) : IRequestHandler<LoginCommand, LoginResponseDto>
{

    public async Task<LoginResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra User tồn tại
        var user = await userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (user == null)
        {
            throw new UnauthorizedException("Invalid email or password.");
        }

        // 2. Kiểm tra Password
        if (!passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedException("Invalid email or password.");
        }

        // 3. Sinh Token
        var token = jwtTokenGenerator.GenerateToken(user);

        // 4. Trả về DTO
        return new LoginResponseDto
        {
            UserId = user.Id,
            Username = user.Username,
            AvatarUrl = user.AvatarUrl ?? string.Empty,
            Token = token
        };
    }
}
