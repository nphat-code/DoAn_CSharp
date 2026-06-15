using FluentValidation;

namespace TuneVault.Application.Features.Profile.Commands.UpdateProfile;

public class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("UserId không được để trống.");

        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username không được để trống.")
            .MinimumLength(3).WithMessage("Username phải có ít nhất 3 ký tự.")
            .MaximumLength(50).WithMessage("Username không được vượt quá 50 ký tự.");

        RuleFor(x => x.Bio)
            .MaximumLength(1000).WithMessage("Tiểu sử không được vượt quá 1000 ký tự.");
    }
}
