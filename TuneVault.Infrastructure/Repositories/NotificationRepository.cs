using System.Data;
using Dapper;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories;

public class NotificationRepository(IDbConnection dbConnection) : INotificationRepository
{
    public async Task<IEnumerable<Notification>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT * FROM Notifications 
            WHERE UserId = @UserId 
            ORDER BY CreatedAt DESC";

        var command = new CommandDefinition(sql, new { UserId = userId }, cancellationToken: cancellationToken);
        return await dbConnection.QueryAsync<Notification>(command);
    }

    public async Task MarkAsReadAsync(Guid notificationId, CancellationToken cancellationToken)
    {
        var sql = @"
            UPDATE Notifications 
            SET IsRead = true 
            WHERE Id = @Id";

        var command = new CommandDefinition(sql, new { Id = notificationId }, cancellationToken: cancellationToken);
        await dbConnection.ExecuteAsync(command);
    }

    public async Task MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken)
    {
        var sql = @"
            UPDATE Notifications 
            SET IsRead = true 
            WHERE UserId = @UserId AND IsRead = false";

        var command = new CommandDefinition(sql, new { UserId = userId }, cancellationToken: cancellationToken);
        await dbConnection.ExecuteAsync(command);
    }
}
