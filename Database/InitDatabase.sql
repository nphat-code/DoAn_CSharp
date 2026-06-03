-- TẠO CƠ SỞ DỮ LIỆU TUNEVAULT (SQL SERVER)
-- Lưu ý: Thực thi trên Database TuneVaultDb

-- 1. Bảng UserProfile
CREATE TABLE UserProfiles (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    AvatarUrl NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- 2. Bảng Artist
CREATE TABLE Artists (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(150) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- 3. Bảng Album
CREATE TABLE Albums (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Title NVARCHAR(200) NOT NULL,
    ArtistId UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Albums_Artists FOREIGN KEY (ArtistId) REFERENCES Artists(Id) ON DELETE NO ACTION
);

-- 4. Bảng MediaItem
CREATE TABLE MediaItems (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000) NULL,
    FileUrl NVARCHAR(500) NOT NULL,
    MediaType NVARCHAR(50) NOT NULL,
    Duration TIME NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UploaderId UNIQUEIDENTIFIER NOT NULL,
    AlbumId UNIQUEIDENTIFIER NULL,
    ArtistId UNIQUEIDENTIFIER NULL,
    CONSTRAINT FK_MediaItems_Uploader FOREIGN KEY (UploaderId) REFERENCES UserProfiles(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_MediaItems_Albums FOREIGN KEY (AlbumId) REFERENCES Albums(Id) ON DELETE CASCADE,
    CONSTRAINT FK_MediaItems_Artists FOREIGN KEY (ArtistId) REFERENCES Artists(Id) ON DELETE NO ACTION
);

-- 5. Bảng Playlist
CREATE TABLE Playlists (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Title NVARCHAR(200) NOT NULL,
    UserProfileId UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Playlists_UserProfiles FOREIGN KEY (UserProfileId) REFERENCES UserProfiles(Id) ON DELETE CASCADE
);

-- 6. Bảng PlaylistTrack (N-N)
CREATE TABLE PlaylistTracks (
    PlaylistId UNIQUEIDENTIFIER NOT NULL,
    MediaItemId UNIQUEIDENTIFIER NOT NULL,
    AddedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    PRIMARY KEY (PlaylistId, MediaItemId),
    CONSTRAINT FK_PlaylistTracks_Playlists FOREIGN KEY (PlaylistId) REFERENCES Playlists(Id) ON DELETE CASCADE,
    CONSTRAINT FK_PlaylistTracks_MediaItems FOREIGN KEY (MediaItemId) REFERENCES MediaItems(Id) ON DELETE CASCADE
);

-- 7. Bảng MediaShare
CREATE TABLE MediaShares (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SenderId UNIQUEIDENTIFIER NOT NULL,
    ReceiverId UNIQUEIDENTIFIER NOT NULL,
    MediaItemId UNIQUEIDENTIFIER NOT NULL,
    Message NVARCHAR(500) NULL,
    SharedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_MediaShares_Sender FOREIGN KEY (SenderId) REFERENCES UserProfiles(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_MediaShares_Receiver FOREIGN KEY (ReceiverId) REFERENCES UserProfiles(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_MediaShares_MediaItems FOREIGN KEY (MediaItemId) REFERENCES MediaItems(Id) ON DELETE CASCADE
);

-- 8. Bảng Notification
CREATE TABLE Notifications (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserProfileId UNIQUEIDENTIFIER NOT NULL,
    Message NVARCHAR(500) NOT NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Notifications_UserProfiles FOREIGN KEY (UserProfileId) REFERENCES UserProfiles(Id) ON DELETE CASCADE
);

-- 9. Bảng Favorite (N-N)
CREATE TABLE Favorites (
    UserProfileId UNIQUEIDENTIFIER NOT NULL,
    MediaItemId UNIQUEIDENTIFIER NOT NULL,
    FavoritedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    PRIMARY KEY (UserProfileId, MediaItemId),
    CONSTRAINT FK_Favorites_UserProfiles FOREIGN KEY (UserProfileId) REFERENCES UserProfiles(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Favorites_MediaItems FOREIGN KEY (MediaItemId) REFERENCES MediaItems(Id) ON DELETE CASCADE
);

-- 10. Bảng PlayHistory
CREATE TABLE PlayHistories (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserProfileId UNIQUEIDENTIFIER NOT NULL,
    MediaItemId UNIQUEIDENTIFIER NOT NULL,
    PlayedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_PlayHistories_UserProfiles FOREIGN KEY (UserProfileId) REFERENCES UserProfiles(Id) ON DELETE CASCADE,
    CONSTRAINT FK_PlayHistories_MediaItems FOREIGN KEY (MediaItemId) REFERENCES MediaItems(Id) ON DELETE CASCADE
);

-- 11. Bảng Follow (N-N)
CREATE TABLE Follows (
    FollowerId UNIQUEIDENTIFIER NOT NULL,
    FolloweeId UNIQUEIDENTIFIER NOT NULL,
    FollowedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    PRIMARY KEY (FollowerId, FolloweeId),
    CONSTRAINT FK_Follows_Follower FOREIGN KEY (FollowerId) REFERENCES UserProfiles(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Follows_Followee FOREIGN KEY (FolloweeId) REFERENCES UserProfiles(Id) ON DELETE NO ACTION
    Id UUID PRIMARY KEY,
    UserId UUID NOT NULL REFERENCES UserProfiles(Id) ON DELETE CASCADE,
    Message TEXT NOT NULL,
    Type VARCHAR(50) NOT NULL,
    IsRead BOOLEAN NOT NULL DEFAULT FALSE,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ListeningHistory (
    Id UUID PRIMARY KEY,
    UserId UUID NOT NULL REFERENCES UserProfiles(Id) ON DELETE CASCADE,
    MediaItemId UUID NOT NULL REFERENCES MediaItems(Id) ON DELETE CASCADE,
    ListenedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- DỮ LIỆU MẪU DÀNH CHO POSTGRESQL

INSERT INTO UserProfiles (Id, Username, Email, PasswordHash)
VALUES 
-- User 1: john_doe | Mật khẩu là: 123456
('3fa85f64-5717-4562-b3fc-2c963f66afa6', 'john_doe', 'john@example.com', '$2y$10$tZ2.9P/g450J/j7U8XqQ8eX/p3m5Hk30o9.G27T.L0QZ0H5jP2HqG'),
-- User 2: jane_smith | Mật khẩu là: 123456
('7f81a7b4-1025-47eb-ba69-6d5df8f57291', 'jane_smith', 'jane@example.com', '$2y$10$tZ2.9P/g450J/j7U8XqQ8eX/p3m5Hk30o9.G27T.L0QZ0H5jP2HqG');

DECLARE @Media1Id UNIQUEIDENTIFIER = NEWID();
DECLARE @Media2Id UNIQUEIDENTIFIER = NEWID();

INSERT INTO MediaItems (Id, Title, Description, FileUrl, MediaType, Duration, UploaderId, AlbumId, ArtistId)
VALUES 
(@Media1Id, 'Blinding Lights', 'Synth-pop hit', '/media/blinding_lights.mp3', 'Audio', '00:03:20', @User1Id, @Album1Id, @Artist1Id),
(@Media2Id, 'Save Your Tears', 'Another hit', '/media/save_your_tears.mp3', 'Audio', '00:03:35', @User1Id, @Album1Id, @Artist1Id),
(NEWID(), 'In Your Eyes', NULL, '/media/in_your_eyes.mp3', 'Audio', '00:03:57', @User1Id, @Album1Id, @Artist1Id),
(NEWID(), 'Heartless', NULL, '/media/heartless.mp3', 'Audio', '00:03:18', @User1Id, @Album1Id, @Artist1Id),
(NEWID(), 'Snowchild', NULL, '/media/snowchild.mp3', 'Audio', '00:04:07', @User2Id, @Album1Id, @Artist1Id),
(NEWID(), 'Escape From LA', NULL, '/media/escape.mp3', 'Audio', '00:05:55', @User2Id, @Album1Id, @Artist1Id),
(NEWID(), 'Faith', NULL, '/media/faith.mp3', 'Audio', '00:04:43', @User1Id, @Album1Id, @Artist1Id),
(NEWID(), 'Too Late', NULL, '/media/too_late.mp3', 'Audio', '00:03:59', @User1Id, @Album1Id, @Artist1Id),
(NEWID(), 'Hardest To Love', NULL, '/media/hardest_to_love.mp3', 'Audio', '00:03:31', @User1Id, @Album1Id, @Artist1Id),
(NEWID(), 'Scared To Live', NULL, '/media/scared_to_live.mp3', 'Audio', '00:03:11', @User1Id, @Album1Id, @Artist1Id);

-- Tạo 2 Playlists
DECLARE @Playlist1Id UNIQUEIDENTIFIER = NEWID();
DECLARE @Playlist2Id UNIQUEIDENTIFIER = NEWID();

INSERT INTO Playlists (Id, Title, UserProfileId)
VALUES 
(@Playlist1Id, 'My Favorite Synthwave', @User1Id),
(@Playlist2Id, 'Workout Mix', @User2Id);

-- Thêm bài hát vào playlist
INSERT INTO PlaylistTracks (PlaylistId, MediaItemId)
VALUES 
(@Playlist1Id, @Media1Id),
(@Playlist1Id, @Media2Id),
(@Playlist2Id, @Media1Id);
