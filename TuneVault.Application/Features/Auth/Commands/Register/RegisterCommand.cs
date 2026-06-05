using MediatR;
using TuneVault.Application.Features.Auth.DTOs;

namespace TuneVault.Application.Features.Auth.Commands.Register;

public record RegisterCommand(string Username, string Email, string Password) : IRequest<LoginResponseDto>;
