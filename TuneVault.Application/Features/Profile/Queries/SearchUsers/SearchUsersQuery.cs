using MediatR;
using TuneVault.Application.Features.Profile.DTOs;

namespace TuneVault.Application.Features.Profile.Queries.SearchUsers;

public record SearchUsersQuery(string Query) : IRequest<IEnumerable<ProfileDto>>;
