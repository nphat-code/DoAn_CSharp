using FluentValidation.Results;

namespace TuneVault.Application.Exceptions;

public class ValidationException : Exception
{
    public ValidationException() : base("Một hoặc nhiều lỗi xác thực (validation) đã xảy ra.")
    {
        Errors = new Dictionary<string, string[]>();
    }

    public ValidationException(IEnumerable<ValidationFailure> failures) : this()
    {
        Errors = failures
            .GroupBy(e => e.PropertyName, e => e.ErrorMessage)
            .ToDictionary(failureGroup => failureGroup.Key, failureGroup => failureGroup.ToArray());
    }

    public IDictionary<string, string[]> Errors { get; }
}
