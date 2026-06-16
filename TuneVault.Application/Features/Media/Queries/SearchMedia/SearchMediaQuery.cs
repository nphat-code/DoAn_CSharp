using MediatR;
using TuneVault.Application.Features.Media.DTOs;

namespace TuneVault.Application.Features.Media.Queries.SearchMedia;

public record SearchMediaQuery(string Query, int Page = 1, int PageSize = 10) : IRequest<SearchResultDto>;
