using MediatR;

namespace TuneVault.Application.Features.Auth.Commands.SendOtp;

public record SendOtpCommand(string Email) : IRequest<bool>;
