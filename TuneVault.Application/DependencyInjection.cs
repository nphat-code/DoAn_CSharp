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
        
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        
        services.AddMediatR(cfg =>
        {
            
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            
            
            
            
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(AuthorizationBehavior<,>));
            
            
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        });

        return services;
    }
}
