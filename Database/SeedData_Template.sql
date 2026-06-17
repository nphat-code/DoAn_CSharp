-- ==============================================================================
-- KỊCH BẢN SEED DATA (ĐỘC LẬP, KHÔNG PHỤ THUỘC INIT)
-- ==============================================================================
-- Hướng dẫn:
-- 1. Chạy đoạn script này trong DBeaver/pgAdmin sau khi tạo bảng.
-- 2. Nó sẽ tạo 1 tài khoản Admin, 1 tài khoản User thường.
-- 3. Chỉ Admin (người có quyền) mới tải lên 10 Media Items.
-- 4. Tạo 2 playlist mẫu.
-- *Bạn có thể thay URL thật của máy bạn vào các trường FileUrl, CoverUrl*

DO $$
DECLARE
    -- Tạo trước các ID để dùng chung trong toàn bộ script
    admin_id UUID := gen_random_uuid();
    user_id UUID := gen_random_uuid();
    
    artist_id UUID := gen_random_uuid();
    album_id UUID := gen_random_uuid();

    playlist1_id UUID := gen_random_uuid();
    playlist2_id UUID := gen_random_uuid();

    media_ids UUID[] := ARRAY[
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
    ];
BEGIN

    -- ==========================================
    -- 1. TẠO 2 USER (1 ADMIN, 1 USER)
    -- ==========================================
    -- Mật khẩu mặc định đều là: 123456
    INSERT INTO UserProfiles (Id, Username, Email, PasswordHash, Role, CreatedAt)
    VALUES 
    (admin_id, 'admin', 'admin@gmail.com', '$2b$12$SlKMB2JBUTwt.jTBgNRUR.U6tFdoq1Nj1lrRPpLUROzPcfWUpM9rq', 'Admin', NOW()),
    (user_id, 'normal_user', 'user@gmail.com', '$2b$12$SlKMB2JBUTwt.jTBgNRUR.U6tFdoq1Nj1lrRPpLUROzPcfWUpM9rq', 'User', NOW());

    -- (Tùy chọn) Thêm 1 Nghệ sĩ & 1 Album để gán cho nhạc
    INSERT INTO Artists (Id, Name, AvatarUrl, Bio) VALUES (artist_id, 'Ed Sheeran', '/uploads/artists/Ed_Sheeran.jpg', $bio$Idiosyncratic pop singer Ed Sheeran borrows from any style that crosses his path, molding genres to fit a musical character all his own that's charming, personable, and popular on a global scale. Elements of folk, hip-hop, pop, dance, soul, and rock can be heard in his big hits "The A Team," "Sing," "Thinking Out Loud," and "Shape of You" -- which gives him a broad appeal among different demographics. It also helped elevate him to international acclaim not long after the release of his 2011 debut LP, +, and took 2014's x and 2017's ÷ to the top of both the U.K. albums chart and the Billboard 200. Sheeran maintained his stardom with savvy collaborations -- his 2019 album No. 6 Collaborations Project featured an eclectic roster including , , , , , and  -- and by continuing to write candidly about his life: his 2021 album = was filled with songs about being a new father. Sheeran's musical explorations continued on -, a 2023 album that featured several tracks co-written and co-produced by  of , and its swiftly released companion, Autumn Variations, both of which reached the Top Five in the U.K. and on the Billboard 200.

When Ed Sheeran released +, he had just turned 20. He had been playing music since he was a child in Framlingham, Suffolk -- he was born in Halifax, West Yorkshire but his family moved when he was young -- enthralled by the classic rock he heard around the house. Sheeran started writing music in his early teens, recording a self-made album called Spinning Man when he was 13 in 2004. In addition to making music at home -- he put out an EP titled The Orange Room in 2005 -- he'd busk on the streets and play whatever stage he could find. When he was 16, he dropped out of school and moved to London so he could make a go of a professional career, landing work as a guitar tech for Nizlopi, gigging whenever he could, and auditioning unsuccessfully for the ITV series Britannia High. The self-released EP You Need Me arrived in 2009 -- it followed 2006's eponymous EP and 2007's Want Some? -- but his momentum started to build in 2010 thanks to the EPs Loose Change and Songs I Wrote with Amy and, especially, performance videos he posted to YouTube. Sheeran started to generate considerable buzz --  invited him to appear on his Sirius/XM radio show -- and he landed a deal with  in late 2010. After a final independent EP, No. 5 Collaborations, arrived in January 2011, he signed a contract with 's management team.

All of this laid the groundwork for a busy 2011. Sheeran entered the studio with  to record his major-label debut. Its first single, "The A Team," arrived in June 2011, entering the charts at number three. August brought "You Need Me, I Don't Need You," setting the stage for the September release of +. Assisted by the success of November's single "Lego House," the record became a huge hit in the U.K., a fact underscored by his win of British Breakthrough in the 2012 Brit Awards. Sheeran's success soon spread to Australia, Europe, Canada, and then the United States. He received a boost in the U.S. by opening for  in 2012, but that paled in comparison to the exposure he received opening for  on her Red tour in 2013. His endorsement from , combined with his landing of the closing credits song "I See Fire" for The Hobbit: The Desolation of Smaug, set Sheeran up for an eventful 2014.

Along with reuniting with , Sheeran worked with  and  for X, the sophomore set that arrived in June 2014. X debuted at number one on both sides of the Atlantic and generated the huge hits "Thinking Out Loud" and "Sing," success that helped Sheeran secure a win for Album of the Year in the 2015 Brit Awards, along with the trophy for Best Male Solo Artist. His success wasn't limited to Britain. X was the second biggest-selling album in the world in 2015, coming in behind 's 25, and "Thinking Out Loud" took home the Grammys for Song of the Year and Best Pop Solo Performance in 2016.

Sheeran spent the majority of 2016 recuperating and recording his third album with executive producer . Early in 2017, he released two singles, "Castle on the Hill" and "Shape of You," with the latter reaching number one on the charts throughout the world. Their parent album, ÷, appeared in March. ÷ topped the pop charts in over 20 territories, including the U.K. and U.S., and it generated another international hit in "Galway Girl." Ed Sheeran's massive popularity was confirmed in June 2017, when he was awarded an MBE on the occasion of the Queen's Birthday Honours. Over the next year, Sheeran stayed busy touring. He also picked up several more accolades including winning the Grammy Award for Best Pop Vocal Album for ÷ and Best Pop Solo Performance for "Shape of You."

In 2019, he paired with  for the single "I Don't Care." It was the first of a series of duets which Sheeran collected on No. 6 Collaborations Project. The album appeared on July 12, 2019 and topped numerous charts just a few weeks after the release of Yesterday, a Danny Boyle film set in an alternate world where  never existed that featured Sheeran in a pivotal role. No. 6 Collaborations Project went on to be nominated for a Grammy in the Best Pop Vocal Album category. In December 2020, Sheeran offered up the acoustic non-album single, "Afterglow" as a Christmas gift to his fans.

Sheeran returned with "Bad Habits" in June 2021; the single topped the charts in nearly every country, save the U.S., where it peaked at two. The track was the first single from his fifth album, =. Arriving in October 2021, the record found Sheeran grappling with fatherhood and featured songwriting collaborations from , , and , among others. It continued Sheeran's streak of number one albums in the U.K. and was equally successful internationally. That December, he joined  for the holiday song "Merry Christmas," which topped the U.K. singles chart and Billboard's Adult Contemporary chart. The single was also included on a Christmas edition of =, as well as 's The Lockdown Sessions. Sheeran then collaborated with Colombian singer  on 2021's "Sigue" and 2022's "Forever My Love." Also in 2022, he scored a Top Ten U.K. hit with the Pokémon-related "Celestial" before kicking off 2023 with "F64," a heartfelt tribute to the late British music entrepreneur Jamal Edwards.

Sheeran launched the cycle for his fifth album in early 2023 with the release of the singles "Eyes Closed" and "Boat." Both songs were included on -, a record that featured several collaborations with  of , along with work by , Shellback, and . Four months afterward - debuted at number one in the U.K. and number two in the U.S. Sheeran released Autumn Variations, an album recorded with  as producer. The latter album also topped the charts in the U.K. and reached the Top Ten of the Billboard 200. By the end of the year, - had earned a Best Pop Vocal Album nomination at the 66th Grammy Awards. The singer's first-ever greatest-hits album, +-=÷× TOUR COLLECTION, arrived in September 2024 and combined live recordings with some of his most beloved studio hits. ~ Stephen Thomas Erlewine, Rovi$bio$);
    INSERT INTO Albums (Id, Title, ArtistId, CoverUrl) VALUES (album_id, '÷(Deluxe)', artist_id, '/uploads/covers/÷(Deluxe).jpg');


    -- ==========================================
    -- 2. TẠO 10 MEDIA ITEMS (5 AUDIO, 5 VIDEO)
    -- Đều do ADMIN upload
    -- ==========================================
    INSERT INTO MediaItems (Id, Title, Description, FileUrl, MediaType, Duration, CoverUrl, UploaderId, ArtistId, AlbumId, CreatedAt)
    VALUES 
    -- 5 BÀI AUDIO
    (media_ids[1], 'Eraser', 'Nhạc cực bốc', '/uploads/audio/Eraser.mp4', 'Audio', '03:47', '/uploads/covers/÷(Deluxe).jpg', admin_id, artist_id, album_id, NOW()),
    (media_ids[2], 'Dive', 'Nhạc chill', '/uploads/audio/Dive.mp4', 'Audio', '03:58', '/uploads/covers/÷(Deluxe).jpg', admin_id, artist_id, album_id, NOW()),
    (media_ids[3], 'New Man', 'Nhạc thất tình', '/uploads/audio/New_Man.mp4', 'Audio', '03:09', '/uploads/covers/÷(Deluxe).jpg', admin_id, artist_id, album_id, NOW()),
    (media_ids[4], 'Hearts Don''t Break Around Here', 'Nhạc quẩy', '/uploads/audio/Hearts_Dont_Break_Around_Here.mp4', 'Audio', '04:08', '/uploads/covers/÷(Deluxe).jpg', admin_id, artist_id, album_id, NOW()),
    (media_ids[5], 'What Do I Know', 'Vinahouse', '/uploads/audio/What_Do_I_Know.mp4', 'Audio', '03:57', '/uploads/covers/÷(Deluxe).jpg', admin_id, artist_id, album_id, NOW()),

    -- 5 BÀI VIDEO
    (media_ids[6], 'Castle On The Hill', 'MV Triệu view', '/uploads/video/Castle_On_The_Hill.mp4', 'Video', '04:48', '/uploads/covers/÷(Deluxe).jpg', admin_id, artist_id, NULL, NOW()),
    (media_ids[7], 'Shape of You', 'MV Đầu tư khủng', '/uploads/video/Shape_of_You.mp4', 'Video', '04:23', '/uploads/covers/÷(Deluxe).jpg', admin_id, artist_id, NULL, NOW()),
    (media_ids[8], 'Perfect', 'Hát live', '/uploads/video/Perfect.mp4', 'Video', '04:41', '/uploads/covers/÷(Deluxe).jpg', admin_id, artist_id, NULL, NOW()),
    (media_ids[9], 'Galway Girl', 'Behind the scene', '/uploads/video/Galway_Girl.mp4', 'Video', '03:19', '/uploads/covers/÷(Deluxe).jpg', admin_id, artist_id, NULL, NOW()),
    (media_ids[10], 'Happier', 'Nhảy cực cháy', '/uploads/video/Happier.mp4', 'Video', '03:35', '/uploads/covers/÷(Deluxe).jpg', admin_id, artist_id, NULL, NOW());


    -- ==========================================
    -- 3. TẠO 2 PLAYLIST VÀ THÊM NHẠC
    -- ==========================================
    INSERT INTO Playlists (Id, Title, Description, IsPublic, CreatorId, CreatedAt)
    VALUES 
    (playlist1_id, 'My Playlist', 'Nghe lúc chạy deadline', TRUE, admin_id, NOW()),
    (playlist2_id, 'My Playlist', 'Nghe là lên luôn', TRUE, user_id, NOW());

    -- Thêm 5 bài Audio vào Playlist 1 của Admin
    INSERT INTO PlaylistItems (PlaylistId, MediaItemId, AddedAt) VALUES 
    (playlist1_id, media_ids[1], NOW()),
    (playlist1_id, media_ids[2], NOW()),
    (playlist1_id, media_ids[3], NOW()),
    (playlist1_id, media_ids[4], NOW()),
    (playlist1_id, media_ids[5], NOW());

    -- Thêm 5 bài Video vào Playlist 2 của User
    INSERT INTO PlaylistItems (PlaylistId, MediaItemId, AddedAt) VALUES 
    (playlist2_id, media_ids[6], NOW()),
    (playlist2_id, media_ids[7], NOW()),
    (playlist2_id, media_ids[8], NOW()),
    (playlist2_id, media_ids[9], NOW()),
    (playlist2_id, media_ids[10], NOW());

END $$;
