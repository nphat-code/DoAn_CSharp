using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Auth.Commands.SendOtp;

public class SendOtpCommandHandler(
    IUserRepository userRepository,
    IEmailService emailService,
    ICacheService cacheService) : IRequestHandler<SendOtpCommand, bool>
{
    public async Task<bool> Handle(SendOtpCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (user == null)
        {
            throw new Exception("Email không tồn tại trong hệ thống.");
        }

        // Generate 6-digit OTP
        var random = new Random();
        var otp = random.Next(100000, 999999).ToString();

        // Save to cache for 20 minutes
        cacheService.Set($"OTP_{request.Email}", otp, TimeSpan.FromMinutes(20));

        // Send Email
        var subject = "Your TuneVault login code";
        var body = $@"Hi,

Enter this code to continue logging in without a password:

{otp}

This code is valid for 20 minutes and can only be used once. By entering this code, you will also confirm the email address associated with your account.

If you didn't attempt to log in, you can safely ignore this email.

Best regards,
TuneVault";

        await emailService.SendEmailAsync(request.Email, subject, body, cancellationToken);

        return true;
    }
}
