using FluentAssertions;
using Moq;
using TuneVault.Application.Features.Follow.Commands.FollowUser;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.UnitTests.Features.Follow;

public class FollowUserCommandHandlerTests
{
    private readonly Mock<IFollowRepository> _followRepositoryMock;
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<INotificationService> _notificationServiceMock;
    private readonly Mock<INotificationRepository> _notificationRepositoryMock;
    private readonly FollowUserCommandHandler _handler;

    public FollowUserCommandHandlerTests()
    {
        _followRepositoryMock = new Mock<IFollowRepository>();
        _userRepositoryMock = new Mock<IUserRepository>();
        _notificationServiceMock = new Mock<INotificationService>();
        _notificationRepositoryMock = new Mock<INotificationRepository>();
        _handler = new FollowUserCommandHandler(
            _followRepositoryMock.Object,
            _userRepositoryMock.Object,
            _notificationServiceMock.Object,
            _notificationRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnTrue_AndSendNotification_WhenFollowIsSuccessful()
    {
        // Arrange
        var command = new FollowUserCommand(Guid.NewGuid(), Guid.NewGuid());
        var follower = new UserProfile { Id = command.FollowerId, Username = "TestUser", Email = "test@test.com", PasswordHash = "hash" };

        _followRepositoryMock.Setup(repo => repo.FollowUserAsync(command.FollowerId, command.FollowingId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _userRepositoryMock.Setup(repo => repo.GetByIdAsync(command.FollowerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(follower);
        _notificationRepositoryMock.Setup(repo => repo.AddNotificationAsync(It.IsAny<Notification>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeTrue();
        _notificationServiceMock.Verify(s => s.SendNotificationToUserAsync(
            command.FollowingId, 
            It.IsAny<Guid>(),
            $"{follower.Username} đã bắt đầu theo dõi bạn", 
            "Follow", 
            It.IsAny<DateTime>(),
            It.IsAny<CancellationToken>()), Times.Once);
            
        _notificationRepositoryMock.Verify(r => r.AddNotificationAsync(
            It.Is<TuneVault.Domain.Entities.Notification>(n => n.UserId == command.FollowingId && n.Type == "Follow"), 
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
