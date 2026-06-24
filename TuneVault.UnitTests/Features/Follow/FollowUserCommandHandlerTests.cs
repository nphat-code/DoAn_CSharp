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
    private readonly FollowUserCommandHandler _handler;

    public FollowUserCommandHandlerTests()
    {
        _followRepositoryMock = new Mock<IFollowRepository>();
        _userRepositoryMock = new Mock<IUserRepository>();
        _notificationServiceMock = new Mock<INotificationService>();
        
        _handler = new FollowUserCommandHandler(
            _followRepositoryMock.Object,
            _userRepositoryMock.Object,
            _notificationServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnTrue_AndSendNotification_WhenRepositoryReturnsTrue()
    {
        // 1. Arrange: Chuẩn bị đầu vào
        var followerId = Guid.NewGuid();
        var followingId = Guid.NewGuid();
        var command = new FollowUserCommand(followerId, followingId);

        _followRepositoryMock
            .Setup(x => x.FollowUserAsync(followerId, followingId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _userRepositoryMock
            .Setup(x => x.GetByIdAsync(followerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UserProfile { Id = followerId, Username = "TestUser", Email = "test@test.com", PasswordHash = "hash" });

        // 2. Act: Thực thi hàm cần test
        var result = await _handler.Handle(command, CancellationToken.None);

        // 3. Assert: Kiểm tra kết quả
        result.Should().BeTrue();
        
        _followRepositoryMock.Verify(
            x => x.FollowUserAsync(followerId, followingId, It.IsAny<CancellationToken>()), 
            Times.Once);

        _notificationServiceMock.Verify(
            x => x.SendNotificationToUserAsync(
                followingId, 
                "TestUser đã bắt đầu theo dõi bạn", 
                "Follow", 
                It.IsAny<CancellationToken>()),
            Times.Once);
    }
}
