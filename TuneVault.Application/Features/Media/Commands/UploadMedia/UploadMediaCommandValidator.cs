using FluentValidation;

namespace TuneVault.Application.Features.Media.Commands.UploadMedia;

public class UploadMediaCommandValidator : AbstractValidator<UploadMediaCommand>
{
    public UploadMediaCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Tiêu đề không được để trống.");

        RuleFor(x => x.FileName)
            .NotEmpty().WithMessage("Phải có file đính kèm.")
            .Must(HaveValidExtension).WithMessage("Định dạng file không được hỗ trợ. Vui lòng dùng mp3, mp4, wav.");
    }

    private bool HaveValidExtension(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName)) return false;
        
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        return ext is ".mp3" or ".mp4" or ".wav";
    }
}
