using FluentAssertions;
using Moq;
using TuneVault.Application.Features.Share.Commands.ShareMedia;
using TuneVault.Application.Interfaces;

namespace TuneVault.UnitTests.Features.Share;

public class ShareMediaCommandHandlerTests
{
    private readonly Mock<IShareRepository> _shareRepositoryMock;
    private readonly Mock<INotificationService> _notificationServiceMock;
    private readonly ShareMediaCommandHandler _handler;

    public ShareMediaCommandHandlerTests()
    {
        _shareRepositoryMock = new Mock<IShareRepository>();
        _notificationServiceMock = new Mock<INotificationService>();
        _handler = new ShareMediaCommandHandler(
            _shareRepositoryMock.Object,
            _notificationServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnTrue_AndSendNotification_WhenShareIsSuccessful()
    {
        // Arrange
        var command = new ShareMediaCommand(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), "Nghe thử bài này nhé!");

        _shareRepositoryMock.Setup(repo => repo.ShareMediaAsync(
            command.SenderId,
            command.ReceiverId,
            command.MediaId,
            command.Message,
            It.IsAny<Guid>(),
            It.IsAny<string>(),
            It.IsAny<DateTime>()))
            .ReturnsAsync(true);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeTrue();
        
        _notificationServiceMock.Verify(s => s.SendNotificationToUserAsync(
            command.ReceiverId,
            It.IsAny<Guid>(),
            It.Is<string>(msg => msg.Contains(command.Message)),
            "Share",
            It.IsAny<DateTime>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldReturnFalse_AndNotSendNotification_WhenShareFails()
    {
        // Arrange
        var command = new ShareMediaCommand(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), "");

        _shareRepositoryMock.Setup(repo => repo.ShareMediaAsync(
            command.SenderId,
            command.ReceiverId,
            command.MediaId,
            command.Message,
            It.IsAny<Guid>(),
            It.IsAny<string>(),
            It.IsAny<DateTime>()))
            .ReturnsAsync(false);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeFalse();
        
        _notificationServiceMock.Verify(s => s.SendNotificationToUserAsync(
            It.IsAny<Guid>(),
            It.IsAny<Guid>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<DateTime>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }
}
