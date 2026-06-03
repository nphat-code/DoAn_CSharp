using System.Data;
using Dapper;
using TuneVault.Application.Interfaces;

namespace TuneVault.Infrastructure.Repositories;

public class ShareRepository(IDbConnection dbConnection) : IShareRepository
{
    public async Task ShareMediaAsync(Guid senderId, Guid receiverId, Guid mediaId, string message, Guid notificationId, string notificationMessage, DateTime createdAt)
    {
        if (dbConnection.State == ConnectionState.Closed)
        {
            dbConnection.Open();
        }
        
        using var transaction = dbConnection.BeginTransaction();
        try
        {
            var shareSql = @"
                INSERT INTO MediaShares (Id, SenderId, ReceiverId, MediaItemId, Message, CreatedAt)
                VALUES (@Id, @SenderId, @ReceiverId, @MediaId, @Message, @CreatedAt)";

            await dbConnection.ExecuteAsync(shareSql, new {
                Id = Guid.NewGuid(),
                SenderId = senderId,
                ReceiverId = receiverId,
                MediaId = mediaId,
                Message = message,
                CreatedAt = createdAt
            }, transaction);

            var notifSql = @"
                INSERT INTO Notifications (Id, UserId, Message, Type, IsRead, CreatedAt)
                VALUES (@Id, @UserId, @Message, @Type, @IsRead, @CreatedAt)";

            await dbConnection.ExecuteAsync(notifSql, new {
                Id = notificationId,
                UserId = receiverId,
                Message = notificationMessage,
                Type = "Share",
                IsRead = false,
                CreatedAt = createdAt
            }, transaction);

            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }
}
