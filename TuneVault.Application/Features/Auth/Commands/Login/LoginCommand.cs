using MediatR;
using TuneVault.Application.Features.Auth.DTOs;

namespace TuneVault.Application.Features.Auth.Commands.Login;

public record LoginCommand(string Username, string Password) : IRequest<LoginResponseDto>;
