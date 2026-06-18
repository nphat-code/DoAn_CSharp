using FluentAssertions;
using Moq;
using TuneVault.Application.Features.Follow.Commands.FollowUser;
using TuneVault.Application.Interfaces;

namespace TuneVault.UnitTests.Features.Follow;

public class FollowUserCommandHandlerTests
{
    private readonly Mock<IFollowRepository> _followRepositoryMock;
    private readonly FollowUserCommandHandler _handler;

    public FollowUserCommandHandlerTests()
    {
        // 1. Arrange: Khởi tạo dữ liệu giả và các Mock (đồ giả)
        _followRepositoryMock = new Mock<IFollowRepository>();
        _handler = new FollowUserCommandHandler(_followRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnTrue_WhenRepositoryReturnsTrue()
    {
        // 1. Arrange: Chuẩn bị đầu vào
        var followerId = Guid.NewGuid();
        var followingId = Guid.NewGuid();
        var command = new FollowUserCommand(followerId, followingId);

        // Giả lập (Mock) hành vi của Database: 
        // Khi hàm FollowUserAsync được gọi với 2 ID này, bắt buộc trả về true.
        _followRepositoryMock
            .Setup(x => x.FollowUserAsync(followerId, followingId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // 2. Act: Thực thi hàm cần test
        var result = await _handler.Handle(command, CancellationToken.None);

        // 3. Assert: Kiểm tra kết quả
        // - Kết quả trả về phải là true
        result.Should().BeTrue();
        
        // - Hàm FollowUserAsync trong DB bắt buộc phải được gọi ĐÚNG 1 LẦN
        _followRepositoryMock.Verify(
            x => x.FollowUserAsync(followerId, followingId, It.IsAny<CancellationToken>()), 
            Times.Once);
    }
}
