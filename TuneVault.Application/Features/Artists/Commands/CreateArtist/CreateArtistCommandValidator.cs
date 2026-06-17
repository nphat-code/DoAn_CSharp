using FluentValidation;

namespace TuneVault.Application.Features.Artists.Commands.CreateArtist;

public class CreateArtistCommandValidator : AbstractValidator<CreateArtistCommand>
{
    public CreateArtistCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên nghệ sĩ không được để trống.")
            .MaximumLength(100).WithMessage("Tên nghệ sĩ không được vượt quá 100 ký tự.");

        RuleFor(x => x.Bio)
            .MaximumLength(5000).WithMessage("Tiểu sử không được vượt quá 5000 ký tự.");
    }
}
