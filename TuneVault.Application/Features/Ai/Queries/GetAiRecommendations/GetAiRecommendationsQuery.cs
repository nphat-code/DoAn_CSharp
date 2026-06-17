using MediatR;
using TuneVault.Application.Features.Media.DTOs;

namespace TuneVault.Application.Features.Ai.Queries.GetAiRecommendations;

public record GetAiRecommendationsQuery(Guid UserId) : IRequest<IEnumerable<MediaItemDto>>;
