using System.Data;
using Dapper;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories;

public class AlbumRepository(IDbConnection dbConnection) : IAlbumRepository
{
    public async Task<IEnumerable<Album>> GetAllAlbumsAsync(CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT a.*, ar.Id, ar.Name, ar.Bio, ar.AvatarUrl, ar.CreatedAt
            FROM Albums a
            LEFT JOIN Artists ar ON a.ArtistId = ar.Id
            ORDER BY a.ReleaseDate DESC";
        
        return await dbConnection.QueryAsync<Album, Artist, Album>(
            new CommandDefinition(sql, cancellationToken: cancellationToken),
            (album, artist) => 
            {
                album.Artist = artist;
                return album;
            },
            splitOn: "Id"
        );
    }

    public async Task<Album?> GetAlbumByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT a.*, ar.Id, ar.Name, ar.Bio, ar.AvatarUrl, ar.CreatedAt
            FROM Albums a
            LEFT JOIN Artists ar ON a.ArtistId = ar.Id
            WHERE a.Id = @Id";
            
        var albums = await dbConnection.QueryAsync<Album, Artist, Album>(
            new CommandDefinition(sql, new { Id = id }, cancellationToken: cancellationToken),
            (album, artist) => 
            {
                album.Artist = artist;
                return album;
            },
            splitOn: "Id"
        );
        return albums.FirstOrDefault();
    }

    public async Task<IEnumerable<MediaItem>> GetAlbumTracksAsync(Guid albumId, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT m.*, ar.Id, ar.Name, ar.Bio, ar.AvatarUrl, ar.CreatedAt
            FROM MediaItems m
            LEFT JOIN Artists ar ON m.ArtistId = ar.Id
            WHERE m.AlbumId = @AlbumId
            ORDER BY m.CreatedAt ASC";
            
        return await dbConnection.QueryAsync<MediaItem, Artist, MediaItem>(
            new CommandDefinition(sql, new { AlbumId = albumId }, cancellationToken: cancellationToken),
            (mediaItem, artist) => 
            {
                mediaItem.Artist = artist;
                return mediaItem;
            },
            splitOn: "Id"
        );
    }

    public async Task<Guid> AddAsync(Album album, CancellationToken cancellationToken)
    {
        var sql = @"
            INSERT INTO Albums (Id, Title, ArtistId, CoverUrl, ReleaseDate, CreatedAt)
            VALUES (@Id, @Title, @ArtistId, @CoverUrl, @ReleaseDate, @CreatedAt)";
            
        await dbConnection.ExecuteAsync(
            new CommandDefinition(sql, album, cancellationToken: cancellationToken)
        );
        return album.Id;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var sqlUpdate = "UPDATE MediaItems SET AlbumId = NULL WHERE AlbumId = @Id";
        await dbConnection.ExecuteAsync(
            new CommandDefinition(sqlUpdate, new { Id = id }, cancellationToken: cancellationToken)
        );

        var sqlDelete = "DELETE FROM Albums WHERE Id = @Id";
        await dbConnection.ExecuteAsync(
            new CommandDefinition(sqlDelete, new { Id = id }, cancellationToken: cancellationToken)
        );
    }
}
