namespace TuneVault.Application.Exceptions;

public class ForbiddenAccessException : Exception
{
    public ForbiddenAccessException() : base("Bạn không có quyền truy cập vào tài nguyên này.") { }
    public ForbiddenAccessException(string message) : base(message) { }
}
