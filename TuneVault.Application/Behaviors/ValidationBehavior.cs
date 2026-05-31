using FluentValidation;
using MediatR;
using ValidationException = TuneVault.Application.Exceptions.ValidationException;

namespace TuneVault.Application.Behaviors;

public class ValidationBehavior<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators) : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        if (validators.Any())
        {
            var context = new ValidationContext<TRequest>(request);

            // Chạy tất cả các Validator một cách bất đồng bộ
            var validationResults = await Task.WhenAll(
                validators.Select(v => v.ValidateAsync(context, cancellationToken)));

            // Lọc ra các lỗi
            var failures = validationResults
                .Where(r => r.Errors.Any())
                .SelectMany(r => r.Errors)
                .ToList();

            // Nếu có lỗi, ném ra custom exception chứa chi tiết lỗi
            if (failures.Any())
            {
                throw new ValidationException(failures);
            }
        }

        // Nếu dữ liệu hợp lệ, cho phép request đi tiếp qua ống (pipeline)
        return await next();
    }
}
