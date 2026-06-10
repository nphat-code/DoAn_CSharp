using System.Data;
using Dapper;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories;

public class PlaylistRepository(IDbConnection dbConnection) : IPlaylistRepository
{
    public async Task<Playlist?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var sql = "SELECT Id, Title as Name, Description, CoverUrl, IsPublic, CreatorId as UserProfileId, CreatedAt FROM Playlists WHERE Id = @Id";
        return await dbConnection.QuerySingleOrDefaultAsync<Playlist>(
            new CommandDefinition(sql, new { Id = id }, cancellationToken: cancellationToken));
    }

    public async Task<IEnumerable<Playlist>> GetUserPlaylistsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var sql = "SELECT Id, Title as Name, Description, CoverUrl, IsPublic, CreatorId as UserProfileId, CreatedAt FROM Playlists WHERE CreatorId = @UserId ORDER BY CreatedAt DESC";
        return await dbConnection.QueryAsync<Playlist>(
            new CommandDefinition(sql, new { UserId = userId }, cancellationToken: cancellationToken));
    }

    public async Task AddAsync(Playlist playlist, CancellationToken cancellationToken)
    {
        var sql = @"
            INSERT INTO Playlists (Id, Title, Description, CoverUrl, IsPublic, CreatedAt, CreatorId) 
            VALUES (@Id, @Name, @Description, @CoverUrl, @IsPublic, @CreatedAt, @UserProfileId)";
        await dbConnection.ExecuteAsync(
            new CommandDefinition(sql, playlist, cancellationToken: cancellationToken));
    }

    public async Task UpdateAsync(Playlist playlist, CancellationToken cancellationToken)
    {
        var sql = @"
            UPDATE Playlists 
            SET Title = @Name, Description = @Description, CoverUrl = @CoverUrl, IsPublic = @IsPublic
            WHERE Id = @Id";
        await dbConnection.ExecuteAsync(
            new CommandDefinition(sql, playlist, cancellationToken: cancellationToken));
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var sqlTracks = "DELETE FROM PlaylistItems WHERE PlaylistId = @Id";
        await dbConnection.ExecuteAsync(new CommandDefinition(sqlTracks, new { Id = id }, cancellationToken: cancellationToken));

        var sql = "DELETE FROM Playlists WHERE Id = @Id";
        await dbConnection.ExecuteAsync(new CommandDefinition(sql, new { Id = id }, cancellationToken: cancellationToken));
    }

    public async Task AddTrackAsync(PlaylistTrack playlistTrack, CancellationToken cancellationToken)
    {
        var sql = @"
            INSERT INTO PlaylistItems (PlaylistId, MediaItemId, AddedAt)
            VALUES (@PlaylistId, @MediaItemId, @AddedAt)";
        await dbConnection.ExecuteAsync(
            new CommandDefinition(sql, playlistTrack, cancellationToken: cancellationToken));
    }

    public async Task RemoveTrackAsync(Guid playlistId, Guid mediaItemId, CancellationToken cancellationToken)
    {
        var sql = "DELETE FROM PlaylistItems WHERE PlaylistId = @PlaylistId AND MediaItemId = @MediaItemId";
        await dbConnection.ExecuteAsync(
            new CommandDefinition(sql, new { PlaylistId = playlistId, MediaItemId = mediaItemId }, cancellationToken: cancellationToken));
    }

    public async Task<IEnumerable<MediaItem>> GetTracksByPlaylistIdAsync(Guid playlistId, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT m.*, ar.*, al.* 
            FROM MediaItems m
            INNER JOIN PlaylistItems pt ON m.Id = pt.MediaItemId
            LEFT JOIN Artists ar ON m.ArtistId = ar.Id
            LEFT JOIN Albums al ON m.AlbumId = al.Id
            WHERE pt.PlaylistId = @PlaylistId
            ORDER BY pt.AddedAt ASC";
            
        return await dbConnection.QueryAsync<MediaItem, Artist, Album, MediaItem>(
            new CommandDefinition(sql, new { PlaylistId = playlistId }, cancellationToken: cancellationToken),
            (mediaItem, artist, album) => 
            {
                if (artist != null) mediaItem.Artist = artist;
                if (album != null) mediaItem.Album = album;
                return mediaItem;
            },
            splitOn: "Id,Id"
        );
    }
}
