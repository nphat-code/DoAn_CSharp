namespace TuneVault.Application.Interfaces;

public interface ICacheService
{
    void Set<T>(string key, T value, TimeSpan expiration);
    bool TryGetValue<T>(string key, out T? value);
    void Remove(string key);
}
