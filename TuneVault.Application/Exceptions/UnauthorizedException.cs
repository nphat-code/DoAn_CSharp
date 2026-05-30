namespace TuneVault.Application.Exceptions;

public class UnauthorizedException : Exception
{
    public UnauthorizedException() : base("Yêu cầu cần phải đăng nhập.") { }
    public UnauthorizedException(string message) : base(message) { }
}
