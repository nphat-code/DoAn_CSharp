using MediatR;
using TuneVault.Application.Features.Media.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Media.Queries.SearchMedia;

public class SearchMediaQueryHandler(ISearchRepository searchRepository) : IRequestHandler<SearchMediaQuery, SearchResultDto>
{
    public async Task<SearchResultDto> Handle(SearchMediaQuery request, CancellationToken cancellationToken)
    {
        return await searchRepository.SearchAsync(request.Query, request.Page, request.PageSize, cancellationToken);
    }
}
