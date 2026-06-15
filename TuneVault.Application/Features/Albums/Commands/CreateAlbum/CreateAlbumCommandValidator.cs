using FluentValidation;

namespace TuneVault.Application.Features.Albums.Commands.CreateAlbum;

public class CreateAlbumCommandValidator : AbstractValidator<CreateAlbumCommand>
{
    public CreateAlbumCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Tên Album không được để trống.")
            .MaximumLength(100).WithMessage("Tên Album không được vượt quá 100 ký tự.");

        RuleFor(x => x.ArtistName)
            .NotEmpty().WithMessage("Tên nghệ sĩ không được để trống.")
            .MaximumLength(100).WithMessage("Tên nghệ sĩ không được vượt quá 100 ký tự.");
    }
}
