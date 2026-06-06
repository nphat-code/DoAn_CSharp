using MediatR;
using TuneVault.Application.Features.Profile.DTOs;

namespace TuneVault.Application.Features.Profile.Queries.GetProfile;

public record GetProfileQuery(Guid UserId) : IRequest<ProfileDto>;
