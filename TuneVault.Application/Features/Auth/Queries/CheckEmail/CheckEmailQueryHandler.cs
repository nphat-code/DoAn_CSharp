using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Auth.Queries.CheckEmail;

public class CheckEmailQueryHandler(IUserRepository userRepository) : IRequestHandler<CheckEmailQuery, bool>
{
    public async Task<bool> Handle(CheckEmailQuery request, CancellationToken cancellationToken)
    {
        var existingEmail = await userRepository.GetByEmailAsync(request.Email, cancellationToken);
        return existingEmail != null;
    }
}
