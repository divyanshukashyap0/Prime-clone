import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Info, ChevronLeft, ChevronRight, Plus, Volume2, VolumeX, TrendingUp, Check, Film } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Movie } from "@/data/movies";
import { useAuth } from "@/context/AuthContext";
import { ThumbsUp, ThumbsDown, Share2, Download as DownloadIcon } from "lucide-react";

import { loadYTApi } from "@/lib/youtube";

interface HeroSliderProps {
  movies?: Movie[];
}

export default function HeroSlider({ movies: propMovies }: HeroSliderProps) {
  const { preferences, toggleWatchlist, toggleLike, toggleDislike, toggleDownload } = useAuth();
  const displayMovies = (propMovies && propMovies.length > 0) ? propMovies : [];
  const [current, setCurrent] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const total = displayMovies.length;
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);

  useEffect(() => {
    setCurrent(0);
    setIsVideoReady(false);
  }, [displayMovies]);

  const initPlayer = useCallback(async (videoId: string) => {
    if (!videoId) return;
    await loadYTApi();
    if (!playerContainerRef.current) return;

    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch (e) { /* ignore */ }
      playerRef.current = null;
    }

    const container = document.createElement('div');
    playerContainerRef.current.innerHTML = '';
    playerContainerRef.current.appendChild(container);

    playerRef.current = new (window as any).YT.Player(container, {
      width: '100%',
      height: '100%',
      videoId,
      playerVars: {
        autoplay: 1,
        mute: 1,
        controls: 0,
        loop: 1,
        playlist: videoId,
        rel: 0,
        modestbranding: 1,
        iv_load_policy: 3,
        disablekb: 1,
        showinfo: 0,
        vq: 'hd1080',
      },
      events: {
        onStateChange: (event: any) => {
          if (event.data === (window as any).YT.PlayerState.PLAYING) {
            setIsVideoReady(true);
          }
        },
        onReady: (event: any) => {
          event.target.mute();
          event.target.playVideo();
        }
      }
    });
  }, []);

  useEffect(() => {
    if (displayMovies[current]?.youtubeId) {
      initPlayer(displayMovies[current].youtubeId!);
    }
    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) { /* ignore */ }
        playerRef.current = null;
      }
    };
  }, [current, displayMovies, initPlayer]);

  const next = useCallback(() => {
    if (total === 0) return;
    setCurrent((c) => (c + 1) % total);
    setIsVideoReady(false);
  }, [total]);

  const prev = useCallback(() => {
    if (total === 0) return;
    setCurrent((c) => (c - 1 + total) % total);
    setIsVideoReady(false);
  }, [total]);

  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(next, 60000); // 1 minute stability
    return () => clearInterval(id);
  }, [next, total]);

  // Pointer-based swipe handlers (works for mouse drag AND touch)
  const onPointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    if (Math.abs(delta) > 50) {
      delta < 0 ? next() : prev();
    }
    dragStartX.current = null;
  };

  if (total === 0) return null;

  const movie = displayMovies[current];
  const trailerId = movie.youtubeId;

  return (
    <section
      className="relative w-full h-[85vh] lg:h-screen overflow-hidden bg-black select-none cursor-grab active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={() => { dragStartX.current = null; }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={movie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          {/* Backdrop Image (Always shown as background) */}
          <img
            src={movie.backdrop_path || movie.poster_path || "/logo.png"}
            alt={movie.title}
            className={`w-full h-full object-cover object-top md:object-center absolute inset-0 transition-opacity duration-1000 ${isVideoReady ? 'opacity-0' : 'opacity-100'}`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/logo.png";
              target.classList.add("opacity-10", "object-contain", "p-20");
            }}
          />

          {/* Background Video (Autoplay Muted Trailer) */}
          {movie.youtubeId && (
            <div className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden transition-opacity duration-1000 ${isVideoReady ? 'opacity-80' : 'opacity-0'}`}>
              <div ref={playerContainerRef} className="w-full h-full border-none scale-[1.3] origin-center" />
            </div>
          )}

          {/* Prime Style Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent w-full md:w-[60%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f171e] via-[#0f171e]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Hero Content — anchored to bottom so nothing is clipped */}
      <div className="absolute inset-0 flex items-end pb-16 md:pb-20 px-4 md:px-12">
        <div className="max-w-3xl flex flex-col gap-3 md:gap-4 z-20">
          <motion.div
            key={`content-${movie.id}`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-3 md:space-y-4"
          >
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Prime" className="h-4 md:h-5" />
              <span className="text-white font-bold text-xs tracking-widest uppercase opacity-70">Original Series</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
              {movie.title}
            </h1>

            <div className="flex items-center flex-wrap gap-3 text-white font-bold">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-md backdrop-blur-sm border border-white/10">
                <TrendingUp size={14} className="text-[#00a8e1]" />
                <span className="text-xs">#1 Trending</span>
              </div>
              <span className="text-xs opacity-80">{movie.release_date} • {movie.duration} • {movie.maturityRating}</span>
            </div>

            <p className="text-[#8197a4] text-sm md:text-base max-w-2xl font-medium leading-relaxed line-clamp-2">
              {movie.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center flex-wrap gap-3">
              <Link
                to={`/movie/${movie.id}?autoplay=true`}
                className="group flex flex-col justify-center bg-white border border-white hover:bg-[#00a8e1] hover:border-[#00a8e1] transition-all px-6 py-2.5 rounded min-w-[200px] shadow-2xl"
              >
                <div className="flex items-center gap-2">
                  <Play size={18} fill="currentColor" className="text-[#0f171e] group-hover:text-white" />
                  <span className="text-[#0f171e] group-hover:text-white font-black text-base block leading-none">
                    {movie.type === 'tv-show' ? 'Watch Season 1' : 'Play Now'}
                  </span>
                </div>
                <span className="text-[#0f171e] group-hover:text-white text-xs font-bold opacity-70 block ml-6">Watch with a Prime membership</span>
              </Link>

              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={() => {
                    toggleWatchlist(movie.id);
                    toast.success(preferences.watchlist.includes(movie.id) ? "Removed from Watchlist" : "Added to Watchlist");
                  }}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-sm group border ${preferences.watchlist.includes(movie.id)
                      ? "bg-[#00a8e1] border-[#00a8e1] text-white"
                      : "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                    }`}
                  title="Watchlist"
                >
                  {preferences.watchlist.includes(movie.id) ? (
                    <Check size={20} className="scale-110" />
                  ) : (
                    <Plus size={20} className="group-hover:scale-110 transition-transform" />
                  )}
                </button>

                <button
                  onClick={() => {
                    toggleLike(movie.id);
                    if (!preferences.likes.includes(movie.id)) toast.success("Added to Liked Videos");
                  }}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-sm group border ${preferences.likes.includes(movie.id)
                      ? "bg-[#00a8e1] border-[#00a8e1] text-white"
                      : "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                    }`}
                  title="I like this"
                >
                  <ThumbsUp size={20} className={preferences.likes.includes(movie.id) ? "fill-white" : "group-hover:scale-110 transition-transform"} />
                </button>

                <button
                  onClick={() => {
                    toggleDislike(movie.id);
                    if (!preferences.dislikes.includes(movie.id)) toast.info("Marked as Not for me");
                  }}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-sm group border ${preferences.dislikes.includes(movie.id)
                      ? "bg-[#00a8e1] border-[#00a8e1] text-white"
                      : "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                    }`}
                  title="Not for me"
                >
                  <ThumbsDown size={20} className={preferences.dislikes.includes(movie.id) ? "fill-white" : "group-hover:scale-110 transition-transform"} />
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + `/movie/${movie.id}`);
                    toast.success("Link copied to clipboard");
                  }}
                  className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all shadow-lg backdrop-blur-sm group"
                  title="Share"
                >
                  <Share2 size={20} className="group-hover:scale-110 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    toggleDownload(movie.id);
                    toast.success("Download started...");
                  }}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-sm group border ${preferences.downloads.includes(movie.id)
                      ? "bg-[#00a8e1] border-[#00a8e1] text-white"
                      : "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                    }`}
                  title="Download"
                >
                  <DownloadIcon size={20} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Slide Indicator Dots */}
      <div className="absolute bottom-6 left-12 flex gap-2 z-30">
        {displayMovies.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1 rounded-full transition-all duration-500 ${i === current ? "w-10 bg-[#00a8e1]" : "w-6 bg-white/40"}`}
          />
        ))}
      </div>
    </section>
  );
}
