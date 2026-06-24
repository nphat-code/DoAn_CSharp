using MediatR;
using TuneVault.Application.Features.Auth.DTOs;

namespace TuneVault.Application.Features.Auth.Commands.GoogleLogin;

public class GoogleLoginCommand : IRequest<LoginResponseDto>
{
    public string Token { get; set; } = string.Empty;
}
