using FluentValidation;

namespace TuneVault.Application.Features.Auth.Commands.Register;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Tên đăng nhập không được để trống")
            .MinimumLength(3).WithMessage("Tên đăng nhập phải có ít nhất 3 ký tự");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email không được để trống")
            .EmailAddress().WithMessage("Định dạng email không hợp lệ");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Mật khẩu không được để trống")
            .MinimumLength(10).WithMessage("Mật khẩu phải có ít nhất 10 ký tự")
            .Matches(@"[a-zA-Z]").WithMessage("Mật khẩu phải chứa ít nhất 1 chữ cái")
            .Matches(@"[^a-zA-Z\s]").WithMessage("Mật khẩu phải chứa ít nhất 1 chữ số hoặc ký tự đặc biệt");
    }
}
