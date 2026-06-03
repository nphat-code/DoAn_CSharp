using MediatR;
using TuneVault.Application.Features.Media.DTOs;

namespace TuneVault.Application.Features.Media.Queries.GetMediaStream;

public record GetMediaStreamQuery(Guid MediaId) : IRequest<MediaStreamDto>;
