using Microsoft.Extensions.Caching.Memory;
using TuneVault.Application.Interfaces;

namespace TuneVault.Infrastructure.Services;

public class MemoryCacheService(IMemoryCache memoryCache) : ICacheService
{
    public void Set<T>(string key, T value, TimeSpan expiration)
    {
        memoryCache.Set(key, value, expiration);
    }

    public bool TryGetValue<T>(string key, out T? value)
    {
        return memoryCache.TryGetValue(key, out value);
    }

    public void Remove(string key)
    {
        memoryCache.Remove(key);
    }
}
