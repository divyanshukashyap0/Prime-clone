import { Link } from "react-router-dom";
import { Play, Plus, Star, Info, Volume2, XCircle, Film, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Movie } from "@/data/movies";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { ThumbsUp, Check } from "lucide-react";

interface MovieCardProps {
  movie: Movie & { playbackProgress?: number; playbackDuration?: number };
  index?: number;
}

export default function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const { preferences, toggleWatchlist, toggleLike } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimer = useState<ReturnType<typeof setTimeout> | null>(null);

  // Dismiss hover card on any scroll to keep cursor free
  useEffect(() => {
    const onScroll = () => setIsHovered(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMouseEnter = () => {
    // Small delay so scrolling past cards doesn't accidentally trigger hover
    const timer = setTimeout(() => setIsHovered(true), 200);
    hoverTimer[1](timer);
  };

  const handleMouseLeave = () => {
    if (hoverTimer[0]) clearTimeout(hoverTimer[0]);
    setIsHovered(false);
  };

  return (
    <div
      className="relative flex-shrink-0 w-[160px] sm:w-[200px] md:w-[260px] lg:w-[300px] z-10"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link to={`/movie/${movie.id}`} className="block">
        <div className="relative aspect-[16/9] rounded-md overflow-hidden bg-[#1b252f] border border-white/5 shadow-lg group">
          <img
            src={movie.backdrop_path || movie.poster_path || "/logo.png"}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/logo.png";
              target.classList.add("p-8", "opacity-20", "object-contain");
            }}
          />
          <div className="absolute top-2 left-2">
            <img src="/logo.png" alt="Prime" className="h-4 shadow-xl" />
          </div>
          {movie.playbackProgress && movie.playbackDuration && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full bg-[#00a8e1] transition-all duration-300"
                style={{ width: `${((movie.playbackProgress || 0) / (movie.playbackDuration || 1)) * 100}%` }}
              />
            </div>
          )}
        </div>
        <div className="mt-2 px-1">
          <h3 className="text-sm md:text-base font-bold text-white truncate group-hover:text-[#00a8e1] transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-[#8197a4] mt-0.5 font-bold">
            <span className="text-[#00a8e1]">Included with Prime</span>
          </div>
        </div>
      </Link>

      {/* Expanding Card on Hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1.05, y: -10 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-0 left-0 w-full bg-[#1b252f] rounded-lg shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] z-[100] border border-white/10 pointer-events-auto"
            style={{ width: "100%", left: "0" }}
          >
            <Link to={`/movie/${movie.id}`}>
              <div className="relative aspect-[16/9]">
                <img
                  src={movie.backdrop_path || movie.poster_path || "/logo.png"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/logo.png";
                    target.classList.add("opacity-10", "object-contain", "p-8");
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1b252f] via-transparent to-transparent" />
                <div className="absolute top-3 right-3">
                  <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white"><Volume2 size={14} /></div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Action Buttons Row */}
                <div className="space-y-3">
                  <button className="w-full bg-white text-black font-bold py-2.5 rounded-md flex items-center justify-center gap-2 hover:bg-white/90 transition-colors">
                    <Play size={20} fill="black" /> View Now
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWatchlist(movie.id);
                        toast.success(preferences.watchlist.includes(movie.id) ? "Removed from Watchlist" : "Added to Watchlist");
                      }}
                      className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${preferences.watchlist.includes(movie.id)
                        ? "bg-[#00a8e1] border-[#00a8e1] text-white"
                        : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                        }`}
                      title="Watchlist"
                    >
                      {preferences.watchlist.includes(movie.id) ? <Check size={20} /> : <Plus size={20} />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleLike(movie.id);
                        if (!preferences.likes.includes(movie.id)) toast.success("Added to Liked Videos");
                      }}
                      className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${preferences.likes.includes(movie.id)
                        ? "bg-[#00a8e1] border-[#00a8e1] text-white"
                        : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                        }`}
                      title="I like this"
                    >
                      <ThumbsUp size={18} className={preferences.likes.includes(movie.id) ? "fill-white" : ""} />
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.info("Trailer playback coming soon!"); }}
                      className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors" title="Watch Trailer"
                    >
                      <Film size={18} />
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast.info("Feedback captured"); }}
                      className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors ml-auto" title="Not Interested"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[#00a8e1] font-black text-xs uppercase tracking-tight">Included with Prime</span>
                  </div>

                  <h3 className="font-bold text-lg leading-tight text-white">{movie.title}</h3>

                  {movie.vote_average > 8.5 && (
                    <div className="flex items-center gap-1.5 text-[#46d369] font-bold text-sm">
                      <TrendingUp size={14} />
                      <span>#{index + 1} in India</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs font-bold text-[#8197a4]">
                    <span className="text-white bg-white/10 px-1.5 py-0.5 rounded-sm border border-white/20">{movie.maturityRating}</span>
                    <span>{movie.release_date}</span>
                    <span>{movie.duration}</span>
                    <div className="w-3 h-3 rounded-full border border-[#8197a4] flex items-center justify-center ml-auto">
                      <Info size={8} />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#8197a4] line-clamp-2 leading-relaxed font-medium">
                  {movie.overview}
                </p>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
