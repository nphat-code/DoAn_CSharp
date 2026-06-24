using MediatR;

namespace TuneVault.Application.Features.Auth.Queries.CheckEmail;

public record CheckEmailQuery(string Email) : IRequest<bool>;
