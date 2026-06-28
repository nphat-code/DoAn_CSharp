--
-- PostgreSQL database dump
--

\restrict dY53G7XNUdzOGTBhHCarWZvczT1hj0WbLWBB9G3aWmnIxRc7a8tjU7VBOsrmAwD

-- Dumped from database version 18.4 (eaf151e)
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
-- SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.userlikes DROP CONSTRAINT IF EXISTS userlikes_userid_fkey;
ALTER TABLE IF EXISTS ONLY public.userlikes DROP CONSTRAINT IF EXISTS userlikes_mediaitemid_fkey;
ALTER TABLE IF EXISTS ONLY public.userfollows DROP CONSTRAINT IF EXISTS userfollows_followingid_fkey;
ALTER TABLE IF EXISTS ONLY public.userfollows DROP CONSTRAINT IF EXISTS userfollows_followerid_fkey;
ALTER TABLE IF EXISTS ONLY public.playlists DROP CONSTRAINT IF EXISTS playlists_creatorid_fkey;
ALTER TABLE IF EXISTS ONLY public.playlistitems DROP CONSTRAINT IF EXISTS playlistitems_playlistid_fkey;
ALTER TABLE IF EXISTS ONLY public.playlistitems DROP CONSTRAINT IF EXISTS playlistitems_mediaitemid_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_userid_fkey;
ALTER TABLE IF EXISTS ONLY public.mediashares DROP CONSTRAINT IF EXISTS mediashares_senderid_fkey;
ALTER TABLE IF EXISTS ONLY public.mediashares DROP CONSTRAINT IF EXISTS mediashares_receiverid_fkey;
ALTER TABLE IF EXISTS ONLY public.mediashares DROP CONSTRAINT IF EXISTS mediashares_playlistid_fkey;
ALTER TABLE IF EXISTS ONLY public.mediashares DROP CONSTRAINT IF EXISTS mediashares_mediaitemid_fkey;
ALTER TABLE IF EXISTS ONLY public.mediashares DROP CONSTRAINT IF EXISTS mediashares_albumid_fkey;
ALTER TABLE IF EXISTS ONLY public.mediaitems DROP CONSTRAINT IF EXISTS mediaitems_uploaderid_fkey;
ALTER TABLE IF EXISTS ONLY public.mediaitems DROP CONSTRAINT IF EXISTS mediaitems_artistid_fkey;
ALTER TABLE IF EXISTS ONLY public.mediaitems DROP CONSTRAINT IF EXISTS mediaitems_albumid_fkey;
ALTER TABLE IF EXISTS ONLY public.listeninghistory DROP CONSTRAINT IF EXISTS listeninghistory_userid_fkey;
ALTER TABLE IF EXISTS ONLY public.listeninghistory DROP CONSTRAINT IF EXISTS listeninghistory_mediaitemid_fkey;
ALTER TABLE IF EXISTS ONLY public.artistfollows DROP CONSTRAINT IF EXISTS artistfollows_userid_fkey;
ALTER TABLE IF EXISTS ONLY public.artistfollows DROP CONSTRAINT IF EXISTS artistfollows_artistid_fkey;
ALTER TABLE IF EXISTS ONLY public.albums DROP CONSTRAINT IF EXISTS albums_artistid_fkey;
ALTER TABLE IF EXISTS ONLY public.userprofiles DROP CONSTRAINT IF EXISTS userprofiles_username_key;
ALTER TABLE IF EXISTS ONLY public.userprofiles DROP CONSTRAINT IF EXISTS userprofiles_pkey;
ALTER TABLE IF EXISTS ONLY public.userprofiles DROP CONSTRAINT IF EXISTS userprofiles_email_key;
ALTER TABLE IF EXISTS ONLY public.userlikes DROP CONSTRAINT IF EXISTS userlikes_pkey;
ALTER TABLE IF EXISTS ONLY public.userfollows DROP CONSTRAINT IF EXISTS userfollows_pkey;
ALTER TABLE IF EXISTS ONLY public.playlists DROP CONSTRAINT IF EXISTS playlists_pkey;
ALTER TABLE IF EXISTS ONLY public.playlistitems DROP CONSTRAINT IF EXISTS playlistitems_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.mediashares DROP CONSTRAINT IF EXISTS mediashares_pkey;
ALTER TABLE IF EXISTS ONLY public.mediaitems DROP CONSTRAINT IF EXISTS mediaitems_pkey;
ALTER TABLE IF EXISTS ONLY public.listeninghistory DROP CONSTRAINT IF EXISTS listeninghistory_pkey;
ALTER TABLE IF EXISTS ONLY public.artists DROP CONSTRAINT IF EXISTS artists_pkey;
ALTER TABLE IF EXISTS ONLY public.artistfollows DROP CONSTRAINT IF EXISTS artistfollows_pkey;
ALTER TABLE IF EXISTS ONLY public.albums DROP CONSTRAINT IF EXISTS albums_pkey;
DROP TABLE IF EXISTS public.userprofiles;
DROP TABLE IF EXISTS public.userlikes;
DROP TABLE IF EXISTS public.userfollows;
DROP TABLE IF EXISTS public.playlists;
DROP TABLE IF EXISTS public.playlistitems;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.mediashares;
DROP TABLE IF EXISTS public.mediaitems;
DROP TABLE IF EXISTS public.listeninghistory;
DROP TABLE IF EXISTS public.artists;
DROP TABLE IF EXISTS public.artistfollows;
DROP TABLE IF EXISTS public.albums;
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: albums; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.albums (
    id uuid NOT NULL,
    title character varying(100) NOT NULL,
    artistid uuid NOT NULL,
    coverurl character varying(255),
    releasedate timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: artistfollows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artistfollows (
    userid uuid NOT NULL,
    artistid uuid NOT NULL,
    followedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: artists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artists (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    bio text,
    avatarurl character varying(255),
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: listeninghistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.listeninghistory (
    id uuid NOT NULL,
    userid uuid NOT NULL,
    mediaitemid uuid NOT NULL,
    listenedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: mediaitems; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mediaitems (
    id uuid NOT NULL,
    title character varying(100) NOT NULL,
    description text,
    fileurl character varying(255) NOT NULL,
    mediatype character varying(20) NOT NULL,
    duration character varying(20) NOT NULL,
    coverurl character varying(255),
    uploaderid uuid NOT NULL,
    artistid uuid,
    albumid uuid,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedat timestamp without time zone
);


--
-- Name: mediashares; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mediashares (
    id uuid NOT NULL,
    senderid uuid NOT NULL,
    receiverid uuid NOT NULL,
    mediaitemid uuid,
    playlistid uuid,
    albumid uuid,
    message text,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid NOT NULL,
    userid uuid NOT NULL,
    message text NOT NULL,
    type character varying(50) NOT NULL,
    isread boolean DEFAULT false NOT NULL,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: playlistitems; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.playlistitems (
    playlistid uuid NOT NULL,
    mediaitemid uuid NOT NULL,
    addedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: playlists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.playlists (
    id uuid NOT NULL,
    title character varying(100) NOT NULL,
    description text,
    coverurl character varying(255),
    ispublic boolean DEFAULT false NOT NULL,
    creatorid uuid NOT NULL,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: userfollows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.userfollows (
    followerid uuid NOT NULL,
    followingid uuid NOT NULL,
    followedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: userlikes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.userlikes (
    userid uuid NOT NULL,
    mediaitemid uuid NOT NULL,
    likedat timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: userprofiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.userprofiles (
    id uuid NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    passwordhash character varying(255) NOT NULL,
    avatarurl character varying(255),
    bio character varying(1000),
    role character varying(50) DEFAULT 'User'::character varying NOT NULL,
    createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedat timestamp without time zone
);


--
-- Data for Name: albums; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.albums (id, title, artistid, coverurl, releasedate, createdat) VALUES ('84a81c40-7dba-42c9-b8f5-4291a35500ff', '÷ (Deluxe)', 'cf814b2c-b47f-4282-b800-321523ab0986', 'https://res.cloudinary.com/dc6avrrgt/image/upload/v1781779984/tunevault/covers/e3e51781-d2cb-4bf0-a69d-5ae5ebdfd0d9_Album_÷%28Deluxe%29.jpg', '2026-06-18 17:53:05.042671', '2026-06-18 17:53:05.042671');
INSERT INTO public.albums (id, title, artistid, coverurl, releasedate, createdat) VALUES ('4c638b5f-51ac-4420-9ba6-5cdeb0736e38', 'Lukas Graham', 'd8be19c8-ca05-4c88-87ed-602f020c9472', 'https://res.cloudinary.com/dc6avrrgt/image/upload/v1781780009/tunevault/covers/23daf73c-1012-4caf-996e-745a903c0ab2_Album_Lukas_Graham.jpg', '2026-06-18 17:53:29.406424', '2026-06-18 17:53:29.406425');
INSERT INTO public.albums (id, title, artistid, coverurl, releasedate, createdat) VALUES ('afd3cf2f-634b-4d38-94ec-3fbfad960aed', 'Nine Track Mind', 'bd749bf8-e04d-4cbf-b9b0-83919df943be', 'https://res.cloudinary.com/dc6avrrgt/image/upload/v1782131310/tunevault/covers/a0fe54ac-761e-4050-b06b-66f4f05edc86_Nine_Track_Mind.webp', '2026-06-22 12:28:31.19204', '2026-06-22 12:28:31.192055');


--
-- Data for Name: artistfollows; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.artistfollows (userid, artistid, followedat) VALUES ('cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'ab2e15e9-4fe1-43fc-a617-0344569c6e03', '2026-06-22 01:53:06.569741');
INSERT INTO public.artistfollows (userid, artistid, followedat) VALUES ('cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'd8be19c8-ca05-4c88-87ed-602f020c9472', '2026-06-23 06:52:42.669029');
INSERT INTO public.artistfollows (userid, artistid, followedat) VALUES ('31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'd8be19c8-ca05-4c88-87ed-602f020c9472', '2026-06-25 08:39:58.303237');
INSERT INTO public.artistfollows (userid, artistid, followedat) VALUES ('cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'bd749bf8-e04d-4cbf-b9b0-83919df943be', '2026-06-25 15:39:24.592504');


--
-- Data for Name: artists; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.artists (id, name, bio, avatarurl, createdat) VALUES ('cf814b2c-b47f-4282-b800-321523ab0986', 'Ed Sheeran', 'Idiosyncratic pop singer Ed Sheeran borrows from any style that crosses his path, molding genres to fit a musical character all his own that''s charming, personable, and popular on a global scale. Elements of folk, hip-hop, pop, dance, soul, and rock can be heard in his big hits "The A Team," "Sing," "Thinking Out Loud," and "Shape of You" -- which gives him a broad appeal among different demographics. It also helped elevate him to international acclaim not long after the release of his 2011 debut LP, +, and took 2014''s x and 2017''s ├╖ to the top of both the U.K. albums chart and the Billboard 200. Sheeran maintained his stardom with savvy collaborations -- his 2019 album No. 6 Collaborations Project featured an eclectic roster including , , , , , and  -- and by continuing to write candidly about his life: his 2021 album = was filled with songs about being a new father. Sheeran''s musical explorations continued on -, a 2023 album that featured several tracks co-written and co-produced by  of , and its swiftly released companion, Autumn Variations, both of which reached the Top Five in the U.K. and on the Billboard 200.



When Ed Sheeran released +, he had just turned 20. He had been playing music since he was a child in Framlingham, Suffolk -- he was born in Halifax, West Yorkshire but his family moved when he was young -- enthralled by the classic rock he heard around the house. Sheeran started writing music in his early teens, recording a self-made album called Spinning Man when he was 13 in 2004. In addition to making music at home -- he put out an EP titled The Orange Room in 2005 -- he''d busk on the streets and play whatever stage he could find. When he was 16, he dropped out of school and moved to London so he could make a go of a professional career, landing work as a guitar tech for Nizlopi, gigging whenever he could, and auditioning unsuccessfully for the ITV series Britannia High. The self-released EP You Need Me arrived in 2009 -- it followed 2006''s eponymous EP and 2007''s Want Some? -- but his momentum started to build in 2010 thanks to the EPs Loose Change and Songs I Wrote with Amy and, especially, performance videos he posted to YouTube. Sheeran started to generate considerable buzz --  invited him to appear on his Sirius/XM radio show -- and he landed a deal with  in late 2010. After a final independent EP, No. 5 Collaborations, arrived in January 2011, he signed a contract with ''s management team.



All of this laid the groundwork for a busy 2011. Sheeran entered the studio with  to record his major-label debut. Its first single, "The A Team," arrived in June 2011, entering the charts at number three. August brought "You Need Me, I Don''t Need You," setting the stage for the September release of +. Assisted by the success of November''s single "Lego House," the record became a huge hit in the U.K., a fact underscored by his win of British Breakthrough in the 2012 Brit Awards. Sheeran''s success soon spread to Australia, Europe, Canada, and then the United States. He received a boost in the U.S. by opening for  in 2012, but that paled in comparison to the exposure he received opening for  on her Red tour in 2013. His endorsement from , combined with his landing of the closing credits song "I See Fire" for The Hobbit: The Desolation of Smaug, set Sheeran up for an eventful 2014.



Along with reuniting with , Sheeran worked with  and  for X, the sophomore set that arrived in June 2014. X debuted at number one on both sides of the Atlantic and generated the huge hits "Thinking Out Loud" and "Sing," success that helped Sheeran secure a win for Album of the Year in the 2015 Brit Awards, along with the trophy for Best Male Solo Artist. His success wasn''t limited to Britain. X was the second biggest-selling album in the world in 2015, coming in behind ''s 25, and "Thinking Out Loud" took home the Grammys for Song of the Year and Best Pop Solo Performance in 2016.



Sheeran spent the majority of 2016 recuperating and recording his third album with executive producer . Early in 2017, he released two singles, "Castle on the Hill" and "Shape of You," with the latter reaching number one on the charts throughout the world. Their parent album, ├╖, appeared in March. ├╖ topped the pop charts in over 20 territories, including the U.K. and U.S., and it generated another international hit in "Galway Girl." Ed Sheeran''s massive popularity was confirmed in June 2017, when he was awarded an MBE on the occasion of the Queen''s Birthday Honours. Over the next year, Sheeran stayed busy touring. He also picked up several more accolades including winning the Grammy Award for Best Pop Vocal Album for ├╖ and Best Pop Solo Performance for "Shape of You."



In 2019, he paired with  for the single "I Don''t Care." It was the first of a series of duets which Sheeran collected on No. 6 Collaborations Project. The album appeared on July 12, 2019 and topped numerous charts just a few weeks after the release of Yesterday, a Danny Boyle film set in an alternate world where  never existed that featured Sheeran in a pivotal role. No. 6 Collaborations Project went on to be nominated for a Grammy in the Best Pop Vocal Album category. In December 2020, Sheeran offered up the acoustic non-album single, "Afterglow" as a Christmas gift to his fans.



Sheeran returned with "Bad Habits" in June 2021; the single topped the charts in nearly every country, save the U.S., where it peaked at two. The track was the first single from his fifth album, =. Arriving in October 2021, the record found Sheeran grappling with fatherhood and featured songwriting collaborations from , , and , among others. It continued Sheeran''s streak of number one albums in the U.K. and was equally successful internationally. That December, he joined  for the holiday song "Merry Christmas," which topped the U.K. singles chart and Billboard''s Adult Contemporary chart. The single was also included on a Christmas edition of =, as well as ''s The Lockdown Sessions. Sheeran then collaborated with Colombian singer  on 2021''s "Sigue" and 2022''s "Forever My Love." Also in 2022, he scored a Top Ten U.K. hit with the Pok├⌐mon-related "Celestial" before kicking off 2023 with "F64," a heartfelt tribute to the late British music entrepreneur Jamal Edwards.



Sheeran launched the cycle for his fifth album in early 2023 with the release of the singles "Eyes Closed" and "Boat." Both songs were included on -, a record that featured several collaborations with  of , along with work by , Shellback, and . Four months afterward - debuted at number one in the U.K. and number two in the U.S. Sheeran released Autumn Variations, an album recorded with  as producer. The latter album also topped the charts in the U.K. and reached the Top Ten of the Billboard 200. By the end of the year, - had earned a Best Pop Vocal Album nomination at the 66th Grammy Awards. The singer''s first-ever greatest-hits album, +-=├╖├ù TOUR COLLECTION, arrived in September 2024 and combined live recordings with some of his most beloved studio hits. ~ Stephen Thomas Erlewine, Rovi', 'https://res.cloudinary.com/dc6avrrgt/image/upload/v1781779445/tunevault/artists/5cffd376-80e6-419b-89a0-4fa43df569d6_Artist_Ed_Sheeran.jpg', '2026-06-18 17:44:07.054297');
INSERT INTO public.artists (id, name, bio, avatarurl, createdat) VALUES ('ab2e15e9-4fe1-43fc-a617-0344569c6e03', 'Sơn Tùng M-TP', 'Nguyễn Thanh Tùng, born in 1994, known professionally as Sơn Tùng M-TP, is a Vietnamese singer, songwriter, producer, and actor. He is not only known as one of the most successful Vietnamese artists and as the "Prince of V-pop", but also as the Chairman of three self-created companies: M-TP Entertainment, M-TP Talent and M-TP & Friends. He has received many achievements: a MTV Europe Music Award, an Mnet Asian Music Award, appeared on Forbes Vietnam''s 2018 30 Under 30 list, and is also the first Vietnamese musician to enter the Billboard Social 50. Up until now, he has already released a total of 25 songs, such as "C╞ín m╞░a ngang qua", "Em cß╗ºa ng├áy h├┤m qua", " ├ém thß║ºm b├¬n em", and many more. His single "Chß║íy ngay ─æi" was released with a music video featuring Thai actress Davika Hoorne, and with a collaboration with rapper Snoop Dogg, he went on and created the big hit "H├úy trao cho anh". After releasing "C├│ chß║»c y├¬u l├á ─æ├óy" in 2020, the song became the 3rd-most-streamed Youtube premiere at the time with 902,000 live viewers. As we all know, music is, without a doubt, the easiest way to connect people. For Sơn Tùng M-TP, music is everything he ever wanted to offer to the world around him with all his heart and soul.', 'https://res.cloudinary.com/dc6avrrgt/image/upload/v1781779615/tunevault/artists/714c85dc-f5a9-40e0-b80f-bcd30512b93f_Artist_Son_Tung_M-TP.jpg', '2026-06-18 17:46:56.337437');
INSERT INTO public.artists (id, name, bio, avatarurl, createdat) VALUES ('d8be19c8-ca05-4c88-87ed-602f020c9472', 'Lukas Graham', 'Thank you for listening. No audience, no show !', 'https://res.cloudinary.com/dc6avrrgt/image/upload/v1781779863/tunevault/artists/77071f78-85a9-4f69-b4e7-503ca3cdb585_Artist_Lukas_Graham.jpg', '2026-06-18 17:51:04.005253');
INSERT INTO public.artists (id, name, bio, avatarurl, createdat) VALUES ('bd749bf8-e04d-4cbf-b9b0-83919df943be', 'Charlie Puth', 'Charlie Puth has proven to be one of the industryΓÇÖs most consistent hitmakers and sought-after collaborators. Puth has amassed eight multi-platinum singles, four GRAMMY nominations, three Billboard Music Awards, a CriticΓÇÖs Choice Award, and a Golden Globe nomination. His 2018 GRAMMY-nominated LP, Voicenotes, was RIAA Certified Gold only four days after its release and has logged over 6.7 billion streams worldwide. Recently, Puth released his highly anticipated third studio album CHARLIE via Atlantic Records. Featuring hit singles ΓÇ£Left and Right [feat. Jung Kook of BTS], ΓÇ£ThatΓÇÖs HilariousΓÇ¥ and ΓÇ£Light Switch,ΓÇ¥ the ΓÇ£expertly crafted collectionΓÇ¥ (ROLLING STONE) has surpassed 2 billion global streams. Following the release of his CHARLIE, Puth set out for his ΓÇÿOne Night OnlyΓÇÖ tour, welcoming fans around the world up close and personal as he shares his latest album and his greatest hits. In 2020, PuthΓÇÖs collaboration with Gabby Barrett on their ΓÇ£I HopeΓÇ¥ Remix earned him his fourth top 10 track on the Billboard Hot 100, hit number one on the Billboard ΓÇ£Adult Pop SongsΓÇ¥ chart, and won a 2021 Billboard Music Award for ΓÇ£Top Collaboration.ΓÇ¥ Puth also co-wrote and produced The Kid Laroi and Justin BieberΓÇÖs record-breaking single, ΓÇ£Stay,ΓÇ¥ which quickly become one of the biggest songs of 2021 and holds the title for the longest-reigning No. 1 on the Billboard Global 200 chart and the first to lead it for double-digits - spending a total of eleven weeks at the top of the chart.', 'https://res.cloudinary.com/dc6avrrgt/image/upload/v1782130916/tunevault/artists/4af26607-ae32-4f23-ab81-0a75e6667f47_Charlie_Puth.webp', '2026-06-22 12:21:57.340882');
INSERT INTO public.artists (id, name, bio, avatarurl, createdat) VALUES ('18b97772-ce2f-4de6-a0ef-79e3dd5e11ca', 'Wiz Khalifa', 'Multi-platinum selling, GRAMMY┬« and Golden Globe nominated recording artist Wiz Khalifa burst onto the scene with the release of his first major label debut album, ROLLING PAPERSΓÇÄ in 2011. ΓÇÄROLLING PAPERS spawned the hugely successful hits ΓÇ£Black and Yellow,ΓÇ¥ ΓÇ£Roll Up,ΓÇ¥ and ΓÇ£No SleepΓÇ¥ and gave Wiz the platform to win the award for ΓÇ£Best New ArtistΓÇ¥ at the 2011 BET Awards and ΓÇ£Top New ArtistΓÇ¥ at the 2012 Billboard Music Awards. ΓÇ£Black and YellowΓÇ¥ also earned him his first two GRAMMY nods for ΓÇ£Best Rap PerformanceΓÇ¥ and ΓÇ£Best Rap SongΓÇ¥. As a follow up to ROLLING PAPERS, Wiz Released O.N.I.F.C. in 2012. This album featured tracks ΓÇ£Work Hard, Play HardΓÇ¥ and ΓÇ£Remember YouΓÇ¥ featuring The Weeknd. His third studio album released in 2014, BLACC HOLLYWOOD, ΓÇÄdebuted at #1 on BillboardΓÇÖs Top 200 album chart and included the hit single "We DemBoyz." Soon after, WizΓÇÖs track,ΓÇÄ ΓÇ£See You Again,ΓÇ¥ off the FURIOUS 7 soundtrack, catapulted to the top of the charts across 95 countries and earned him a Golden Globes nomination for ΓÇ£Best Original SongΓÇ¥. Wiz released his album, KHALIFA, in February 2016 as a thank you to fans which included the tracks ΓÇ£Bake SaleΓÇ¥ featuring Travis Scott and ΓÇ£Elevated.ΓÇ¥ Wiz released his project, The Saga of Wiz Khalifa, which was followed by his critically acclaimed collaborative album, FULL COURT PRESS, with Girl Talk, Big K.R.I.T., and Smoke DZA. In July 2022, Wiz released MULTIVERSE, to rave reviews. His newest album, KUSH + ORANGE JUICE 2 is out now.', 'https://res.cloudinary.com/dc6avrrgt/image/upload/v1782131652/tunevault/artists/1ae8133f-35d3-4cfc-916e-3ed0274a1c36_Wiz_Khalifa.webp', '2026-06-22 12:34:12.859539');
INSERT INTO public.artists (id, name, bio, avatarurl, createdat) VALUES ('4872bb27-7662-499e-9a76-5f7e8380fb49', 'Jack - J97', 'Trịnh Trần Phương Tuấn (born April 12, 1997), better known by his stage name Jack, is a Vietnamese pop singer, songwriter and rapper. He became famous when working in the group  and released the song . Throughout his career, he has received many awards: three awards at the Green Wave Awards and four awards at the Zing Music Awards. ΓÇ¿ In addition, he was awarded the "Best New Asian Artist of Vietnam" at the Mnet Asian Music Awards 2019 and Best Southeast Asian Act at the 2020 MTV Europe Music Awards. Jack is recognized the highly prestigious award: The 26th Golden Apricot Blossom Award (2020) for Most Favorite Light Music Male Singer. He is also the first Vietnamese artist to win an Asian Television Awards for Best Music Video Act (with ).', 'https://res.cloudinary.com/dc6avrrgt/image/upload/v1782299128/tunevault/artists/df7a0953-fd67-4410-a46f-9c4136579991_Artist_Jack_97.jpg', '2026-06-24 11:05:29.151014');


--
-- Data for Name: listeninghistory; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('14348d9f-943b-4aad-94a5-db590ce0fb56', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-18 17:44:37.750128');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('25bf746a-be22-44ed-ac73-e272bc7ab5aa', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-18 17:44:37.862591');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d8bb2ced-c81b-4e59-a64b-7039cc0a83e0', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-18 17:48:39.028044');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('52e8461a-c5f0-4dff-b44f-35418b6276b9', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-18 17:48:39.165059');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d0c303d1-34a9-4f0b-b74e-c25ca18d2677', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-18 17:51:49.682027');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e8b64d20-e57c-4f5b-af8c-5dac3f9edcd2', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-18 17:51:49.809628');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('24d29a98-cff0-43e6-85e0-4dba51df1d27', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-18 17:55:49.506407');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('62994321-5d26-4fcb-bd1a-2b559c9d9ba4', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-18 17:56:29.72809');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0d57be1f-830f-4012-8ac3-0a6b6b979994', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-18 17:56:37.096409');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('70a53e89-d1d7-4780-a919-610a94ad0f8d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-18 17:56:41.515212');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('aff85153-846e-4792-8834-e827c775e5f8', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-18 17:57:32.555666');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('593d2ff6-6f04-46df-b484-74677a15a44e', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-18 17:57:41.122341');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e2e07738-ddf5-4dd2-b1c6-cea10753236b', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-18 17:58:42.316928');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c5082d01-ee1f-4f27-9e69-362cda68a6c3', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-18 17:58:42.473623');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('03e627bd-2a68-41ef-871f-624065859bff', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-18 17:58:45.677431');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('322648cd-bffd-4b7d-9176-babf46ddff4d', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-18 17:58:45.858079');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('09b04e18-aff5-49b0-9d08-0e250484cc56', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-18 17:58:50.451963');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e00859f6-3889-4775-894a-567b052d0376', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-18 17:58:50.76741');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('51516c9e-2ad4-4406-b5dc-d5e9f43dd792', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-18 17:58:51.606358');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('1f55ea4a-34cf-4240-bc24-e4d6ab6fa58e', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-18 17:58:51.738416');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('cb04dc08-d445-428e-a562-6a0c5909167e', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-18 17:58:52.393964');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('45b0e01f-8560-4e82-aff6-355547706eff', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-18 17:58:52.513448');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ff232dcf-8b95-4b13-8d9d-13033d168d9a', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-18 17:58:53.062652');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('975c6cd2-042f-44e7-a7c8-99a8c0bbda80', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-18 17:58:53.22132');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('efbf9592-d2ef-41e9-8b04-2cae17694ce0', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-18 17:58:53.573947');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4260c9b8-5e75-4d68-8afd-5a5139f75aa7', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-18 17:58:53.741559');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('5460d26c-2310-469e-8081-b5d6d8214b19', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-18 17:58:54.785311');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('949cd6a8-14da-4b61-a148-7a8f37c2dff8', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-18 17:58:56.210662');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a2b21821-5585-4a57-ab47-f925e06f58fb', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-18 11:28:16.933358');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('37d4cf02-09f6-447e-9d3f-f73862df43be', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-18 11:28:21.846023');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('72b76bde-303d-4e9a-90af-3dca7e5b18de', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-18 11:33:05.484574');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('907dae3d-bbe6-41d6-949f-2b4943da13ad', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-18 11:37:07.317637');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('04487053-e63c-41f7-92f8-ec5560b2d968', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-18 11:41:31.815352');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('2bc804bc-a3b2-4e7d-b462-7edc1951aca9', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-18 11:46:16.4713');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c7e63036-7af8-489a-bc15-bfbb09663ef9', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-18 11:50:12.870796');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4cfb2b6d-1b81-4d50-bb14-8de03974e1b0', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-18 11:54:13.380885');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c6973ba2-455c-455c-b90b-c3c79c086491', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-18 11:55:00.398966');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('370cc8df-3112-44a9-9f07-ed03fdd63968', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-18 11:55:00.484209');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('348e90a2-0b83-4e6e-927a-71fc1a707ace', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-19 00:19:09.409613');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3a93a563-d3a7-426f-9641-1162212754bb', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-19 00:19:39.561372');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e0f38400-50bf-4cb7-a1d0-5402aa97046d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-19 00:19:40.071721');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b35d1614-b6eb-44fb-8566-e33f18c37c58', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-19 00:43:26.370913');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b7c33ee1-06dc-4526-8e20-315f46a37480', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-19 00:44:50.822736');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e16ef9ea-0c42-4775-abb5-12b020b963af', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-19 00:44:54.610283');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('7d13c909-9c5c-4b4b-bd13-08c0dab60f50', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-19 00:44:58.266599');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('acdd0eb9-566e-4234-b4d1-a95b4077792c', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-19 00:45:21.089342');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6c84568d-8c9d-4d45-a5a0-13eeb33da1fc', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-19 00:45:26.472643');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3c7754d1-ea0f-4164-802b-423e8c9ed649', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-19 00:46:11.375299');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('87b42c9d-8e92-4967-bbef-0f7eca0b65eb', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-19 00:48:47.08394');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('8a66363f-62bb-418d-9fb4-b1feda797786', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-19 00:48:47.314005');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a6657d62-0572-4dca-a8af-b7906c5226c1', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-19 00:48:53.302041');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('7c954836-2be9-44df-800f-18f149205ec9', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-19 00:48:55.814739');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4939771d-5883-448a-a56c-069c0dd66c1d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-19 01:24:14.12684');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a30ff169-3c4c-4c76-9c0b-38a7d9a5133f', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-19 01:51:30.415154');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('141f88b8-3583-49ce-865f-801f20dcbfbd', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-19 02:04:00.910065');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('bf82ff3c-8134-45ee-8e8b-a75d0da6a91d', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-19 02:09:36.038458');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('29fc75df-30a6-49ac-8117-bbd3d41c7474', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-19 02:11:07.356463');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('1e4fd6b7-eb1f-4a2b-98b0-0a02d1f6c584', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-19 02:11:37.981777');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6484695d-0674-40a0-b58c-0500b1a5f249', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-19 02:15:51.755472');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f358c104-3dd4-4743-9dbd-639051673f6e', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-19 02:16:23.44812');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('acec1a5c-1a79-42a3-a029-5632dd0ec0d6', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-19 02:16:22.829879');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('86eca05a-d46b-40de-b652-6bc30a7136ec', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-19 02:19:27.142307');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('afe45600-1a5f-4c96-937c-79545ab6a9f9', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-19 13:12:18.454086');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3eb0a05a-dee9-4eda-81b0-33a7c3824628', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-19 13:16:21.389217');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('db933a76-79d1-4276-98ed-ff75c92a745f', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-19 14:08:07.762169');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0278fc6f-2e88-415a-ba80-a44c30c5d767', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-19 14:15:46.924059');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('604d5cab-b283-4546-8055-83cbc8af4dbc', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-19 14:15:47.559639');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('484381fe-0262-4901-8923-69f2243b3215', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-19 14:18:38.065011');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('69e307d5-9689-4315-9d91-f1d371f9597d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-19 14:31:51.392982');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('7e73d650-a588-4913-a289-1b4ecf29a602', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-19 14:32:54.358658');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a7f3cb76-f9aa-407e-9b73-17a6ec6e44e3', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-19 14:32:58.074725');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('1b9c50fa-6e67-416b-8e36-fe124a87ca60', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-19 14:33:01.411811');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d60ee479-fd81-44d8-995c-78e8412d1e3b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-19 14:39:54.852529');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b8f32fe0-d832-4dac-b953-a79f6f9499bb', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-19 14:46:57.886898');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('7641f649-0702-4ee5-ba50-0a7db537943f', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-19 14:47:06.264423');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('9a5b5397-f520-49b5-b090-9fbefca99971', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-19 14:40:07.379005');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('52b9791c-3dcf-423e-b303-a9248475d638', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-19 14:40:09.250351');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('24ca3a2d-c5cc-4ce1-ac80-081fa499b5ac', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-19 14:40:10.711487');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('7c594e88-2829-4c7e-9ab7-2bec450ba53d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-19 14:46:22.824111');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('acea2c1b-22c6-462d-af55-b37f717172db', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-19 14:46:33.726082');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('47baf947-615e-4c79-b0b8-e722acceacfe', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-19 14:50:38.403107');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('237c7cd9-a8b7-4f26-bac8-ea897df5ac2b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-19 14:50:39.044127');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('5968cb7f-b09e-4df7-91cc-4f7511fc6d41', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-19 14:50:45.513437');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0e964822-fb15-4a03-a8e0-c599abb03e1f', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-19 14:53:45.034594');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6730a1e3-b15f-4b6f-b433-60ef408103f6', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-20 02:05:47.598464');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('020934b9-82c8-4b98-87c9-fa8634a46b9b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-20 02:15:33.592795');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d46c0fd0-6f77-4415-b8f2-b7b4dbd56acd', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-20 02:27:28.923938');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('cb115c91-4877-4df0-9b81-3392866a1f49', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-20 02:31:45.153384');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('98d067f2-eb26-4a13-bde1-233fabadda6d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-20 02:34:24.360315');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('99b3eddb-e270-4004-b366-1ac83128475e', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-20 02:41:24.689373');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b0aefe3b-3e46-4827-8309-11563068d881', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-20 02:42:42.936299');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('96437376-0025-4ee0-ad8a-cba769ddd342', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-20 02:46:34.909841');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3cf5766b-d277-4b41-a8ab-e3306324fea3', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-20 02:50:33.264765');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('214dcd3a-0834-4b73-9546-88d298652958', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-20 02:54:33.500609');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('eed6b40d-5d12-4a74-835c-17edae397f97', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-20 02:58:30.843746');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('1a4630fe-aeb9-4b4b-8b49-fabd36de4655', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-20 03:01:32.367619');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('da4e2423-c9c4-43d4-a4c0-90bd9d8a943a', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-20 03:01:35.052928');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4be3e0d5-e86f-42a4-bf3b-8036f6a3d918', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-20 03:01:35.973809');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('47beee58-e8eb-4ea8-9de6-a23fe07e8ead', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-20 03:06:24.160813');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6346fb12-94a9-4515-a456-cc08d45a6bfa', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-20 03:10:23.368522');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a7643d49-14eb-421d-88f4-305b4dc4f705', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-20 03:12:12.005542');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6f9fd257-b394-481b-a349-4be81d63977a', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-20 03:12:14.804062');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('774e307d-3aa2-48a3-ae71-458b68f6c922', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-20 03:12:15.603498');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('52cd9071-8a03-4a0b-89f4-ab5ed458ce29', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-20 06:17:31.146481');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('72b4a025-d53d-41c3-867f-bc297a597c82', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-20 06:21:09.154419');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ba0a4117-7563-441e-a9a4-db3396c44314', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-20 06:21:09.321751');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('de66a49d-3d93-4b72-b260-be9e61ca82fe', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-20 06:23:26.969353');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a2d31471-797b-4160-89e1-47911b122261', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-20 06:23:49.941986');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ab01401d-7f1b-4257-9b65-26b559ca5184', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-20 06:23:52.606439');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d8fca417-0e67-44d8-bbd2-a9b43b651cfe', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-20 06:23:52.731137');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ace8bd14-bd03-4ab5-ae74-304da298248c', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-20 06:31:17.501191');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('11c243f3-eeb5-451b-948f-ea0af28be455', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-20 06:31:24.149927');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f70f9473-70c7-4ab3-8a61-7019624e4115', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-20 06:31:29.036222');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b1de22df-e5ba-46b3-a7b0-8334bd27344f', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-20 06:31:46.969221');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('886f92c4-4280-423c-a0f3-7bd7236e27ac', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-20 06:38:57.104625');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('25b56f23-4907-429f-be51-d9e79ace3c30', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-20 06:40:44.440986');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f1a3a650-2922-4788-a8ce-dbeb8b21e59f', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-20 06:40:49.591988');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('90244a60-5d14-4d2d-81b5-509ef410f5c6', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-21 02:10:52.239921');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d92510bb-d08d-440c-b2a1-883640feb938', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 02:19:20.462125');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('21546bbe-f108-4559-b323-2fc5cd363167', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-21 02:22:20.972624');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b84ef61d-2db5-4038-912a-362196db07bf', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-21 02:26:19.525635');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f457b290-0a79-4978-8080-ab02dc0684fe', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-21 02:34:48.095164');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a923364d-68b3-4076-ab07-34647f53d536', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 02:35:34.995703');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ed9c6ac1-026d-407a-8393-0746ef4c2542', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 02:35:35.643905');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f23d460c-01c7-4f80-8f10-278461ba38b8', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 02:39:15.327299');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('64d6251f-9f46-4af6-9241-a6b55b7d8ff0', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-21 02:39:32.249012');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('26ecb00a-57a4-4db7-a281-0860618f3951', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-21 03:01:26.078472');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('91d6d8d3-7797-4f46-8959-cd58fe55deff', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 03:01:47.337338');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('cfb8809a-833c-463a-9d85-116fb43e3e28', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 03:01:55.666733');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('9efb971f-5145-4754-a61f-3e4dd37b68b7', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 03:05:57.019282');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('07ee3a02-2b5d-4a67-9cf3-b47b57ec9ccf', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-21 03:06:12.331819');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e0555d5f-0799-4fc1-954d-c594c76ca881', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 03:06:53.336872');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e996d71b-bcb7-42d1-9edf-3e77cb2e59fc', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 03:07:00.18157');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('7ac03073-e5e2-4b7b-85c1-910747a51d64', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 03:13:12.966596');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0a00f317-6c55-4ed3-b484-cb2f7d7b8f1b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 03:14:08.205757');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('63fb47d1-85b4-4655-8b93-2391e3a71fc0', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 03:42:32.317305');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0197e69a-2736-4560-beec-54c32dfb4cf5', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 04:36:33.215347');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c0d12db2-2597-4047-9175-bad6826d2371', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 04:42:33.917408');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('fcb61790-954b-4cde-b6c8-7594ae42b659', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 04:43:28.715007');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('774e9ed8-da43-4f5f-b2e2-5670bb432fc5', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 04:56:11.486446');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('7212b96d-df63-4c1e-9c23-cdcc333af7c3', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 14:40:23.080228');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('dd734317-2df8-4ebe-8123-776a212d8793', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 14:40:28.213755');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ecea6b3a-17d0-4761-bcff-b2cc8db74920', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 14:40:30.991242');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('80d9fa29-104e-4ca4-8bd1-cae2c1d3d3c7', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 14:40:32.911281');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('bde84d30-8ba4-4b40-b79b-506d51b48338', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 14:44:29.953604');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('cdc3cb92-5ed0-4774-8dc8-d27b78ddd4e5', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 14:44:31.196688');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4c3bfa98-5dfa-4709-a01c-da27aac84809', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 14:44:32.717198');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('843b4d4a-0a08-4cf7-9f0b-d70b8ef2e89f', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 14:44:34.3168');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('91090695-f53d-4717-8f7f-731025edb8d2', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 14:44:42.580694');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('8b8d396c-b701-4cf9-80a1-70c2efb89070', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 14:44:50.699033');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a554e75e-58d2-4aa2-b311-9d4e67aa0c5e', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 14:44:55.562759');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('31af8dc4-9117-4db7-89f3-ccd9debcaad3', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 14:44:55.914062');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c58f3581-bc9b-414f-a1eb-fbbf1a9a9448', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 14:45:01.733179');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('58a40a3b-c3bf-4045-a25b-7f1550bd0e80', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 14:52:51.945316');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('88c8d7f4-a1f9-408b-a2b2-ace16403a752', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-21 14:52:55.542695');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f1cda6ac-1831-48fd-ac72-367350b68a64', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 14:52:56.425049');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a2cff812-4e43-4aae-a245-5b30010d5562', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-21 14:52:57.642024');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('5c2afa60-88b7-487c-bf4a-48b63d2230e5', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-21 14:53:00.223167');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('23c1c81e-e02a-4e35-9dc6-8ef5b8070c0c', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 14:53:00.880536');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a6532e7a-bff0-42d6-9e4d-41211faf7c3c', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-21 14:53:02.663936');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3ef05914-3992-4e0f-a6ff-81b555dec444', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 14:53:06.046499');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c31125fe-2fc6-4326-a0a2-ab8b1746f9f3', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 14:53:09.128585');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('960eb91c-6626-4583-b383-18d823b8fda1', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 14:53:14.242152');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d6fd65ed-b371-423f-acee-4a2f97d7454e', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 14:54:23.812542');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('88c8621a-ce90-4fbc-8c5d-bc706ac78e02', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 14:54:25.363953');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f3235c83-f873-49ea-914a-49b23a162cae', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 14:54:26.545731');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('1df645db-8161-4996-bdab-603fcfe28ac1', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 14:54:29.694381');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('dedce6ca-4164-4fb7-8dd7-d9e8d014e5b4', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 15:01:34.111627');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c218d03c-c749-40e0-88c1-211db2303d2b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 15:01:52.01835');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d4a8525f-942d-470f-941f-ca51e909c022', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 15:07:12.699113');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('39ce6455-1308-4277-be3b-56dee267fbe6', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-21 15:07:19.065317');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('1d7edb5f-f53f-4785-a7cd-15f33e3e660b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 15:07:21.486329');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e496b1a4-8e7a-423c-91f0-3077e4768b75', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 15:08:57.066012');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('eecc9afb-bf62-47a3-a9aa-3c976126279d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-21 15:09:07.03088');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6f87e3f6-a865-4887-9002-75f47ca52288', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 15:16:23.170661');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b2c6c93d-d5f7-4ee1-99b3-03abe0a3cc78', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 15:16:35.859391');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0396de9e-614c-459c-88b1-e6310614d110', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 15:16:36.979365');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('328303f6-eaa2-4606-a51e-b725b901b86b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 15:16:39.402044');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('58cd3b5d-5997-470e-9177-7410b4740ed8', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 15:16:40.552237');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('aef75954-8f5e-4a28-9b22-0b09d03e07bf', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-21 15:17:50.622461');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('61bc593e-9905-4ca6-bdaa-951ac197a1ba', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 15:18:48.295607');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('5361e519-da20-4fe4-a4ce-83f45e22f140', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 15:24:18.664237');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e0163f94-1504-4c59-af30-d24b79103f9f', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 15:25:11.313877');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('90668634-26ad-463b-a755-62b248774b80', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-21 15:25:13.642954');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('eda3f5a4-2139-4ebc-aaf1-4b7755e0ba4a', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 15:25:14.855312');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('bde84580-f8f9-48d0-a09c-a8ed82df2345', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-21 15:25:15.455344');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b8a4bad8-3cf2-41e9-9373-7f9ed490b191', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-21 15:25:15.819911');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('cfedc630-176b-4433-9bb9-43e6e66633cd', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 15:25:17.045443');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('70ce8a0d-efb4-4f8f-918b-4479ff999366', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 15:32:24.083993');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('97512209-d7a1-4457-b9d0-9158eca20ebb', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 15:32:26.695207');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('da74dc9c-2de6-4c41-bb83-306b253916ba', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 16:08:12.285087');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('bc0a45f8-1199-48dc-b129-d9faf9376b95', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 16:08:17.178602');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6640301d-ca14-4939-a93c-c60bdd429ebf', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-21 16:08:55.407891');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('632ba0d0-f8da-48b6-b0d7-d79374bea737', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 16:08:59.986334');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0ac430be-9930-4000-b9ff-8ac52f9a9d79', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 16:09:48.790235');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('8b86d0c4-08f3-4547-84ca-8c1b300b36d6', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 16:10:06.085081');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('98f56ed5-a8fb-4d15-b4b0-2550868c3f50', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-21 16:10:12.25836');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('5c210d34-19b4-4dd2-8bdf-617b3363a3cb', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 16:10:13.723194');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('337a80ba-5517-499d-98f8-294e5131f0e0', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 16:10:40.356564');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('fb117101-f850-4583-af7b-7924751c26f7', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 16:10:43.087335');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('37c0f996-895d-401f-b6e4-a4303ebcfc7a', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 16:22:43.061066');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3ab0a102-7c13-4930-a104-f107b5fe8d80', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 16:22:46.16091');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('dc6cf16b-c366-43c5-ac51-a70b64ad40a6', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-21 16:22:48.734212');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b0b26afa-42c5-4ea2-a822-83de6342cb94', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-21 16:22:49.281488');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('22e451b9-e2d4-4b7b-9a06-2d1798f17ccb', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 16:22:50.319228');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('810c7043-ecfe-4e6d-ab90-b35efc3a3c61', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-21 16:22:50.933843');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('42c817bd-7deb-4246-9cce-425c7cf83ca4', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 16:22:54.914066');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('776f4fe9-e5b6-4d77-b924-f0b5194214c4', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-21 16:22:56.659384');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c00fc1dd-6281-45da-a88d-7c7855a5c177', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-21 16:23:09.023275');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4fd399ea-de6b-4d6c-ae6f-c57bf5644c70', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 16:23:14.838983');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('20cb1b99-db79-4e1e-b215-a04438ccd0b6', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 16:23:20.798454');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('716d9ed6-1ab0-4a4c-8fd2-9db9901d5686', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-21 16:23:22.029881');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('304f9520-e751-4424-8821-8edf1690a40d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 16:23:23.301781');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('cafc532d-ec23-4234-a8df-7bcc0467d2fa', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-21 16:23:23.854803');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('47bd5ea0-ec2d-43e0-ac68-7020f7e815d5', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 16:23:26.10194');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f4a15db9-40aa-48f2-8815-356661742d58', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-21 16:23:28.400795');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('75acac67-d75a-446c-b12a-3c2019dd669e', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 16:25:03.701622');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6c75854b-73c5-4406-bd4a-dfcfb3f4adab', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 16:25:03.767793');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('38761099-4197-4535-9210-1a2045a55457', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-21 16:25:04.015737');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ef674dee-da3a-4120-aadb-743115cc4115', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 16:25:04.203421');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('55a9f8ca-1666-490d-884d-9ff6df0fc101', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 16:25:08.060951');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4eb49847-1c59-4f35-8afb-e516809320b5', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 16:26:24.261219');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('2559080e-5b2c-4a65-87c1-1467652433aa', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-21 16:26:34.356602');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('eb2b5a7a-12d0-4c7b-b4cb-6c78cb416624', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-21 16:34:38.995524');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('9ee7bee5-8d56-4183-8db7-9fb0da7e56f2', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 16:40:04.418059');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0f0b53bd-8203-47ee-ae7a-69dbaecfd62d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 16:47:06.632794');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e55026a5-6d6b-4e5a-bfbb-7e80f2ea7098', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 16:48:16.400025');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e6336a7f-31fd-495f-bc0c-887b106e3965', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 16:48:31.77023');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b8c3d445-11a7-4e9e-9100-0c3ac3537cfb', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 16:48:47.972831');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('cd2e0cc8-64fa-4219-9c67-59737826b693', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 16:48:54.068412');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('fced2290-3d19-4f73-afa9-d49df0288014', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 16:55:10.326771');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f8e37148-0a75-4b01-a8c4-1e6ddebeedfd', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 16:56:23.888189');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('49c7b149-9f56-488f-93ba-685b10cc4ae0', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-21 17:03:49.097764');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f808650f-bfb7-412d-afa7-13980f9e296a', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-21 17:05:08.867563');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('8af106d2-10f6-4877-bffa-6a8d48aea0e1', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 17:15:37.586598');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('5e1e4529-777f-4af1-aed3-a1d8aa16aa3a', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 17:22:47.325445');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('28c570bc-1c6c-4f8c-8c4e-0e3c3377db0d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 17:23:20.086032');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('1a2dc230-605b-4185-adb8-7ca0b1ca648e', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 17:23:34.106217');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('1eaa2efc-1a36-45b2-ab7e-61eda8dbf53b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 17:24:01.1222');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c999ce1b-eb19-498b-9239-d85a37ff4827', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 17:24:18.260963');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3423e29d-e837-48ed-8ebe-3880d7cda4c8', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-21 17:33:12.39525');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('161aac60-577e-43f2-aec4-f083415f443d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-22 00:34:41.18565');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4193049e-4af4-4e5a-a880-51ae4775d1a5', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-22 00:38:40.124581');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c85b96e4-8f73-4f37-b213-238a5aada8f9', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-22 00:42:38.290945');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e48af555-6319-4158-8e3f-bbc597b19630', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-22 00:46:04.243107');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3c8267ef-060a-414f-9d36-34363ac75a4a', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-22 00:46:04.433767');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('2b9e4a40-33d9-4d9e-ba00-63fb451ef241', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 00:51:39.104132');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6dde34d2-2166-4813-9682-0507baf661b4', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 00:51:39.446806');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('56825333-9728-45a0-88f3-11065f514065', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-22 00:57:02.265248');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ebd65713-3818-445c-831f-085255b02c57', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-22 00:57:13.840795');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('26221a32-8055-4911-9122-07366ee59471', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 00:57:16.146565');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4ad4dfa5-9fff-4aa8-a40a-581476c54449', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-22 00:57:17.723041');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('735b1bf3-36d6-4a62-915f-3e30695832db', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-22 01:01:17.336913');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6a927381-645c-4cfe-b2e7-05744ce709fe', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-22 01:04:12.760362');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e1374a22-c6af-43f5-a9cc-b3ce1201f04d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-22 01:07:59.657279');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('1aa1531d-bc06-427c-8459-f8b35af210f9', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 01:08:00.073861');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('aef9c8bf-8f6f-4497-a850-efb35186fc79', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-22 01:08:57.132321');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3a4a21dc-baf7-4137-894f-966ae2b6994c', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-22 01:16:45.984161');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('9d3baf68-1830-4612-99b1-0b9935db0921', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-22 01:20:01.086453');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f9f252f4-4580-428e-b301-7052d8deca3a', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 01:24:36.585469');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('dc3c822d-294d-42c2-b5a7-c50b193aa532', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 01:27:45.500474');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('41dcbbc4-15f7-4fa7-a786-430938b32594', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-22 01:32:27.194519');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('5bb6c08d-53bf-42bc-b8a4-179a1fb09ef7', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-22 01:46:01.101422');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b3ddcdfe-2292-48fb-ba9a-19bf30c59bd6', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-22 01:47:29.990585');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a968f52d-683a-4cca-b4b2-e2fabbd5ec36', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 01:51:24.150147');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('1f4396ed-fd48-4ddb-bb9d-0491eafee9ab', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-22 01:53:03.266767');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0cf3b600-4a40-4a32-a3d4-5ff683aaab69', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 01:56:58.154063');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('13e36acf-5c54-4843-8951-b2a7672e1bbb', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-22 02:01:39.796207');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('daefc392-e245-4ea8-827a-a476ae76a22e', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-22 02:05:37.999568');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b69f16d4-a7f7-4a37-9b40-28619335e3b7', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-22 02:09:38.754753');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('85ad0196-7e0b-428b-89e6-f646cd0598b2', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-22 02:17:58.901615');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('8a6f0d62-1808-4532-a130-6e5f946c3c79', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 02:25:52.321285');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6c605ae6-5f8d-4ee5-8a62-24fdebf2c9bf', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-22 02:26:57.805647');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('dff2fc67-b75f-453e-8140-f74c3ff22fe1', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-22 02:30:52.036576');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('37c42f23-e614-498f-9b76-66546d6021a3', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-22 02:39:32.374542');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f5a6bd47-87ae-48d8-841e-78dd8ff5d615', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-22 02:43:18.329352');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('27b67544-bb9e-4934-9323-1f93d0c75cef', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-22 02:47:53.878105');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('83cff26f-43d0-466f-9cd5-552255000825', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-22 03:45:00.39316');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b54a79d8-e646-4202-8439-522b44dcac7c', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-22 09:01:11.265141');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d669835d-ca53-4732-a3cc-a31e1c535dfb', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 09:03:02.477919');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('21a56032-4272-4339-8b32-22eec627e5b8', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-22 09:07:44.596158');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4c508003-9e10-4393-a493-5a778ca1d826', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 09:11:02.704361');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6b14f361-706e-4a79-b2ae-eaf06cdf843d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-22 09:11:24.519489');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d765c10c-5dba-4c2d-9592-b0d7d630d874', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 09:11:27.510901');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('cf0a5de9-3220-4d24-b2ce-a7a8c4bfd758', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 09:14:03.0696');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6f740d3d-497f-41cc-b516-21453b39732d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 09:14:03.792968');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c317ad6e-daf4-4efb-83de-71465bea3c99', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 09:14:59.382288');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('83573a08-1361-4ba1-a370-d21ad8e9921b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-22 09:17:24.666747');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3482e9cb-ff05-49fa-90e6-bbcf7367b161', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-22 09:17:26.866191');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('2bb9beb6-006a-4d38-bcc4-961abee15f2e', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-22 09:17:35.64575');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('845da988-d282-42b6-afc7-508c19acdd67', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-22 09:17:49.958808');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('459dd884-1ebc-435b-bb7d-abc3591547f4', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 09:20:07.488436');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('96c32c7b-90ba-4ee2-9756-720d21570d99', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-22 09:26:26.252677');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('77d26472-a564-49bc-99f1-96b0e5f9768a', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 09:30:50.538292');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('56d72841-9148-470e-977a-016b74dd0bf2', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-22 09:35:31.434759');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f13ca092-e95d-4451-a8e4-819ede974cfa', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-22 09:39:27.497808');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3631eed4-118f-4adb-adcf-7d4b30593b12', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-22 09:43:26.616482');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('43011b17-752f-40d9-9649-04317652cf32', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-22 09:47:25.67421');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('13c50052-299c-45a9-a367-4b931d5b23c4', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 10:05:55.641159');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6b527321-eeeb-4d3e-9ac8-8a2d37caa255', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 10:47:21.695074');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d0fe6a73-52d0-4532-8c3c-0426d5e1e5cb', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 11:47:44.109526');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('8453fd1b-558d-4561-8f6f-9e9b91b48d5c', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 11:49:43.525412');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('88eff12d-5923-4d93-9ca1-1bf71f5dfef2', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-22 12:02:34.822616');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ad1ee0c8-2a8f-4f01-858e-487180fc5d5a', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-22 12:11:43.165333');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('5de5b4f2-ef51-48ab-af84-be814770150b', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 12:11:44.253807');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('086fa1c9-1e6f-41b1-9735-d26da640dba6', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-22 12:11:55.936412');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('bde7cd28-9e02-48ab-b860-9b3d8d974b8b', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-22 12:12:07.595621');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('08983377-9a5a-4128-a849-175f8d083248', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-22 12:14:17.058587');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3a0f3251-4876-4f2e-95fe-9a03e7f68bf9', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-22 12:23:52.919073');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('977ec35e-4638-4f99-82c0-a6bbf84cdc13', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-22 12:29:16.123239');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('7e7f4df6-f005-4f75-b2fd-2b0aa5cdddc9', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-22 12:31:14.969601');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a641c62c-9da0-4a4f-b163-0c9e9f723140', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-22 12:31:18.666921');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4900cab1-6e0c-4f0d-8f7c-052900eeffb7', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 12:31:20.457733');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('7880331c-b45b-4733-ae2f-bcf3a019f62a', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-22 12:31:22.424781');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c51b1045-a69b-4dd8-92f8-5f638d97cdc3', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-22 12:31:25.139627');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('217d8d44-2867-4a6d-a228-954d09bbca6d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-22 12:31:26.944062');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d45fb45d-227c-4031-af94-265bc9a3589a', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-22 12:36:34.840012');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a26c98dc-7081-46c8-af18-509a322bd2d7', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-22 12:37:29.042684');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f85bf4ed-5ce0-4ca8-96dc-40d0d7609baa', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-22 12:37:31.447997');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('62fb1cde-8726-411d-ac44-fcef59bc4de5', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 00:08:58.983268');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f99eb852-b5fc-48c1-b44c-43a74f4e9243', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 01:16:03.830405');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('24a28181-e7cc-4edf-ab25-5e0d1e8ee8ae', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 02:31:26.135491');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c828b841-e55a-49f9-ae22-64ee29bc2b3c', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 02:32:06.885737');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('8bdbf74b-3aba-4e7b-9934-ccbe6d5fb5d9', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 02:53:38.097735');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c1cd4da0-fe4f-47f8-9233-a802e1efd462', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 04:22:25.800721');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('79138cba-4f7f-42b9-8990-5f3a355ea763', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 04:26:25.542317');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('71f41c7f-52f9-4712-be4c-7a944172b1c0', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 04:30:16.357242');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d5658788-1692-49e6-9947-bc9dab75b149', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 04:34:10.674243');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ed759673-fcec-487b-a85f-a7760cc8122f', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 04:38:09.156693');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e89f4481-1a86-44c5-a975-88580a20aeae', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 04:42:35.29583');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('fae36447-4296-4444-9115-98fab40da60c', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-23 04:47:14.238266');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('01b6adfe-6543-4064-998e-d438cb0768f4', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 06:26:58.863921');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0fcdaf08-613d-4ac4-bbd4-548dbf88e232', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 06:30:49.045845');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('fb3f3a8c-26b6-4d88-a046-eebaa45b0795', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 06:39:36.965091');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('7acb586b-ce36-4c38-92b5-2db3fa9bcace', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 06:41:12.163569');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('574a2d31-66e8-41ff-89a0-9cca804a1292', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 06:41:14.196885');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('9dfbee73-751f-46dc-93c1-41ac4998f953', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 06:44:03.415866');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('65cbfc0f-eb6e-4833-bd35-e86685fed2ee', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 06:44:19.009692');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c8bda768-c983-49b7-9922-3fbe5b72ef5e', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 06:44:30.731579');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4a31b662-b3bb-49b2-8df7-52c65a55f1ad', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 06:44:32.88173');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c0557f39-35da-41d0-a5e6-23b601b9194d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 06:44:57.323706');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a144c9af-0a74-4d7f-af3e-ba1e24512654', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 06:46:19.284368');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('867c8749-05f5-454c-92d9-e261925c6ad7', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 06:51:37.283832');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('86497942-8f01-41c3-8fb3-6d8a5b6ec624', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 06:51:52.28546');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3ad564b3-9627-449d-adc3-7d4f8c0191b2', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 06:51:53.983328');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ae93b91a-fc43-4b97-9b1c-f400cb96f95b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-23 06:52:17.432629');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b8e0a2bf-5a20-4d96-aa7b-92300961cd32', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 06:56:17.324556');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('aee6f506-572d-4cb1-bb64-8d4345f8b15e', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 07:00:08.07513');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e71b1c3a-188b-4d7e-bd37-91a5707dc37f', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 07:03:42.413181');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f07788e1-d825-4b03-8699-e0367f56dd2d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-23 07:07:33.251314');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3d73a1f2-bc1d-4bd9-94b6-a7416dad91ad', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 07:09:41.883253');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('9ba34250-c7e0-49ba-ae90-7bea15e7752b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 07:12:14.450041');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('012c0f7e-ca43-4b3a-87fd-29ec9f785698', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 07:12:29.747167');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6c8250db-7cc1-48ea-904d-c2450633efa3', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 07:16:20.467468');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('abdc2be3-adb3-4b9a-8bb7-9a71cdb1a311', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 07:16:53.056533');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('368854f0-dc35-4a16-9efa-6bb007192e41', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 07:18:02.282181');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4cb39d1d-8a6a-42df-8448-4f278d3c6ab2', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 07:22:07.015421');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('96425133-624a-4235-9db6-1c42aaf44530', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 07:23:11.932621');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('35460edc-f9e6-431e-814b-a26b7c7a3b70', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 07:27:05.956692');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('eed0f5a7-5b55-49c6-984f-4ff9bb3a8941', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-23 07:31:23.688308');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('baabfbc1-b194-4e6d-816a-f773db3ad141', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 07:31:47.440824');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6a893a8f-9bfe-4e56-b4a7-2abbfd802a04', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 07:35:38.44961');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('efc565a8-0cdf-4911-a946-ff0aedc79dcb', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 07:40:20.282799');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('5003ade5-7207-482f-b46c-409a7169cbab', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 07:42:06.418467');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d436224a-d53a-41ed-b496-96ca9136548b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 07:45:13.084955');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('1b0d87af-6912-4972-a25f-cc8741a5ed4b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 07:45:12.759844');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('97413678-7597-4dbd-ac31-142bb2b82161', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 07:45:15.503403');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('550708e2-1d5b-49a0-826f-3f4b0bb1e29c', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 07:45:31.626323');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('13d86cfd-53fb-4642-a437-61b7bdfa1d96', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 07:47:31.81841');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('da7b8b7d-cec2-49ef-b904-4eba1a43710b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 07:50:04.704132');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('72718bc3-27a8-477d-a33a-5ef5e07ae0b0', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 07:54:27.541697');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('79bd5e7d-4064-4607-a968-6fc3efc10005', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 07:56:37.977075');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d7b9ceb8-27b3-470d-b3f8-a980279eb5a0', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 07:56:41.625329');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a908da1c-9a1b-42bf-ad2e-14dc6ab69b4d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 07:56:45.257319');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('dbbb8ff5-bad7-4f6f-bbf6-4443aa5622ee', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 07:56:46.033995');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('2db3f476-8f0a-45d5-b047-ca5dddf2eb2f', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 07:56:52.06032');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('877799fd-323d-4b0d-99f5-9860959221ce', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 07:56:52.900464');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b52da687-d1b0-403f-82fc-4a206eafc11a', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 07:56:57.237632');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('5c923d86-d7e5-412e-8226-2b1e44f26af5', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 07:56:59.243342');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f0608486-96af-4fd7-93ee-0408ae14ea71', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 07:57:00.414931');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('aba79e3a-cce1-4812-90fa-376b7b89d63a', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-23 07:57:04.554985');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('54f8dcf1-11d6-404e-aa0c-0e8ff1ea812f', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 07:57:06.917938');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('94760ab4-5336-4b92-8c2e-25676cd87100', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 07:57:22.030141');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('53c81f33-b3f2-43e0-ae37-fc5494c0659f', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 07:57:24.677803');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4fba09b2-a729-4a42-b230-0539b2a9c6e5', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 07:57:32.054832');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('fa7fb3cb-2060-4643-8941-2879d837444e', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 07:57:34.014919');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('2778fe01-b7ec-4616-8338-5603a443dca7', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 07:57:38.020621');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a5e3dede-f630-412e-81ea-4a0983a58960', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 07:57:40.152314');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a8d50551-192e-4293-9c2e-45a99cfb51af', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 07:57:45.114663');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('51f3093e-2015-4979-8324-b4a896082b9a', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 07:57:45.956239');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('09ab6fe7-2d27-4cd3-97b9-85dc7b032e15', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 07:57:46.264427');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('8ed15286-0344-4231-9784-ba7178e8ff9b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 07:58:16.102426');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('2d5f160b-6182-4b80-905a-461cb6687344', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 07:58:32.014773');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('909190be-35f7-4b50-86cc-343360f157ca', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 07:59:15.907506');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b735beba-39ea-4c7c-a1aa-9a6b723bfe6b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 08:00:00.905663');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d2375ae6-c894-44e0-9e5b-c71a2725f549', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 08:00:02.534153');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('87072feb-6e3b-48da-bce7-b5020e4c685b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 08:00:03.225858');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('2e043c63-0ec7-4f9a-bea6-827dece993b7', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 08:00:08.001088');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ff41777a-7c6e-4af7-82bc-5f45b688372d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-23 08:04:49.946597');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('dcd730f2-a18c-4f6e-a0a7-70e0ad9652c5', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 08:07:21.777922');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4be37123-0e3e-42a2-96a7-29ce63ede3aa', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 08:07:28.556772');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('9529f08b-d470-44a4-a762-42b2958f5abf', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-23 08:07:33.772214');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a2e78ea2-4cd4-4260-b5e6-f86d80b30249', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-23 08:07:34.149741');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('84a5f20a-9f8b-49a9-b066-826051530a0f', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 08:07:37.218999');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a5704c16-10ff-4ba7-bec0-15d44b29cae8', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 08:07:40.37416');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('62228346-1871-48b9-ba17-3bbe7bdf1e41', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 08:07:43.050513');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('7eeaab02-1f32-4266-af0f-4e2744a6b5c3', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 08:07:51.734693');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('eb335a70-fb20-45f3-b5c9-008376f4e423', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-23 08:07:58.974046');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('051bde4e-7521-41b0-8361-ffdbc272120b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 08:09:08.330376');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('dab046b4-46ae-459a-866e-95e234d86ce6', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 08:09:36.9796');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a7470345-94cb-42b9-a0e3-37d758352e08', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 08:09:40.174534');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('2b511fdd-b13a-464f-be1f-c2fbde9cfb2e', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 08:09:42.209929');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('7c31a339-bc65-4bf5-83b8-c91ba78ff1f6', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-23 08:11:52.99898');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('2b308a69-63f0-456c-91db-7815b080e128', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 08:12:44.666532');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('2aaeaf53-5a07-427a-b373-231bb6fb8048', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 08:09:43.70105');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f410128a-b865-4e82-8bb8-3b99d7d84d7f', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 08:09:52.604054');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('96852a9e-44bb-4050-be9d-cfb68ed7d92d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 08:10:00.689298');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b07a31ee-2da3-4211-8257-86f12fa971af', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 08:10:07.053721');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d0299610-7d50-4a6d-815b-a0dcf7937322', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-23 08:13:00.717892');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('cb4677db-127a-4f07-9e25-c3aab49b72d2', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 08:16:59.677695');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('979eb4ed-b5f0-4789-868d-dbc037a6a9e0', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 08:17:10.405979');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('5d046ec8-65b3-47a3-8873-099a404ee9cc', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 08:17:11.381276');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e05d9dfe-0e79-4fff-8534-4fcb88f2fad7', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 08:17:12.031313');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d7fc8946-d963-42cc-b446-564fdef23e85', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 08:19:57.340597');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0f96d0bc-a93f-46c5-8789-8690af0bfd68', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-23 08:23:47.9767');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a8cf51fc-9ce9-4ec9-9f3b-a0dcecb5a7d2', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 08:25:07.07074');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e82598d5-bfa1-45ea-8eb3-850801261ad9', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 08:29:01.948525');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e7bed048-fd5c-47e1-b675-3aec8be6d784', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-23 08:29:54.522329');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ed304b19-b94d-4ca8-9fb8-fa1859609bd3', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 08:32:37.573388');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('91b55f8a-ae1a-42dc-a774-2525ab014a20', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 08:32:38.716965');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0607ed77-c3b3-403e-8ac0-93ba75c99b23', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 08:32:39.568342');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('5f0d96fe-bf41-4b8d-8e4f-45924ff76312', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-23 08:32:40.210737');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b130d3ab-0710-4477-968b-5475a98cc0fb', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 08:32:44.063807');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('8aea151c-ff12-4fc4-942e-c4f83279363f', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 08:32:46.036572');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ab0d3a96-e33c-47be-9452-bfae9b900316', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 08:34:18.283');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('aae252b3-d9be-411a-8aa6-0e004170c864', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-23 08:34:24.433689');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e2f91a46-aa46-4890-95f0-d56909f6ab39', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 08:34:27.482967');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('109ff379-e8f1-45b0-b96f-926b0fc5f0f7', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 08:34:27.943902');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('87e3baed-89e2-457a-97a8-96f9eda578ae', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 08:34:29.334632');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('87d28c1d-8629-4022-8b03-cab56ad85ae5', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-23 08:34:49.254167');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('126a31ac-8e65-4277-ac1a-5a59c74875cb', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 08:34:52.529081');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('50eed5d6-21b3-4114-a8ba-4f2775f9af6b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 08:36:14.216821');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('375ace52-6bdc-41c6-b87e-8701cb2902c8', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 08:36:16.888055');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('12a0fbdf-240a-4e58-b76f-7f65e9b458d4', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 08:36:18.829131');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('9bb13ac0-eb1c-4269-8ec1-5aa10ed78169', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 08:37:21.460968');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('738c2bc1-7a4e-4f48-b7ca-cf1f73ce5aeb', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-23 08:37:23.998044');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('7e4bfa4c-48b3-406a-80e1-613bc973c5f5', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 08:37:27.421484');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f06b7019-cd3e-4cb3-99ec-e3fb10897a02', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 08:37:29.538821');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d851a17c-9b80-4ea0-a87b-f4cacc4477bd', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 08:37:32.192633');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('428881c4-1f60-4575-9e6e-3016498a74b0', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 08:38:41.060595');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3422c5cc-63c4-4bdc-ac44-1e2d9008fc03', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 08:38:40.360505');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4ba0326e-a361-44c0-a66e-ec26554c5fd4', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 08:38:59.196012');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a0561268-dc9d-4894-8e27-7b0396c44d39', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 08:39:27.571507');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f738097a-62ea-49a9-bdea-941465ae9a29', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-23 08:40:16.050019');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('954a230d-09c6-4076-8edc-aeb5cb373de1', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 08:44:15.380296');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('2963405d-78b1-4551-9acd-57c399063fb2', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-23 08:48:07.272742');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3fa1f607-c308-4555-8a86-e276987129b2', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 08:51:14.248812');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('096f520d-d5e8-44de-8fcb-4ecdf8ee09ae', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 08:55:08.900583');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('2bcf455e-a575-4ded-88b6-6cabaacd3d53', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 09:12:23.877939');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('cba39af5-2aff-4dce-90a4-fbbe27185dea', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 09:16:41.052629');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('94f92f73-8f86-467d-8817-84b47109230d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 09:21:03.949196');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('457ce1d6-736b-4856-9f1c-4bd9c9a186fc', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 09:21:04.269384');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('5948ea6a-8a61-4277-bc5e-b3e8db4a31e5', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 09:23:26.236912');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('aebb5ec1-ca9a-426e-be77-3557cdc0418b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 09:27:16.673827');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4b1190ac-5299-46d9-8363-48374e3f6dbc', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 09:28:58.697365');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('bd14ad12-5e2a-4505-aa76-a94c4e47981e', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 09:29:04.011405');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('65b212b5-fa9f-456f-8b6b-dd1159ba4b2d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 09:29:12.282603');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('1be5bec8-e5f2-4e1b-8409-3ed1e55431a1', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 09:29:12.691459');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('680440a2-7444-48f0-a0cd-82a6fbdbbfcc', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 09:29:38.989612');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('51285dbe-8d54-493d-a628-42252f7b3d8c', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 09:29:43.490699');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('64323c55-904a-4519-90f2-1949a85c1850', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 09:31:00.498241');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('917e5079-a2dd-4954-a760-42e4955bc9fd', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-23 09:35:43.498956');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('dd753808-ae0d-4a09-9c9b-a725bedfe31b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 09:36:46.370156');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('161bfcff-937a-4fc1-8fa5-9ef97ed4683b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 09:36:46.857775');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('8a6ab331-60df-43af-bdc1-4a1ffd739f34', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 09:37:02.142034');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('102b0c54-8bb7-43fc-8664-3a0071b9b53d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 09:37:05.254787');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0efe3945-2c8a-403d-97e3-53bd31c4fbef', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 09:37:09.485374');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('08365362-f159-4e2d-985c-7b5f4156553e', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-23 09:37:11.533156');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0508ca98-f9af-4502-a930-f498f1ca5056', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 09:37:13.425744');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('5ad6a72c-73b1-46d6-9b74-8a00b66d0ab0', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 09:37:17.050946');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('df08b48b-79c3-42e7-86ad-96ed5c0b534d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 09:37:26.814333');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('38739275-382b-4b92-942c-89933bb3deaf', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 09:37:28.831834');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6ee0170b-5874-4d16-99bd-8ad7065e3560', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 09:37:33.16341');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('471e2fbb-1e0e-4704-99d6-d52546323ba8', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 09:37:34.632416');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('1db1be98-b32a-40ec-bcc2-08c36bd9ca2a', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 09:38:39.947215');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0d72747a-95e7-4fbf-b382-3684952d93fc', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 09:38:47.869093');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('98c0c2e6-9c03-43fd-878f-3d3290d999e2', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 09:43:30.562585');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('69b545f5-a7a8-49af-924c-99fc16479b86', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 09:46:28.528436');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0d659743-ff00-428e-86e3-0138021b899a', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 09:46:43.65172');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3f52f241-de35-4761-8dd5-548b1df06b13', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 09:46:44.696737');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('9151ecc1-9baa-42a7-ab5d-679977c8795d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 09:46:51.0961');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f341fb6a-251c-4981-8bd2-6f7843ee0e23', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 09:46:55.683495');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('acbc7048-0822-4dfd-8691-923eca86268b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 09:47:01.662889');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('fc78d1d2-794b-4183-a0c5-859444e37513', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 09:47:04.114939');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a5aa2b46-d74b-483b-833c-fad1fc1d2b6c', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 09:47:20.071327');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e674fe0f-b022-4c78-84fb-a49b7fba8781', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 09:48:22.107281');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ee378686-fca5-4b70-b9d2-407609394995', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 09:48:57.986805');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('024beb72-be15-4f9b-aa03-9420ba3adee2', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 09:53:39.121138');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('8e0b633d-db09-4299-91db-3981b9c7574f', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 09:55:06.747613');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('28e33c8e-89d4-4c90-9fef-c298155479a5', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 09:55:07.987461');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('18069f14-a25b-4621-a33b-1162dd1deaaf', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 09:58:48.850947');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('5aa75ff6-b9af-4f5b-aa54-8062e3221410', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 09:59:38.594063');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3ec1d44f-1978-4e2b-915b-d8a0f15f7f44', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 10:03:31.025485');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e5bc02e7-fdf0-41ac-afbe-e73cf4e87501', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 10:05:39.296269');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('16392881-a597-4889-9e81-bc16fa51b1a2', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 10:08:00.479738');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c5fe163f-7495-431a-8920-a0d8d532efc6', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 10:08:01.53016');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('85a535f1-2f43-4d6e-bc46-d1c01e572907', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 10:12:22.743049');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a4168f24-ff3a-468d-9964-35acded27a51', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 10:12:34.906543');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e50e73bb-f1d2-48d4-924a-f698975fd1d0', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 10:13:29.119589');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3dcc32a6-bbd8-4908-8e4a-965bb2185e50', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 10:17:19.590951');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('7afc0e46-667e-406f-8fee-c6e44a89e158', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 10:18:45.520811');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('21dc0366-0a25-4348-b052-58d8888cccd7', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 10:19:32.199716');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c14599e6-6ba7-42cf-a96a-ffd5f4be5d1c', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 10:22:51.325692');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f15ee82f-de1b-4274-a78e-4cdeb9acedd3', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 10:24:06.991764');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a7d8598e-4ea0-4b1e-acf5-2a4d607319cd', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 10:28:00.758628');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('560ee250-9aa2-411a-b182-c0a24b0c837a', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 10:31:51.288329');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0c9458ec-5312-4d26-913e-efc104e89bdf', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 10:38:26.15821');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c64f7b2a-46da-4df5-bf2d-313d44bd6954', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 10:39:14.655603');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d41de494-ea54-414b-af58-db7027810bce', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 10:41:23.630931');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3709da67-5adc-4ae3-84ec-a58bc27b1f6a', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 10:45:55.404867');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('39c80996-f380-403f-903e-33ac3e511b5b', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 10:46:25.114321');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c9744dd1-1d39-48b2-bea3-3830e22ca458', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 10:50:21.220744');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('9ec243b3-5a3e-469a-b8ec-6e65d63711a3', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 10:53:09.628128');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e614dcee-3c24-45ce-a06e-89219bcba2bf', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 10:57:00.058336');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c5f4b48f-eee8-45bf-9c24-2d17e7facabb', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 10:57:35.927175');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d31a4e2f-5611-48f2-b0d0-2ee7f08824e3', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 10:58:15.555349');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c056db82-967c-4350-9665-47f40ce24454', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-23 10:58:45.433483');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('dd6fe694-99ad-43e7-889c-6f833b6f64b5', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 10:58:47.214682');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('00c6eca7-7e17-4e28-ab1c-e92ec03e7f09', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 10:58:48.39469');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('aa4e731d-fa23-4b09-9619-6e8e2aa34edb', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 10:58:49.773658');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('9cfed5d6-6751-45d7-acf1-f9e321e1f25d', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 10:58:50.825649');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('78281c4f-3496-4712-adf4-79d4d37bc933', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 10:58:51.542564');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('777d5aef-33f8-4b71-8b57-0cf00db30f2a', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-23 10:58:53.986361');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('1a4ff6fe-18ad-4086-8cbc-73fa0ace42e3', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 10:58:56.739664');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('005d3645-2fc5-4ef8-866c-f2c8f80f04ca', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 10:59:04.65058');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('539a0e8b-b957-42ef-b1e7-80e8f5b5e936', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 10:59:53.768361');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d581acff-7015-416a-9594-00e404c85f89', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 10:59:57.35675');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f147b409-a946-49f2-9ac4-8c53f69639db', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 11:02:05.878419');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3a213be3-8c6a-46fe-bc90-c1b910740896', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 11:06:44.29781');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3df4fcdb-65fc-4e74-9aa4-34dde616f262', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 11:07:20.376442');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d89987cf-a82a-4fc2-9463-a71aab751a9d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 11:11:14.598526');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0731fec8-64c0-4c91-a582-9084954bc675', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 11:15:04.956382');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f3d12a0d-2c5e-4f0d-b428-812701216977', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 11:21:03.212562');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('df514fcd-028f-4c36-8235-c7952bcaa101', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 11:25:12.077471');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6cdad3e2-66bd-4c02-9435-00d55a2e4986', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 11:25:32.634977');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('42c62406-b231-4818-8851-de3516c9917c', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 11:26:41.0754');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b07852e5-e84c-42b7-9bda-ba793e73b3cc', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 11:30:35.915338');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('898615ed-c5dd-46e3-a29d-cf667028b928', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 11:33:28.318863');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('85865ff0-4147-40fb-b505-8de5e088349f', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 11:35:16.761085');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('5649b9db-0ea9-4b62-898a-5b06d4faa904', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 11:39:33.294948');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('2877cc05-0d83-4a96-9ab2-0413acbe43cf', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 11:40:28.816615');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ab87a8a0-037f-4873-b54b-154c43018040', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-23 11:40:32.227992');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b567d34c-c832-4e96-803a-e8610a875996', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-23 11:41:04.613216');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('dd2dd5b7-5c66-4c98-9954-45f2699d746d', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-23 11:41:08.20816');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('8b05a0be-1a54-4cd2-b91a-eefbe09f06f3', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-23 11:41:11.67799');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3fa2a871-1817-4cb5-8137-b948ea27cc38', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 11:41:24.982943');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a5985439-2c66-47e8-986e-5da41978cc4a', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-24 03:38:00.839527');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('bec1e6d2-00b3-4f20-b671-3084cca756ba', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-24 03:38:03.17213');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3c75514f-a587-4ca7-9b12-2abcbba2dcd1', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-24 03:38:12.566693');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('2c350363-d87b-4cb5-bddb-0c1d5e780547', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-24 03:38:54.155188');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('09a2b31a-401f-475d-afd7-e1632c82df72', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-24 03:38:55.841674');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0e64c2d0-65cd-46f0-9bd6-fceb0b9b7069', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-24 03:39:00.140994');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d4ed20e8-59d0-48f9-8127-390304eb6b90', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-24 03:39:00.671133');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f9351e91-20c5-4c37-ae39-48c284b51966', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-24 03:39:03.810188');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d2d83e99-9dbd-4df9-adcd-88b8a762d357', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-24 03:43:04.134466');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4afbb547-6764-4627-b959-351252783f66', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-24 03:47:02.657262');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4874d403-4a69-490b-a78b-ab3b83bc1bcc', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-24 03:49:08.482198');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d42446b6-93b2-475c-9188-65bbf5a7e146', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-24 03:49:10.234275');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('193b3064-ef86-448a-8b0a-e006c2aabefb', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-24 03:49:11.84381');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e51e2ea5-2070-4fbe-b253-d23807699f8f', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-24 03:49:13.720551');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('efec5ef0-ada7-4790-82fd-2ef711d44848', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-24 03:49:15.357669');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('8155dfe3-52a6-4b19-b92d-edcbe333bf73', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-24 03:53:12.66846');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('7d425cf2-19b8-4d3d-89bf-a5a313c594c8', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-24 03:57:10.862729');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('67e764e8-511b-441d-a519-6b08d7773eb2', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-24 04:01:10.679179');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('44cd587e-655c-4bde-892f-bc0a5f127010', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-24 04:05:05.25193');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('7cc2d837-c1e1-40b2-b844-be6b94524675', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-24 04:06:27.559732');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('fa3b3d02-fbc2-4218-9fc5-28e9433fb5a7', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-24 04:17:50.40073');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('da1d9001-5177-4671-9109-b872a44dad6e', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-24 04:20:56.795007');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('907200f1-1043-4989-bea2-e3d1bdba24dc', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-24 04:24:47.288427');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('dea8d5f2-f850-4a7a-abcd-100514e889d6', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-24 04:34:47.353326');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a658a07d-095c-49ac-97e5-cf471bda0395', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-24 04:34:47.432185');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b8b5c1ca-51b8-426c-9084-894e4ba0aa15', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-24 04:41:21.707774');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d041b595-3241-42b6-96ef-9f5c7ec63f46', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-24 04:45:05.516968');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('19016b15-0c58-4247-aaff-e48133590a13', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-24 04:53:57.328139');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('56c6de45-689d-4d06-b4bd-556fac691346', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-24 04:54:43.742951');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('270f8651-1d24-4af1-b564-1da7f58bbfb7', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-24 04:54:46.950829');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b66dbffb-ba1f-403b-bdac-a3a17bbafedc', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-24 04:54:47.519646');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('525e525e-f450-47b0-b34a-e596d4734a3a', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-24 04:54:48.440961');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0ba234be-0963-43d0-b8cf-14caaff476a9', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-24 04:55:00.746405');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('27290e62-f61c-4448-99b5-0636e9394015', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-24 04:55:02.006349');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e5c513a7-8ec7-4dcb-84ce-f568d0e2287e', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-24 04:55:13.351368');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b146c79a-46a6-4905-8c1f-72afba09f570', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-24 04:55:14.240457');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('28a1c049-cb72-48a1-9bc8-90fde088aecc', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-24 04:55:24.392965');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c0b2aba1-ad8b-4803-b6e6-2c578df5ee25', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-24 05:05:01.83455');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c629e7a6-3bce-4f84-b1a7-f7b93e122e51', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-24 05:07:01.755348');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('60acc1a7-79e9-4659-9023-dd7052a56adf', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-24 05:07:02.786631');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('7be6931a-a460-4127-a681-dd60d4c862c1', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-24 05:07:05.072258');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('42fe0d49-595f-4cdc-a351-9fad4ecda2c7', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-24 05:07:05.304853');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('5823c62f-4731-4fff-b786-adf6a1ef1470', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-24 05:23:14.757132');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3a4ab444-1a5a-4a41-9040-31ae91855ef4', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-24 05:23:15.30359');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('bfbd03f2-6cdb-4ade-8224-1f11e6cc01e4', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-24 05:23:19.855985');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ab3855bf-b6c9-49f2-b054-7dd522bd3fdf', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-24 05:25:16.388321');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('89c69890-8a55-49bc-81a1-0fa129a86d3e', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-24 05:25:29.406173');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b7b2ae64-2d4c-4e98-a9a5-75efef62d54f', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-24 08:07:04.288326');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4638c6a7-7b75-49f6-a38c-da8b18f5218b', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-24 08:08:07.699493');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('26db3ba6-76e6-4ce4-9144-9061ae8fe973', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-24 08:08:24.919708');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('119750f8-0b52-4b40-a34f-0bef5d5a0047', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-24 08:14:42.61893');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ef4ed6d8-cb21-4957-8a54-d984729e6502', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-24 08:15:23.273072');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b7a5f7d2-4754-4f40-a093-52b7ff36b628', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-24 08:18:54.929136');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3460b458-a368-49df-b4f3-9781634dd564', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-24 08:18:59.304176');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('041c5e89-a7c5-4aad-be5a-a0f79dad47b1', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-24 08:27:47.49125');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f77e3c22-cd11-4f37-b0d8-2ee8d9759aa5', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-24 08:31:37.117427');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('9d94e262-da3b-4f82-ae6d-975f40df506e', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-24 08:50:30.487976');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('5bcc4174-2a73-487a-9aa7-22e3cdab16f4', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-24 08:54:54.761996');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('35229984-c296-48cc-885f-97ce4c7810e6', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-24 11:28:45.311745');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('932b26a9-7704-49a3-b6df-9d7c77ebccc6', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-24 13:09:30.11366');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('8fbdcf07-2837-48f2-97ff-2950f9b1d9e3', '3fac27d4-2c89-4944-8581-3afda18836e9', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-25 03:16:55.195238');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6dc1321a-e039-4faf-b72c-f96f498f88fe', '3fac27d4-2c89-4944-8581-3afda18836e9', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-25 03:21:37.351109');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e4541093-49c9-4e82-8d5c-cbb78e9a96cb', '3fac27d4-2c89-4944-8581-3afda18836e9', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-25 03:25:30.50933');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3b1e4c8e-7698-4026-8c82-40cfb86093de', '3fac27d4-2c89-4944-8581-3afda18836e9', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-25 03:25:32.198293');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0e6baa7f-1bfd-4cd2-ae6f-90a2f0ed52b1', '3fac27d4-2c89-4944-8581-3afda18836e9', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-25 03:29:23.293385');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6782f91f-b647-4fb3-b0dd-efbde2469574', '3fac27d4-2c89-4944-8581-3afda18836e9', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-25 03:33:16.022198');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('49eeda71-223e-46a5-9276-059a2c4beea3', '3fac27d4-2c89-4944-8581-3afda18836e9', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-25 03:37:14.370368');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4f8c53de-a4b3-4a0d-bb3a-44bbe21e7dfe', '3fac27d4-2c89-4944-8581-3afda18836e9', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-25 03:37:48.419357');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('bc90693b-8b78-408f-a6e0-e2d29ee5e140', '3fac27d4-2c89-4944-8581-3afda18836e9', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-25 03:41:45.959467');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('9fed7f73-ae91-45c3-a893-3b2e35e230aa', '3fac27d4-2c89-4944-8581-3afda18836e9', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-25 03:45:36.23769');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a1b8fbab-e7db-4977-895f-5f29fb534d58', '3fac27d4-2c89-4944-8581-3afda18836e9', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-25 03:49:28.314909');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('9e198912-8fcd-47da-9ff6-567e98835e8f', '3fac27d4-2c89-4944-8581-3afda18836e9', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-25 03:53:26.765484');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('549674ba-48fc-4039-9e3d-55c3ffec9c36', '3fac27d4-2c89-4944-8581-3afda18836e9', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-25 03:58:08.928372');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b74e045b-fc70-47cc-af7b-6f2b72f4f1ee', '3fac27d4-2c89-4944-8581-3afda18836e9', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-25 04:02:08.440156');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('7823212e-0b5f-4b0b-96f7-e3f0e7602456', '3fac27d4-2c89-4944-8581-3afda18836e9', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-25 04:06:03.353558');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('fa710847-70df-42f6-9ec7-c8bb449c27af', '3fac27d4-2c89-4944-8581-3afda18836e9', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-25 04:10:26.93909');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4d174508-7285-4b64-a10f-f93e5be7e6f5', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-25 07:15:22.029475');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('5d365160-e19c-4b49-a07c-974d00116f9f', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '4f8e499d-5a28-4750-b482-705433101442', '2026-06-25 07:27:34.088652');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('bb0b1603-0c13-4587-a8f0-2e66bb86d210', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-25 07:27:36.476213');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ba8e3cab-e31b-416f-bbfe-4df19fd71c20', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-25 07:36:58.645954');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ee33bfb6-a004-4ee1-b813-82cb0589db5d', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-25 07:40:49.35207');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('06a608ba-8af0-4d98-a306-9ff56f35070b', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '4f8e499d-5a28-4750-b482-705433101442', '2026-06-25 07:45:12.827423');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('9d01a3fb-1a4a-4152-8e8c-fb1da246ae07', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '4f8e499d-5a28-4750-b482-705433101442', '2026-06-25 07:46:06.190303');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e57e940c-a8ae-4845-ad4c-3a0a135cbcbf', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-25 07:47:40.615722');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4509d345-d870-4dc5-b6c6-955d49bb2739', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-25 07:51:37.897505');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('9f571fba-0273-4750-b4d2-1fb9c560a9e9', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-25 07:54:37.624576');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f9e92671-1c45-4fc6-8162-3f6724e3ab46', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-25 07:55:38.89132');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('dea7e3a1-e0ea-429a-93a3-d05d2a7e256c', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-25 07:56:23.08758');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('dc34dcde-5fd4-4442-b079-5b1f075f75b7', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-25 08:00:24.401079');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a75f930f-ca2d-481a-bd43-388690c10d97', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '4f8e499d-5a28-4750-b482-705433101442', '2026-06-25 08:04:47.786241');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('371ddf5c-bcfd-4ef0-93b0-c2b1f1f5c274', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-25 08:09:04.293935');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b4a45824-25f9-428f-8573-17b25d03d8b7', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-25 08:13:27.867011');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('8e55ea5e-9e74-44fe-b125-b0baf027a6f3', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-25 08:18:04.569947');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6933e42e-1a2f-4bfd-90b3-c63382ad90ea', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-25 08:21:19.329737');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('9c8c5f56-6d89-430b-9d76-469693c48071', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-25 08:22:55.853904');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f6ddb757-574a-4014-a476-88f31f4a6c58', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-25 08:23:28.110594');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('73955d3d-8880-47f7-a631-29fc3fe64929', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-25 08:25:17.213033');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b175f9ea-4ea6-43a0-b85a-548452003bbf', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-25 08:29:07.695075');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('f6018c10-b144-425a-a8b4-e90d36f250b0', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-25 08:32:31.807727');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('2f4d82cf-7e25-4b3d-925d-78f49c06f5c7', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-25 08:36:23.908761');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('eabce698-243f-4958-93b1-0630fa7e5042', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-25 08:40:22.887023');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('60f1a743-29e3-409e-a6e4-e816afc36a8e', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-25 08:44:22.785577');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('9fe05448-1520-4c3d-96d1-6037e8417823', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-25 08:48:20.354428');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('9dae4ad4-ef77-4806-8289-cf1270f3d5a3', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '4f8e499d-5a28-4750-b482-705433101442', '2026-06-25 08:52:43.956298');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('862d98b9-3e7a-4c58-bab9-05ccacac710a', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '4f8e499d-5a28-4750-b482-705433101442', '2026-06-25 12:34:34.114286');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a4d4c706-4db3-48bc-81a2-c21e64d9d515', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-25 12:34:47.919576');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('dbd1e4f4-0743-49b5-a5d6-9c633625ae1b', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-25 12:35:06.782934');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('9f2052c3-e652-4a47-ae45-0171b2851b4a', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-25 12:35:13.887174');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3e9655f4-c118-4c61-94b7-a118514f089a', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-25 12:35:18.369612');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('9ad560cb-88d3-49dd-88ef-80e9592f3280', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-25 12:59:38.103541');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('474b4000-0e99-48d9-bf13-86e57ae68ce9', '3fac27d4-2c89-4944-8581-3afda18836e9', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-25 13:47:31.060376');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('497a1328-199f-4d1b-a56e-7b8f3e1f57a8', '3fac27d4-2c89-4944-8581-3afda18836e9', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-25 13:51:20.43543');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a267b2d0-a232-4db2-9b5c-b50b7cf57958', '3fac27d4-2c89-4944-8581-3afda18836e9', '4f8e499d-5a28-4750-b482-705433101442', '2026-06-25 13:55:15.157363');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('11f05494-74a0-40d1-9c6a-c7138da3bd09', '3fac27d4-2c89-4944-8581-3afda18836e9', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-25 14:01:01.294162');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ce371ee7-2966-4417-b555-753126217b86', '3fac27d4-2c89-4944-8581-3afda18836e9', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-25 14:05:25.166833');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('8c5e9d07-da69-4f59-be53-f160e4ec6ee9', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-25 14:07:19.999557');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('93f76fb4-a969-4d65-99a4-4e7997217d94', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-25 14:10:03.30177');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('92aa8535-505d-4fa6-a999-d775a3a07ac9', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-25 14:12:47.799845');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d0ac744a-e573-40ab-aa11-3703dda05d85', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-25 14:12:51.3025');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('84eb4b89-e53f-46d9-9f9b-c5754c826075', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-25 14:12:53.908705');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('94b4447d-1cb1-4ccf-8ef1-77282d61e69d', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '4f8e499d-5a28-4750-b482-705433101442', '2026-06-25 14:12:56.757438');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('fff51978-6ad9-4913-b256-0cae72c74507', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-25 14:13:00.007916');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('49a25047-a9cd-4400-8b14-9fb580db91ef', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '4f8e499d-5a28-4750-b482-705433101442', '2026-06-25 14:13:18.632112');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ec115c65-95dd-4995-b988-aff1a3a90856', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-25 14:13:22.514943');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('aa834744-f4c6-4b07-ad98-1cb741fc1d49', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-25 14:13:28.627896');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a706bbf2-33d3-49f2-869e-7905458a494f', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-25 14:13:32.311986');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('165fb904-0667-4438-9e5f-b9888fb01853', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-25 14:13:35.110312');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3d246502-4c89-4ca8-a0a9-db1d3b39315e', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-25 14:13:38.01955');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a7bb9b26-73b2-4a23-98c7-489eea8eed02', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-25 14:13:38.221843');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ee333ec0-ceb0-4c7d-90ae-fbf6931003f1', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '4f8e499d-5a28-4750-b482-705433101442', '2026-06-25 14:13:39.998429');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ac772b29-f8f0-4895-b3db-69b8f11a4a37', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '4f8e499d-5a28-4750-b482-705433101442', '2026-06-25 14:13:41.62017');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c975abe5-560f-45b6-8b0e-6eb231272f00', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '4f8e499d-5a28-4750-b482-705433101442', '2026-06-25 14:13:44.667227');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a95938ff-7453-4d92-b1bc-0989fd71924f', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '4f8e499d-5a28-4750-b482-705433101442', '2026-06-25 14:13:48.103489');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('edd5f0fe-6ee9-4f40-8027-c0c8a37bef51', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-25 14:13:49.860856');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0957e9fb-77c6-4ae0-b354-9dc182fca562', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-25 14:13:53.921679');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0284ebd0-3b92-4244-b636-261e909cce2c', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-25 14:14:28.058622');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('97843c80-90ea-4503-b5ed-5805c5e11192', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-25 14:14:30.032897');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0c0561df-18ca-4782-9f43-3975086f7e49', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-25 14:14:32.478408');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('481abaa6-d284-49bb-8c37-972ddd7377b7', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-25 14:14:34.355845');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('362506a5-d62b-4793-a78b-43c49372aba7', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-25 14:14:51.998735');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('8dd5cb9a-6fd7-4a7b-b669-c8b8fc271951', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-25 14:14:54.252528');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('1a3c2fe5-6b78-4eff-8535-0d9a24a1dbd7', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-25 14:14:56.803391');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6170c376-94f3-402f-b99e-8d8887832595', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '4f8e499d-5a28-4750-b482-705433101442', '2026-06-25 14:15:02.535419');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('bd148fc9-d2b7-4a45-acc7-4b526cf4fb6e', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '4f8e499d-5a28-4750-b482-705433101442', '2026-06-25 14:18:16.29167');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3ce6398d-6b78-4908-ac69-5cebdcb41e05', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-25 14:18:22.956651');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d680544e-dec1-4a81-94db-723c85fa0443', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-25 14:19:28.205949');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('a6b6c4f3-500a-4218-9366-f75677800406', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-25 14:19:34.500185');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('2e3852dc-acb5-4a37-82ce-0b7c98517c46', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-25 14:23:31.881891');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('80bd92ff-8cf4-41f0-98e8-43d2da2fb7d2', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-25 14:27:28.87976');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6cf7eb92-8e84-46d3-b7c3-091a01313294', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-25 14:32:11.296184');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('ae7464c6-2203-45be-b833-4824574d84da', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-25 14:36:02.627309');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6b680430-1349-4f8b-bb61-0bec824a9785', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '4f8e499d-5a28-4750-b482-705433101442', '2026-06-25 14:40:02.589618');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3411f95e-f941-4671-944b-7f704ec68293', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-25 14:45:48.635913');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('81b323c1-914b-4047-8275-d9ff4113de84', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-25 14:50:12.657725');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('33c5556e-7dea-416c-bc5c-bdb7a2a684e9', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-25 14:54:04.414714');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('fbc849db-c7b6-4614-9ffa-56a3feaf4532', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-25 14:58:02.190765');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('d20668d9-8ac8-45d5-82b6-677535de2f35', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-25 15:01:57.040199');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('784cded5-56bf-4078-9649-678441233e0b', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-25 15:05:48.287761');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('2286999a-4c8a-4ca5-8f91-4bf065021216', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-25 15:09:45.436553');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('4e169d8b-55b9-4374-a0a9-ffd191e1e9a4', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-25 15:14:28.185809');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('72bc9152-b918-47d8-aaca-3a6ec087707d', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-25 15:18:26.231291');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6a5d0eb0-819a-4113-914e-30a7ca03fbb7', '3fac27d4-2c89-4944-8581-3afda18836e9', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-25 15:22:15.560384');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('dc239d44-3d0c-4d19-ae8b-3ac41cc13fec', '3fac27d4-2c89-4944-8581-3afda18836e9', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-25 15:22:52.420537');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('76f4107b-46cf-4235-a8e0-8cc7f9798950', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-25 15:37:02.11737');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('c00e6d95-e90b-4bd5-8327-d5079714f682', '3fac27d4-2c89-4944-8581-3afda18836e9', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-25 15:38:55.429206');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0daff85b-2f57-4a33-9ed4-8a028f6356ce', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-25 15:40:37.565613');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('0b4c02df-1ef7-4b24-9650-c05ad761bef4', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-25 15:42:14.663012');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('77d2aff8-40c2-4b96-9176-bc9ba549e752', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-25 15:46:38.288766');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('8818f074-fe63-49d6-9b11-9dd3c0b2c814', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-26 00:41:04.096785');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('6a3672d6-e022-4809-b6ab-926d7060b25f', '1aabc36f-07d0-4737-a9a9-0a7a26628b74', '4f8e499d-5a28-4750-b482-705433101442', '2026-06-27 02:30:47.287453');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b0cf1983-2975-4e5d-bdab-a3fffcee997c', '1aabc36f-07d0-4737-a9a9-0a7a26628b74', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-27 02:30:50.371917');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('da25e9de-1f0a-4aa2-b6d5-3b66c74b6f7b', '1aabc36f-07d0-4737-a9a9-0a7a26628b74', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-27 02:31:00.735699');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('77bd6340-868e-49ad-92d6-55b2d2fa6120', '5318ce25-255e-4169-980c-f0d0de9e7342', '4f8e499d-5a28-4750-b482-705433101442', '2026-06-27 02:35:05.184472');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('cba478cf-3d0e-44ee-8f47-f90a389a478f', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-27 03:47:10.421105');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('e5108a17-8b10-430e-a35b-1c3b4d3c9fce', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-27 03:47:12.39438');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('819739d0-095c-4ef1-85e5-866597763151', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-27 03:50:27.669171');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('094891b0-ae37-4f3a-b839-6efa7b482968', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-27 03:53:43.514572');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('5e875677-23a1-4ae9-abc4-a59211b61d17', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-27 03:59:31.634088');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('be03d827-04b6-4eeb-84db-73de6e2ad83d', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-27 04:07:14.840027');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('704d19ca-3210-473e-a565-ddfaf6cc52a3', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-27 04:11:11.090523');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3c49f7c3-5626-4736-a778-eaa991820f65', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-27 04:11:29.973774');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('5bf16f99-77bc-49b2-893a-809060718fe1', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-27 04:14:47.859383');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('047d934b-7680-4120-9207-bf917e796a29', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-27 04:18:54.813551');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b52883af-3c82-4893-9d1a-282a3687627a', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-27 04:21:01.999445');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('3a918051-1d89-408c-ae96-67eb7b68595a', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-27 04:21:27.299963');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('b1a9239e-e79f-4209-9aa6-81950432e4d4', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-27 04:27:08.738771');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('faa6656f-cae6-4f7b-adf6-acc44eb97579', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-27 04:27:53.911277');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('14bda082-1bbc-4ae0-b585-42f8646ab11f', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-27 04:31:46.008733');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('33247c2a-1521-443b-965e-42313e6df856', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-27 04:35:44.914816');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('2ead5777-a488-49d1-b456-76add2054f5e', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-27 04:40:27.806699');
INSERT INTO public.listeninghistory (id, userid, mediaitemid, listenedat) VALUES ('aa0fdf3c-cfb4-484c-890c-e93de82b11fc', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-27 04:44:22.447543');


--
-- Data for Name: mediaitems; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.mediaitems (id, title, description, fileurl, mediatype, duration, coverurl, uploaderid, artistid, albumid, createdat, updatedat) VALUES ('1e32dca9-fd11-419b-b0cf-70f8c8b33950', 'Come My Way', NULL, 'https://res.cloudinary.com/dc6avrrgt/video/upload/v1781779710/tunevault/video/543a5261-b4f9-4c23-80a9-49480ede90b6_Come_My_Way.mp4', 'Video', '00:03:54.615', 'https://res.cloudinary.com/dc6avrrgt/image/upload/v1781779714/tunevault/covers/84185f07-fc57-43ce-b322-5d410e666735_Come_My_Way.jpg', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'ab2e15e9-4fe1-43fc-a617-0344569c6e03', NULL, '2026-06-18 17:48:35.467357', NULL);
INSERT INTO public.mediaitems (id, title, description, fileurl, mediatype, duration, coverurl, uploaderid, artistid, albumid, createdat, updatedat) VALUES ('a4dd76cc-3ddb-4685-a62a-dfa7808358d6', 'Perfect', NULL, 'https://res.cloudinary.com/dc6avrrgt/video/upload/v1781779947/tunevault/video/64955a7e-6690-4ca7-9206-0746d93be8f4_Perfect.mp4', 'Video', '00:04:41.891', 'https://res.cloudinary.com/dc6avrrgt/image/upload/v1781779950/tunevault/covers/8dc00207-24dd-4bb2-864e-c6954e53ddff_Album_÷%28Deluxe%29.jpg', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'cf814b2c-b47f-4282-b800-321523ab0986', '84a81c40-7dba-42c9-b8f5-4291a35500ff', '2026-06-18 17:52:30.569126', NULL);
INSERT INTO public.mediaitems (id, title, description, fileurl, mediatype, duration, coverurl, uploaderid, artistid, albumid, createdat, updatedat) VALUES ('75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', 'Shape of You', NULL, 'https://res.cloudinary.com/dc6avrrgt/video/upload/v1781779473/tunevault/video/d5a180e1-d00c-481e-bd5a-0e3584fd6409_Shape_of_You.mp4', 'Video', '00:04:23.267999', 'https://res.cloudinary.com/dc6avrrgt/image/upload/v1781779475/tunevault/covers/0691110c-de70-46a4-98ce-f6d6ab9f8fd7_Album_÷%28Deluxe%29.jpg', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'cf814b2c-b47f-4282-b800-321523ab0986', '84a81c40-7dba-42c9-b8f5-4291a35500ff', '2026-06-18 17:44:35.650263', NULL);
INSERT INTO public.mediaitems (id, title, description, fileurl, mediatype, duration, coverurl, uploaderid, artistid, albumid, createdat, updatedat) VALUES ('79bcabbe-9122-4b69-9dbb-0ef347491b8a', '7 Years', NULL, 'https://res.cloudinary.com/dc6avrrgt/video/upload/v1781779899/tunevault/video/1b0b2d37-4639-47a3-931e-36bb774e3f06_7_Years.mp4', 'Video', '00:03:59.259', 'https://res.cloudinary.com/dc6avrrgt/image/upload/v1781779902/tunevault/covers/cd3dae5d-56a1-4009-9beb-e7e12476e92e_Album_Lukas_Graham.jpg', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'd8be19c8-ca05-4c88-87ed-602f020c9472', '4c638b5f-51ac-4420-9ba6-5cdeb0736e38', '2026-06-18 17:51:42.587203', NULL);
INSERT INTO public.mediaitems (id, title, description, fileurl, mediatype, duration, coverurl, uploaderid, artistid, albumid, createdat, updatedat) VALUES ('101d067a-f72a-4117-ae9b-c460f2676616', 'Attention', NULL, 'https://res.cloudinary.com/dc6avrrgt/video/upload/v1782131023/tunevault/video/727d2df4-bc08-4767-b2e6-ea70a844d3c9_Attention.mp4', 'Video', '00:03:51.829', 'https://res.cloudinary.com/dc6avrrgt/image/upload/v1782131025/tunevault/covers/e549609e-9448-47da-88e0-bbfd5864701e_Attention.jpg', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'bd749bf8-e04d-4cbf-b9b0-83919df943be', NULL, '2026-06-22 12:23:46.347624', NULL);
INSERT INTO public.mediaitems (id, title, description, fileurl, mediatype, duration, coverurl, uploaderid, artistid, albumid, createdat, updatedat) VALUES ('c1ae2388-83b6-49f2-b160-561f7dcc0cad', 'We Don''t Talk Anymore', NULL, 'https://res.cloudinary.com/dc6avrrgt/video/upload/v1782131349/tunevault/audio/229317c5-9806-438f-9037-c210eb73ca8c_We_Dont_Talk_Anymore.mp3', 'Audio', '00:03:50.530612', 'https://res.cloudinary.com/dc6avrrgt/image/upload/v1782131349/tunevault/covers/8d98e669-ce0a-4686-80f5-31b7a93bbf9d_Nine_Track_Mind.webp', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'bd749bf8-e04d-4cbf-b9b0-83919df943be', 'afd3cf2f-634b-4d38-94ec-3fbfad960aed', '2026-06-22 12:29:10.492833', NULL);
INSERT INTO public.mediaitems (id, title, description, fileurl, mediatype, duration, coverurl, uploaderid, artistid, albumid, createdat, updatedat) VALUES ('7aa5f2d0-9ebc-4001-8e19-096d4233e25d', 'Love Someone', NULL, 'https://res.cloudinary.com/dc6avrrgt/video/upload/v1781780053/tunevault/video/06225786-dcb3-4d7a-ace2-d660ea3148db_Love_Someone.mp4', 'Video', '00:03:57.959', 'https://res.cloudinary.com/dc6avrrgt/image/upload/v1781780055/tunevault/covers/e2026c03-1fd1-496c-8980-f3310e872929_Love_Someone.jpg', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'd8be19c8-ca05-4c88-87ed-602f020c9472', NULL, '2026-06-18 17:54:16.238782', NULL);
INSERT INTO public.mediaitems (id, title, description, fileurl, mediatype, duration, coverurl, uploaderid, artistid, albumid, createdat, updatedat) VALUES ('df8d37c0-4269-4a94-b8bf-74e1c563d266', 'See You Again', NULL, 'https://res.cloudinary.com/dc6avrrgt/video/upload/v1782131760/tunevault/audio/15321b17-dcba-4ccc-a54a-688598da06aa_See_You_Again.mp3', 'Audio', '00:03:57.453061', 'https://res.cloudinary.com/dc6avrrgt/image/upload/v1782131761/tunevault/covers/d7805a3b-fa26-4daf-96a2-2eb74fdb4462_See_You_Again.jpg', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '18b97772-ce2f-4de6-a0ef-79e3dd5e11ca', NULL, '2026-06-22 12:36:01.91873', NULL);
INSERT INTO public.mediaitems (id, title, description, fileurl, mediatype, duration, coverurl, uploaderid, artistid, albumid, createdat, updatedat) VALUES ('4f8e499d-5a28-4750-b482-705433101442', 'Ngôi Sao Cô Đơn', NULL, 'https://res.cloudinary.com/dc6avrrgt/video/upload/v1782299196/tunevault/audio/423325b5-9ad1-4c5e-81c5-e5825a84c49e_Ngoi_Sao_Co_Don.mp3', 'Audio', '00:05:45.913469', 'https://res.cloudinary.com/dc6avrrgt/image/upload/v1782299197/tunevault/covers/3e1f61ba-b9b4-4fc6-9617-7eafed54f6fc_Ngoi_Sao_Co_Don.webp', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '4872bb27-7662-499e-9a76-5f7e8380fb49', NULL, '2026-06-24 11:06:37.92701', NULL);


--
-- Data for Name: mediashares; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.mediashares (id, senderid, receiverid, mediaitemid, playlistid, albumid, message, createdat) VALUES ('cf7ebcf5-aa47-4301-a44c-77b87a828b94', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', NULL, NULL, 'test search', '2026-06-21 04:45:03.994717');
INSERT INTO public.mediashares (id, senderid, receiverid, mediaitemid, playlistid, albumid, message, createdat) VALUES ('092fd23e-e63e-4e9e-b8a6-1e1b748be989', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', NULL, NULL, 'test share', '2026-06-23 00:18:03.154461');
INSERT INTO public.mediashares (id, senderid, receiverid, mediaitemid, playlistid, albumid, message, createdat) VALUES ('947d52c5-422f-4c50-bcc2-38d629620131', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', NULL, NULL, 'abc', '2026-06-23 01:16:12.312916');
INSERT INTO public.mediashares (id, senderid, receiverid, mediaitemid, playlistid, albumid, message, createdat) VALUES ('7fc02cee-52b7-4fad-b10a-e6d215c08caf', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '101d067a-f72a-4117-ae9b-c460f2676616', NULL, NULL, 'bcd', '2026-06-23 02:32:19.377012');
INSERT INTO public.mediashares (id, senderid, receiverid, mediaitemid, playlistid, albumid, message, createdat) VALUES ('25ca0b56-17b7-4389-903a-bed85fb5aa88', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', NULL, NULL, '84a81c40-7dba-42c9-b8f5-4291a35500ff', 'abc', '2026-06-23 11:24:54.167615');
INSERT INTO public.mediashares (id, senderid, receiverid, mediaitemid, playlistid, albumid, message, createdat) VALUES ('1bf1e920-7c5d-4d3a-8d4b-02ff9ca5a577', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', NULL, 'd5763cb6-232c-4725-be99-01b4428fafd3', NULL, 'abc', '2026-06-23 11:25:21.972574');
INSERT INTO public.mediashares (id, senderid, receiverid, mediaitemid, playlistid, albumid, message, createdat) VALUES ('5dc02d7d-0595-49db-85c7-f2d4557d16fa', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '3fac27d4-2c89-4944-8581-3afda18836e9', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', NULL, NULL, 'ac', '2026-06-25 15:38:22.051343');
INSERT INTO public.mediashares (id, senderid, receiverid, mediaitemid, playlistid, albumid, message, createdat) VALUES ('8d827998-2737-435f-a085-7e6e387d8a86', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', NULL, NULL, 'test share', '2026-06-27 04:16:12.76348');
INSERT INTO public.mediashares (id, senderid, receiverid, mediaitemid, playlistid, albumid, message, createdat) VALUES ('b55ecd1b-11b4-4a13-8ff7-7169c875f4f2', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', NULL, NULL, 'test share 1', '2026-06-27 04:21:15.480296');
INSERT INTO public.mediashares (id, senderid, receiverid, mediaitemid, playlistid, albumid, message, createdat) VALUES ('f3098aa5-06eb-4366-ab46-e6978c1671d2', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', NULL, NULL, 'test share', '2026-06-27 04:22:07.128759');


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.notifications (id, userid, message, type, isread, createdat) VALUES ('0eb330cd-0925-4b4c-b945-fafc0ef909a3', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'Bß║ín nhß║¡n ─æ╞░ß╗úc mß╗Öt b├ái h├ít k├¿m lß╗¥i nhß║»n: test search', 'Share', true, '2026-06-21 04:45:03.994717');
INSERT INTO public.notifications (id, userid, message, type, isread, createdat) VALUES ('26d384db-1fb6-4146-96b7-cc62b7e35128', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'Bß║ín nhß║¡n ─æ╞░ß╗úc mß╗Öt b├ái h├ít k├¿m lß╗¥i nhß║»n: test share', 'Share', true, '2026-06-23 00:18:03.154461');
INSERT INTO public.notifications (id, userid, message, type, isread, createdat) VALUES ('49465161-9113-49db-bdc1-f7a4adbf1268', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'Bß║ín nhß║¡n ─æ╞░ß╗úc mß╗Öt b├ái h├ít k├¿m lß╗¥i nhß║»n: abc', 'Share', true, '2026-06-23 01:16:12.312916');
INSERT INTO public.notifications (id, userid, message, type, isread, createdat) VALUES ('15175e4d-0920-464c-9d22-6ec11e6bf70f', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'Bß║ín nhß║¡n ─æ╞░ß╗úc mß╗Öt b├ái h├ít k├¿m lß╗¥i nhß║»n: bcd', 'Share', true, '2026-06-23 02:32:19.377012');
INSERT INTO public.notifications (id, userid, message, type, isread, createdat) VALUES ('bccf3110-4dee-46cc-b58b-9f661f2f55b9', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'Bß║ín nhß║¡n ─æ╞░ß╗úc mß╗Öt b├ái h├ít k├¿m lß╗¥i nhß║»n: abc', 'Share', true, '2026-06-23 11:24:54.167615');
INSERT INTO public.notifications (id, userid, message, type, isread, createdat) VALUES ('9ac2c332-baac-400a-82c0-90efd06e6b33', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'Bß║ín nhß║¡n ─æ╞░ß╗úc mß╗Öt b├ái h├ít k├¿m lß╗¥i nhß║»n: abc', 'Share', true, '2026-06-23 11:25:21.972574');
INSERT INTO public.notifications (id, userid, message, type, isread, createdat) VALUES ('e430d7c4-0e68-494d-8f66-b89aa9da1d69', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'admin ─æ├ú bß║»t ─æß║ºu theo d├╡i bß║ín', 'Follow', true, '2026-06-24 04:14:52.145664');
INSERT INTO public.notifications (id, userid, message, type, isread, createdat) VALUES ('0bd0dbe5-d977-4ba9-a86e-32819eea751b', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'admin ─æ├ú bß║»t ─æß║ºu theo d├╡i bß║ín', 'Follow', true, '2026-06-24 04:15:07.380724');
INSERT INTO public.notifications (id, userid, message, type, isread, createdat) VALUES ('642a99ce-7009-42da-ab64-ecf0ad2fd449', '3fac27d4-2c89-4944-8581-3afda18836e9', 'Bß║ín nhß║¡n ─æ╞░ß╗úc mß╗Öt b├ái h├ít k├¿m lß╗¥i nhß║»n: ac', 'Share', true, '2026-06-25 15:38:22.051343');
INSERT INTO public.notifications (id, userid, message, type, isread, createdat) VALUES ('02e58784-538b-4f9a-8d67-3bc3e36c8a86', '3fac27d4-2c89-4944-8581-3afda18836e9', 'Nguyß╗àn Ph├ít ─æ├ú bß║»t ─æß║ºu theo d├╡i bß║ín', 'Follow', true, '2026-06-25 15:41:08.748681');
INSERT INTO public.notifications (id, userid, message, type, isread, createdat) VALUES ('9167b555-0555-44e8-95e4-8974e2edf081', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'Bß║ín nhß║¡n ─æ╞░ß╗úc mß╗Öt b├ái h├ít k├¿m lß╗¥i nhß║»n: test share', 'Share', true, '2026-06-27 04:16:12.76348');
INSERT INTO public.notifications (id, userid, message, type, isread, createdat) VALUES ('2d004978-4c2e-49d6-a5c5-a799b7112254', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'Bß║ín nhß║¡n ─æ╞░ß╗úc mß╗Öt b├ái h├ít k├¿m lß╗¥i nhß║»n: test share 1', 'Share', true, '2026-06-27 04:21:15.480296');
INSERT INTO public.notifications (id, userid, message, type, isread, createdat) VALUES ('94b2837b-d3cc-4911-bec9-4018665b45d0', 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'Bß║ín nhß║¡n ─æ╞░ß╗úc mß╗Öt b├ái h├ít k├¿m lß╗¥i nhß║»n: test share', 'Share', true, '2026-06-27 04:22:07.128759');


--
-- Data for Name: playlistitems; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.playlistitems (playlistid, mediaitemid, addedat) VALUES ('d5763cb6-232c-4725-be99-01b4428fafd3', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-22 02:24:46.474838');
INSERT INTO public.playlistitems (playlistid, mediaitemid, addedat) VALUES ('a289355a-e0e4-4551-b90f-df680063e5ad', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 02:50:39.464844');
INSERT INTO public.playlistitems (playlistid, mediaitemid, addedat) VALUES ('a289355a-e0e4-4551-b90f-df680063e5ad', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-22 09:40:04.898715');
INSERT INTO public.playlistitems (playlistid, mediaitemid, addedat) VALUES ('a289355a-e0e4-4551-b90f-df680063e5ad', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 09:13:20.308353');
INSERT INTO public.playlistitems (playlistid, mediaitemid, addedat) VALUES ('b423e862-a11a-4777-b501-61414d67f7a0', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-24 08:07:47.659982');
INSERT INTO public.playlistitems (playlistid, mediaitemid, addedat) VALUES ('b423e862-a11a-4777-b501-61414d67f7a0', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-24 08:08:33.749841');
INSERT INTO public.playlistitems (playlistid, mediaitemid, addedat) VALUES ('d66c5d95-ff73-41b6-825a-4160b1034c57', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-24 08:14:44.764951');
INSERT INTO public.playlistitems (playlistid, mediaitemid, addedat) VALUES ('1a2ab408-0d27-4416-8e23-1866c9336a83', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-24 08:19:10.169829');
INSERT INTO public.playlistitems (playlistid, mediaitemid, addedat) VALUES ('d66c5d95-ff73-41b6-825a-4160b1034c57', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-25 07:54:46.184736');
INSERT INTO public.playlistitems (playlistid, mediaitemid, addedat) VALUES ('b423e862-a11a-4777-b501-61414d67f7a0', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-25 07:55:16.218633');
INSERT INTO public.playlistitems (playlistid, mediaitemid, addedat) VALUES ('1a2ab408-0d27-4416-8e23-1866c9336a83', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-25 07:55:40.495519');
INSERT INTO public.playlistitems (playlistid, mediaitemid, addedat) VALUES ('d66c5d95-ff73-41b6-825a-4160b1034c57', '4f8e499d-5a28-4750-b482-705433101442', '2026-06-25 07:56:39.922344');
INSERT INTO public.playlistitems (playlistid, mediaitemid, addedat) VALUES ('b423e862-a11a-4777-b501-61414d67f7a0', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-25 07:57:11.794169');
INSERT INTO public.playlistitems (playlistid, mediaitemid, addedat) VALUES ('1a2ab408-0d27-4416-8e23-1866c9336a83', '79bcabbe-9122-4b69-9dbb-0ef347491b8a', '2026-06-25 07:57:39.668974');
INSERT INTO public.playlistitems (playlistid, mediaitemid, addedat) VALUES ('8d801a93-7e86-4247-86cb-9459ce711ae3', '101d067a-f72a-4117-ae9b-c460f2676616', '2026-06-25 15:22:18.674957');
INSERT INTO public.playlistitems (playlistid, mediaitemid, addedat) VALUES ('8d801a93-7e86-4247-86cb-9459ce711ae3', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-25 15:22:58.439249');


--
-- Data for Name: playlists; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.playlists (id, title, description, coverurl, ispublic, creatorid, createdat) VALUES ('d5763cb6-232c-4725-be99-01b4428fafd3', 'Danh sách phát của tôi #2', NULL, NULL, true, 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '2026-06-22 02:16:36.843311');
INSERT INTO public.playlists (id, title, description, coverurl, ispublic, creatorid, createdat) VALUES ('a289355a-e0e4-4551-b90f-df680063e5ad', 'Danh sách phát của tôi #4', '', NULL, true, 'cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '2026-06-22 02:50:32.098083');
INSERT INTO public.playlists (id, title, description, coverurl, ispublic, creatorid, createdat) VALUES ('b423e862-a11a-4777-b501-61414d67f7a0', 'Danh sách phát của tôi #1', NULL, NULL, true, '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '2026-06-24 08:06:48.785561');
INSERT INTO public.playlists (id, title, description, coverurl, ispublic, creatorid, createdat) VALUES ('d66c5d95-ff73-41b6-825a-4160b1034c57', 'Danh sách phát của tôi #2', NULL, NULL, true, '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '2026-06-24 08:14:36.924244');
INSERT INTO public.playlists (id, title, description, coverurl, ispublic, creatorid, createdat) VALUES ('1a2ab408-0d27-4416-8e23-1866c9336a83', 'Danh sách phát của tôi #3', NULL, NULL, true, '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '2026-06-24 08:19:00.286719');
INSERT INTO public.playlists (id, title, description, coverurl, ispublic, creatorid, createdat) VALUES ('8d801a93-7e86-4247-86cb-9459ce711ae3', 'Danh sách phát của tôi #1', NULL, NULL, true, '3fac27d4-2c89-4944-8581-3afda18836e9', '2026-06-25 15:22:03.70842');


--
-- Data for Name: userfollows; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.userfollows (followerid, followingid, followedat) VALUES ('cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '2026-06-24 04:15:07.116257');
INSERT INTO public.userfollows (followerid, followingid, followedat) VALUES ('31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '3fac27d4-2c89-4944-8581-3afda18836e9', '2026-06-25 15:41:08.481468');


--
-- Data for Name: userlikes; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.userlikes (userid, mediaitemid, likedat) VALUES ('cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'df8d37c0-4269-4a94-b8bf-74e1c563d266', '2026-06-23 09:13:14.4077');
INSERT INTO public.userlikes (userid, mediaitemid, likedat) VALUES ('cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'c1ae2388-83b6-49f2-b160-561f7dcc0cad', '2026-06-23 09:59:49.207432');
INSERT INTO public.userlikes (userid, mediaitemid, likedat) VALUES ('31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-24 08:07:32.833942');
INSERT INTO public.userlikes (userid, mediaitemid, likedat) VALUES ('cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '7aa5f2d0-9ebc-4001-8e19-096d4233e25d', '2026-06-20 02:46:35.907703');
INSERT INTO public.userlikes (userid, mediaitemid, likedat) VALUES ('3fac27d4-2c89-4944-8581-3afda18836e9', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-25 03:17:50.581462');
INSERT INTO public.userlikes (userid, mediaitemid, likedat) VALUES ('cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '1e32dca9-fd11-419b-b0cf-70f8c8b33950', '2026-06-22 02:43:18.529978');
INSERT INTO public.userlikes (userid, mediaitemid, likedat) VALUES ('cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'a4dd76cc-3ddb-4685-a62a-dfa7808358d6', '2026-06-22 10:47:30.351294');
INSERT INTO public.userlikes (userid, mediaitemid, likedat) VALUES ('cf2c405c-0b8a-4f7b-8a50-705f009ec92b', '75e2da89-1396-45bf-a0ef-9a0fef7b6e9c', '2026-06-22 12:02:35.429106');


--
-- Data for Name: userprofiles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.userprofiles (id, username, email, passwordhash, avatarurl, bio, role, createdat, updatedat) VALUES ('3fac27d4-2c89-4944-8581-3afda18836e9', 'admin', 'admin@gmail.com', '$2a$11$dj.VnycR6yu4LP1aKERDC.qbhvewFfszWLL7HggkD.G4ryXztmf4G', NULL, '', 'Admin', '2026-06-24 13:04:24.499233', NULL);
INSERT INTO public.userprofiles (id, username, email, passwordhash, avatarurl, bio, role, createdat, updatedat) VALUES ('36fb420f-5958-4301-a9bc-212aca66bb7a', 'Nguyễn Tấn Phát', 'nguyenphat65368@gmail.com', '', 'https://lh3.googleusercontent.com/a/ACg8ocKvpjvYvTJgLxxw3LnkqTTDoekyP9OFyfGtqvEIvH79FkyPQ8dx=s96-c', NULL, 'User', '2026-06-24 09:39:14.091883', NULL);
INSERT INTO public.userprofiles (id, username, email, passwordhash, avatarurl, bio, role, createdat, updatedat) VALUES ('1aabc36f-07d0-4737-a9a9-0a7a26628b74', 'abc', 'abc@gmail.com', '$2a$11$XHyNNKT8OcWcW7BDSsi2NO3cVjEGXmm1TkFVEp/2CMFZi4sPoF7Kq', NULL, NULL, 'User', '2026-06-27 02:30:01.315544', NULL);
INSERT INTO public.userprofiles (id, username, email, passwordhash, avatarurl, bio, role, createdat, updatedat) VALUES ('5318ce25-255e-4169-980c-f0d0de9e7342', 'test user', 'test@gmail.com', '$2a$11$XLIpKW3gVqPX8rPU2UNFo.I8nMxYjkS3lgrymLwSU4RiS/4pz2bPS', NULL, NULL, 'User', '2026-06-27 02:34:47.810532', NULL);
INSERT INTO public.userprofiles (id, username, email, passwordhash, avatarurl, bio, role, createdat, updatedat) VALUES ('cf2c405c-0b8a-4f7b-8a50-705f009ec92b', 'ntp', 'ntphat.131106@gmail.com', '$2a$11$DWL6Sdj1AeOB6WPLxcHPHO3tRjGkpnAOI5lbMOb1XhC/RW0IQN17C', 'https://lh3.googleusercontent.com/a/ACg8ocJ0L-MyF_MMW1rWV0nXCXESIE5lZqAnUG3V5YUtxmCIPwsq_A=s96-c', '', 'User', '2026-06-18 16:55:02.149845', '2026-06-24 09:42:42.969066');
INSERT INTO public.userprofiles (id, username, email, passwordhash, avatarurl, bio, role, createdat, updatedat) VALUES ('31fdf577-42ec-4d33-b3e7-47cd09cbbbdb', 'Nguyễn Phát', 'nguyenphat13112006@gmail.com', '$2a$11$72JGi97WDx2fmXtMYYn5XO8BH4LW7RAAiJg.Rt1QCCqlzsUbRpduC', 'https://lh3.googleusercontent.com/a/ACg8ocL_tK6BsTAS2EibEEa5BbWLDnl1x_y5GJH56mS-sD2OPy39iA=s96-c', '', 'User', '2026-06-18 17:57:27.34097', '2026-06-26 00:40:41.13257');


--
-- Name: albums albums_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT albums_pkey PRIMARY KEY (id);


--
-- Name: artistfollows artistfollows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artistfollows
    ADD CONSTRAINT artistfollows_pkey PRIMARY KEY (userid, artistid);


--
-- Name: artists artists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artists
    ADD CONSTRAINT artists_pkey PRIMARY KEY (id);


--
-- Name: listeninghistory listeninghistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listeninghistory
    ADD CONSTRAINT listeninghistory_pkey PRIMARY KEY (id);


--
-- Name: mediaitems mediaitems_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mediaitems
    ADD CONSTRAINT mediaitems_pkey PRIMARY KEY (id);


--
-- Name: mediashares mediashares_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mediashares
    ADD CONSTRAINT mediashares_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: playlistitems playlistitems_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlistitems
    ADD CONSTRAINT playlistitems_pkey PRIMARY KEY (playlistid, mediaitemid);


--
-- Name: playlists playlists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_pkey PRIMARY KEY (id);


--
-- Name: userfollows userfollows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.userfollows
    ADD CONSTRAINT userfollows_pkey PRIMARY KEY (followerid, followingid);


--
-- Name: userlikes userlikes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.userlikes
    ADD CONSTRAINT userlikes_pkey PRIMARY KEY (userid, mediaitemid);


--
-- Name: userprofiles userprofiles_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.userprofiles
    ADD CONSTRAINT userprofiles_email_key UNIQUE (email);


--
-- Name: userprofiles userprofiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.userprofiles
    ADD CONSTRAINT userprofiles_pkey PRIMARY KEY (id);


--
-- Name: userprofiles userprofiles_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.userprofiles
    ADD CONSTRAINT userprofiles_username_key UNIQUE (username);


--
-- Name: albums albums_artistid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT albums_artistid_fkey FOREIGN KEY (artistid) REFERENCES public.artists(id) ON DELETE CASCADE;


--
-- Name: artistfollows artistfollows_artistid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artistfollows
    ADD CONSTRAINT artistfollows_artistid_fkey FOREIGN KEY (artistid) REFERENCES public.artists(id) ON DELETE CASCADE;


--
-- Name: artistfollows artistfollows_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artistfollows
    ADD CONSTRAINT artistfollows_userid_fkey FOREIGN KEY (userid) REFERENCES public.userprofiles(id) ON DELETE CASCADE;


--
-- Name: listeninghistory listeninghistory_mediaitemid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listeninghistory
    ADD CONSTRAINT listeninghistory_mediaitemid_fkey FOREIGN KEY (mediaitemid) REFERENCES public.mediaitems(id) ON DELETE CASCADE;


--
-- Name: listeninghistory listeninghistory_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listeninghistory
    ADD CONSTRAINT listeninghistory_userid_fkey FOREIGN KEY (userid) REFERENCES public.userprofiles(id) ON DELETE CASCADE;


--
-- Name: mediaitems mediaitems_albumid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mediaitems
    ADD CONSTRAINT mediaitems_albumid_fkey FOREIGN KEY (albumid) REFERENCES public.albums(id) ON DELETE SET NULL;


--
-- Name: mediaitems mediaitems_artistid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mediaitems
    ADD CONSTRAINT mediaitems_artistid_fkey FOREIGN KEY (artistid) REFERENCES public.artists(id) ON DELETE SET NULL;


--
-- Name: mediaitems mediaitems_uploaderid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mediaitems
    ADD CONSTRAINT mediaitems_uploaderid_fkey FOREIGN KEY (uploaderid) REFERENCES public.userprofiles(id) ON DELETE CASCADE;


--
-- Name: mediashares mediashares_albumid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mediashares
    ADD CONSTRAINT mediashares_albumid_fkey FOREIGN KEY (albumid) REFERENCES public.albums(id) ON DELETE CASCADE;


--
-- Name: mediashares mediashares_mediaitemid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mediashares
    ADD CONSTRAINT mediashares_mediaitemid_fkey FOREIGN KEY (mediaitemid) REFERENCES public.mediaitems(id) ON DELETE CASCADE;


--
-- Name: mediashares mediashares_playlistid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mediashares
    ADD CONSTRAINT mediashares_playlistid_fkey FOREIGN KEY (playlistid) REFERENCES public.playlists(id) ON DELETE CASCADE;


--
-- Name: mediashares mediashares_receiverid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mediashares
    ADD CONSTRAINT mediashares_receiverid_fkey FOREIGN KEY (receiverid) REFERENCES public.userprofiles(id) ON DELETE CASCADE;


--
-- Name: mediashares mediashares_senderid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mediashares
    ADD CONSTRAINT mediashares_senderid_fkey FOREIGN KEY (senderid) REFERENCES public.userprofiles(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_userid_fkey FOREIGN KEY (userid) REFERENCES public.userprofiles(id) ON DELETE CASCADE;


--
-- Name: playlistitems playlistitems_mediaitemid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlistitems
    ADD CONSTRAINT playlistitems_mediaitemid_fkey FOREIGN KEY (mediaitemid) REFERENCES public.mediaitems(id) ON DELETE CASCADE;


--
-- Name: playlistitems playlistitems_playlistid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlistitems
    ADD CONSTRAINT playlistitems_playlistid_fkey FOREIGN KEY (playlistid) REFERENCES public.playlists(id) ON DELETE CASCADE;


--
-- Name: playlists playlists_creatorid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_creatorid_fkey FOREIGN KEY (creatorid) REFERENCES public.userprofiles(id) ON DELETE CASCADE;


--
-- Name: userfollows userfollows_followerid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.userfollows
    ADD CONSTRAINT userfollows_followerid_fkey FOREIGN KEY (followerid) REFERENCES public.userprofiles(id) ON DELETE CASCADE;


--
-- Name: userfollows userfollows_followingid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.userfollows
    ADD CONSTRAINT userfollows_followingid_fkey FOREIGN KEY (followingid) REFERENCES public.userprofiles(id) ON DELETE CASCADE;


--
-- Name: userlikes userlikes_mediaitemid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.userlikes
    ADD CONSTRAINT userlikes_mediaitemid_fkey FOREIGN KEY (mediaitemid) REFERENCES public.mediaitems(id) ON DELETE CASCADE;


--
-- Name: userlikes userlikes_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.userlikes
    ADD CONSTRAINT userlikes_userid_fkey FOREIGN KEY (userid) REFERENCES public.userprofiles(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict dY53G7XNUdzOGTBhHCarWZvczT1hj0WbLWBB9G3aWmnIxRc7a8tjU7VBOsrmAwD

