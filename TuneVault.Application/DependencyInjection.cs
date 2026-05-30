using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using TuneVault.Application.Behaviors;

namespace TuneVault.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // 1. Quét và đăng ký tự động toàn bộ các Validators từ Assembly hiện tại vào DI container
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        // 2. Đăng ký MediatR cùng với các Pipeline Behaviors
        services.AddMediatR(cfg =>
        {
            // Đăng ký tất cả các CQRS Handlers (Command/Query) trong Assembly
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            
            // Cấu hình Pipeline (Đường ống) xử lý Request
            // THỨ TỰ RẤT QUAN TRỌNG: Nó sẽ chạy từ trên xuống dưới trước khi vào Handler
            // Bước 1: Kiểm tra quyền truy cập (Authorization)
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(AuthorizationBehavior<,>));
            
            // Bước 2: Kiểm tra dữ liệu đầu vào (Validation)
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        });

        return services;
    }
}
