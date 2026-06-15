namespace TuneVault.Application.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
}
