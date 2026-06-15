using System.Reflection;
using MediatR;
using TuneVault.Application.Security;
using TuneVault.Application.Exceptions;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Behaviors;

public class AuthorizationBehavior<TRequest, TResponse>(ICurrentUserService currentUserService) : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var authorizeAttributes = request.GetType().GetCustomAttributes<AuthorizeAttribute>();

        if (authorizeAttributes.Any())
        {
            if (currentUserService.UserId == null)
            {
                throw new UnauthorizedException("Bạn cần đăng nhập để thực hiện chức năng này.");
            }

            // Có thể thêm logic kiểm tra Role (Role-based Authorization) tại đây nếu cần
            // bool hasAccess = true; 
            // if (!hasAccess)
            // {
            //     throw new ForbiddenAccessException();
            // }
        }

        // Vượt qua kiểm tra quyền -> đi tiếp tới bước Validation hoặc Handler
        return await next();
    }
}
