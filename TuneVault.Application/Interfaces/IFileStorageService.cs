namespace TuneVault.Application.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(Stream fileStream, string originalFileName, string folderName = "misc", CancellationToken cancellationToken = default);
    string GetPhysicalPath(string fileUrl);
    Task DeleteFileAsync(string fileUrl, CancellationToken cancellationToken);
}
