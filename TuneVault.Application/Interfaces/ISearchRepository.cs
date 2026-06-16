
using TuneVault.Application.Features.Media.DTOs;

namespace TuneVault.Application.Interfaces;

public interface ISearchRepository
{
    Task<SearchResultDto> SearchAsync(string query, int page, int pageSize, CancellationToken cancellationToken);
}
