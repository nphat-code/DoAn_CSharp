namespace TuneVault.Application.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(Stream fileStream, string originalFileName, CancellationToken cancellationToken);
    string GetPhysicalPath(string fileUrl);
}
