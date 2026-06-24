using MediatR;
using TuneVault.Application.Features.Auth.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Auth.Commands.VerifyOtp;

public class VerifyOtpCommandHandler(
    IUserRepository userRepository,
    ICacheService cacheService,
    IJwtTokenGenerator jwtTokenGenerator) : IRequestHandler<VerifyOtpCommand, LoginResponseDto>
{
    public async Task<LoginResponseDto> Handle(VerifyOtpCommand request, CancellationToken cancellationToken)
    {
        if (!cacheService.TryGetValue($"OTP_{request.Email}", out string? storedOtp) || storedOtp != request.Otp)
        {
            throw new Exception("Mã OTP không hợp lệ hoặc đã hết hạn.");
        }

        // OTP matches, remove it to prevent reuse
        cacheService.Remove($"OTP_{request.Email}");

        var user = await userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (user == null)
        {
            throw new Exception("Không tìm thấy người dùng.");
        }

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
