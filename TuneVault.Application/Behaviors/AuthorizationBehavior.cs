using System.Reflection;
using MediatR;
using TuneVault.Application.Security;
using TuneVault.Application.Exceptions;

namespace TuneVault.Application.Behaviors;

public class AuthorizationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    // Thường bạn sẽ inject ICurrentUserService để lấy userId/vai trò hiện tại.
    // public AuthorizationBehavior(ICurrentUserService currentUserService) ...

    public AuthorizationBehavior()
    {
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var authorizeAttributes = request.GetType().GetCustomAttributes<AuthorizeAttribute>();

        if (authorizeAttributes.Any())
        {
            // Logc giả định: Kiểm tra nếu user chưa đăng nhập
            // if (_currentUserService.UserId == null)
            // {
            //     throw new UnauthorizedException();
            // }

            // Logic giả định: Kiểm tra Roles hoặc Policy dựa trên thuộc tính
            bool hasAccess = true; 

            if (!hasAccess)
            {
                throw new ForbiddenAccessException();
            }
        }

        // Vượt qua kiểm tra quyền -> đi tiếp tới bước Validation hoặc Handler
        return await next();
    }
}
