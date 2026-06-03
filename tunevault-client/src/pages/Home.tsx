import { usePlayer } from '../context/PlayerContext';

export const Home = () => {
  const { playMedia } = usePlayer();

  const dummyTrack = {
    id: "00000000-0000-0000-0000-000000000000",
    title: "Test Track (Range Request Demo)",
    fileUrl: "/media/test.mp3",
    mediaType: "Audio",
    duration: "00:03:20",
    uploaderId: "",
    createdAt: new Date().toISOString()
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-white">Good evening</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => playMedia(dummyTrack)}
          className="bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-800 transition cursor-pointer group"
        >
          <div className="w-full aspect-square bg-zinc-700 rounded-md mb-4 shadow-lg flex items-center justify-center group-hover:shadow-xl transition">
            <span className="text-zinc-500 font-bold">Album Art</span>
          </div>
          <h3 className="font-semibold text-white truncate">{dummyTrack.title}</h3>
          <p className="text-sm text-zinc-400 mt-1 truncate">Click to test stream</p>
        </div>
      </div>
    </div>
  );
};
