using MediatR;
using TuneVault.Application.Features.Auth.DTOs;

namespace TuneVault.Application.Features.Auth.Commands.VerifyOtp;

public record VerifyOtpCommand(string Email, string Otp) : IRequest<LoginResponseDto>;
