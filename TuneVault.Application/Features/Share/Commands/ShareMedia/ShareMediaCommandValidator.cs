using FluentValidation;

namespace TuneVault.Application.Features.Share.Commands.ShareMedia;

public class ShareMediaCommandValidator : AbstractValidator<ShareMediaCommand>
{
    public ShareMediaCommandValidator()
    {
        RuleFor(x => x.SenderId)
            .NotEmpty().WithMessage("Người gửi không được để trống.");

        RuleFor(x => x.ReceiverId)
            .NotEmpty().WithMessage("Người nhận không được để trống.");

        RuleFor(x => x.MediaId)
            .NotEmpty().WithMessage("Media không được để trống.");

        RuleFor(x => x.Message)
            .MaximumLength(500).WithMessage("Tin nhắn chia sẻ không được vượt quá 500 ký tự.");
    }
}
