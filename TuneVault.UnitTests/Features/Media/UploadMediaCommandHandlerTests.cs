using FluentAssertions;
using Moq;
using TuneVault.Application.Features.Media.Commands.UploadMedia;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;
using TuneVault.Application.Features.Media.DTOs;

namespace TuneVault.UnitTests.Features.Media;

public class UploadMediaCommandHandlerTests
{
    private readonly Mock<IMediaItemRepository> _mediaItemRepositoryMock;
    private readonly Mock<IArtistRepository> _artistRepositoryMock;
    private readonly Mock<IFileStorageService> _fileStorageServiceMock;
    private readonly UploadMediaCommandHandler _handler;

    public UploadMediaCommandHandlerTests()
    {
        _mediaItemRepositoryMock = new Mock<IMediaItemRepository>();
        _artistRepositoryMock = new Mock<IArtistRepository>();
        _fileStorageServiceMock = new Mock<IFileStorageService>();
        _handler = new UploadMediaCommandHandler(
            _mediaItemRepositoryMock.Object,
            _artistRepositoryMock.Object,
            _fileStorageServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldUploadFileAndSaveMediaItem_WhenCommandIsValid()
    {
        // Arrange
        var command = new UploadMediaCommand(
            Guid.NewGuid(),
            "My Song",
            "Sơn Tùng M-TP",
            new MemoryStream(new byte[10]),
            "song.mp3",
            "audio/mpeg",
            null,
            null,
            null,
            null
        );

        _fileStorageServiceMock.Setup(s => s.SaveFileAsync(
            It.IsAny<Stream>(), 
            It.IsAny<string>(), 
            "audio", 
            It.IsAny<CancellationToken>()))
            .ReturnsAsync("https://cloudinary.com/song.mp3");

        _artistRepositoryMock.Setup(r => r.GetByNameAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Artist { Id = Guid.NewGuid(), Name = "Sơn Tùng M-TP" });

        _mediaItemRepositoryMock.Setup(r => r.AddAsync(It.IsAny<MediaItem>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be("My Song");
        result.FileUrl.Should().Be("https://cloudinary.com/song.mp3");
        
        _fileStorageServiceMock.Verify(s => s.SaveFileAsync(It.IsAny<Stream>(), "song.mp3", "audio", It.IsAny<CancellationToken>()), Times.Once);
        _mediaItemRepositoryMock.Verify(r => r.AddAsync(It.Is<MediaItem>(m => m.Title == "My Song" && m.FileUrl == "https://cloudinary.com/song.mp3"), It.IsAny<CancellationToken>()), Times.Once);
    }
}
