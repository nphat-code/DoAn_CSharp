using FluentAssertions;
using Moq;
using TuneVault.Application.Features.Playlists.Commands.CreatePlaylist;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.UnitTests.Features.Playlists;

public class CreatePlaylistCommandHandlerTests
{
    private readonly Mock<IPlaylistRepository> _playlistRepositoryMock;
    private readonly CreatePlaylistCommandHandler _handler;

    public CreatePlaylistCommandHandlerTests()
    {
        _playlistRepositoryMock = new Mock<IPlaylistRepository>();
        _handler = new CreatePlaylistCommandHandler(_playlistRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldCreatePlaylistAndReturnDto_WhenCommandIsValid()
    {
        var command = new CreatePlaylistCommand(
            Guid.NewGuid(),
            "My Favorite Songs",
            "A collection of my favorite songs",
            true
        );

        _playlistRepositoryMock.Setup(repo => repo.AddAsync(It.IsAny<Playlist>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result.Name.Should().Be("My Favorite Songs");
        result.Description.Should().Be("A collection of my favorite songs");
        result.IsPublic.Should().BeTrue();
        result.UserProfileId.Should().Be(command.UserId);

        _playlistRepositoryMock.Verify(repo => repo.AddAsync(
            It.Is<Playlist>(p => p.Name == "My Favorite Songs" && p.IsPublic == true),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
