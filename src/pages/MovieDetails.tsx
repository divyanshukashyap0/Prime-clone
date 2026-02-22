import { useParams, Link } from "react-router-dom";
import { Play, Plus, Star, ArrowLeft, Clock, Calendar, X, Film, ThumbsUp, ThumbsDown, Share2, Download, Info, Check, ChevronRight, Layout } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import MovieCard from "@/components/MovieCard";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import { useMovies } from "@/hooks/useMovies";
import VolumeBoosterHint from "@/components/VolumeBoosterHint";
import VideoPlayer from "@/components/VideoPlayer";

export default function MovieDetails() {
  const { id } = useParams();
  const { data: movies = [], isLoading } = useMovies();

  const movie = movies.find((m) => m.id === id);
  const [showPlayer, setShowPlayer] = useState(false);
  const [playerUrl, setPlayerUrl] = useState("");
  const isTVShow = movie.type === "tv-show";
  const [activeTab, setActiveTab] = useState(isTVShow ? "episodes" : "trailers");
  const [selectedSeasonIdx, setSelectedSeasonIdx] = useState(0);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("playTrailer") === "true") {
      setActiveTab("trailers");
    }

    if (params.get("autoplay") === "true" && movie) {
      const url = isTVShow
        ? (movie.seasons?.[0]?.episodes?.[0]?.videoUrl || "")
        : (movie.movieDriveID || "");

      if (url) {
        handlePlay(url);
      }
    }
  }, [movie, isTVShow]);

  const handlePlay = (url: string) => {
    if (!url) {
      alert("Video URL not found for this content.");
      return;
    }
    setPlayerUrl(url);
    setShowPlayer(true);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0f171e] flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Movie Not Found</h1>
          <Link to="/" className="text-[#00a8e1] hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  const hasSeasons = movie.type === "tv-show" && movie.seasons && movie.seasons.length > 0;
  const currentSeason = hasSeasons ? movie.seasons[selectedSeasonIdx] : null;

  const similar = movies.filter((m) => m.id !== movie.id && (m.genres || []).some((g) => (movie.genres || []).includes(g)));

  return (
    <div className="min-h-screen bg-[#0f171e] text-white">
      <Navbar />
      {/* Hero Banner — Back-to-top layout to avoid cropping */}
      <div className="relative min-h-[85vh] flex flex-col justify-end">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={movie.backdrop_path || movie.poster_path || "/logo.png"}
            alt={movie.title}
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/logo.png";
              target.classList.add("opacity-10", "object-contain", "p-20");
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f171e] via-[#0f171e]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f171e] via-transparent to-transparent" />
        </div>

        {/* Info Overlay (Screenshot 4 style) */}
        <div className="relative z-10 px-4 md:px-16 pb-12 pt-32 md:pt-40 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white capitalize tracking-tight">
              {movie.title}
            </h1>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-4">
              {(movie.allowPlayback !== false) && (
                <button
                  onClick={() => handlePlay(isTVShow ? (movie.seasons?.[0]?.episodes?.[0]?.videoUrl || "") : (movie.movieDriveID || ""))}
                  className="flex items-center gap-3 bg-white text-black font-black px-10 py-4 rounded hover:bg-white/90 transition-all text-lg"
                >
                  <Play size={24} fill="black" /> {movie.type === "tv-show" ? "Watch S1 E1" : "View Now"}
                </button>
              )}

              {movie.isPublished === false && (
                <div className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded text-yellow-500 font-bold text-sm">
                  Unpublished (Draft)
                </div>
              )}

              <div className="flex items-center gap-1.5">
                {[
                  { icon: <Plus size={24} />, label: "Watchlist", action: () => toast.success("Added to Watchlist") },
                  { icon: <ThumbsUp size={24} />, label: "Like", action: () => toast.success("Added to Liked Videos") },
                  { icon: <ThumbsDown size={24} />, label: "Dislike", action: () => toast.info("Feedback received") },
                  { icon: <Share2 size={24} />, label: "Share", action: () => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied to clipboard!"); } },
                  ...(movie.allowDownload !== false ? [{ icon: <Download size={24} />, label: "Download", action: () => toast.info("Download started...") }] : []),
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={action.action}
                    className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors group relative"
                  >
                    {action.icon}
                    <span className="absolute -bottom-8 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Metadata (Dual line like Screenshot 4) */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5 text-lg font-bold text-[#8197a4]">
                {(movie.genres || []).map((genre, i) => (
                  <span key={genre} className="flex items-center gap-1.5">
                    <span className="text-white hover:text-[#00a8e1] cursor-pointer transition-colors">{genre}</span>
                    {i < movie.genres.length - 1 && <span className="text-[#303c44]">•</span>}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-[#8197a4] font-bold">
                <span className="flex items-center gap-1 text-[#46d369]">
                  <Star size={18} fill="currentColor" /> Match
                </span>
                <span>{movie.release_date}</span>
                <span>{movie.duration}</span>
                <span className="px-1.5 py-0.5 bg-white/10 text-white text-xs border border-white/20 rounded">
                  {movie.maturityRating}
                </span>
                <span className="w-5 h-5 flex items-center justify-center border border-white/30 rounded text-[10px]">CC</span>
              </div>
            </div>

            <p className="text-white/80 text-xl leading-relaxed max-w-3xl font-medium">
              {movie.overview}
            </p>

            {/* Cast & Director (Short List) */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
              {movie.director && (
                <div className="text-sm font-bold">
                  <span className="text-[#8197a4]">Director: </span>
                  <span className="text-[#00a8e1]">{movie.director}</span>
                </div>
              )}
              {movie.cast && movie.cast.length > 0 && (
                <div className="text-sm font-bold">
                  <span className="text-[#8197a4]">Starring: </span>
                  <span className="text-white">{movie.cast.join(", ")}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tabs and Custom Sections (Screenshot 5) */}
      <div className="px-4 md:px-16 pb-20 mt-8">
        {/* Tab Headers */}
        <div className="flex items-center gap-8 border-b border-[#303c44] mb-8">
          {["episodes", "trailers", "related", "details"].filter(t => t !== "episodes" || isTVShow).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-xl font-bold capitalize transition-all relative ${activeTab === tab ? "text-white" : "text-[#8197a4] hover:text-white"
                }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-white" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === "episodes" && (
            <div className="space-y-10">
              {hasSeasons ? (
                <>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <button
                        onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                        className="bg-[#1b252f]/80 hover:bg-[#1b252f] text-white font-bold p-4 py-3 rounded border border-white/10 outline-none hover:border-[#00a8e1] transition-all cursor-pointer min-w-[220px] text-lg flex items-center justify-between group"
                      >
                        <span className="flex items-center gap-2">
                          <Layout size={18} className="text-[#00a8e1]" />
                          Season {movie.seasons![selectedSeasonIdx].seasonNumber}
                        </span>
                        <motion.div
                          animate={{ rotate: isSeasonDropdownOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight size={20} className="rotate-90 group-hover:text-[#00a8e1] transition-colors" />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {isSeasonDropdownOpen && (
                          <>
                            {/* Backdrop to close dropdown */}
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setIsSeasonDropdownOpen(false)}
                            />
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-full left-0 mt-2 w-full bg-[#1b252f] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden py-2"
                            >
                              {movie.seasons!.map((s, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setSelectedSeasonIdx(idx);
                                    setIsSeasonDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-5 py-3 hover:bg-white/5 transition-colors flex items-center justify-between group ${selectedSeasonIdx === idx ? "text-[#00a8e1]" : "text-white"
                                    }`}
                                >
                                  <span className="font-bold">Season {s.seasonNumber}</span>
                                  {selectedSeasonIdx === idx && (
                                    <Check size={18} />
                                  )}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                    <span className="text-[#8197a4] font-bold tracking-wide">{currentSeason?.episodes.length} Episodes</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {currentSeason?.episodes.map((ep) => (
                      <motion.div
                        key={ep.episodeNumber}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group cursor-pointer space-y-3"
                        onClick={() => handlePlay(ep.videoUrl)}
                      >
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-white/5 shadow-xl">
                          <img
                            src={ep.thumbnailUrl || movie.poster_path}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                              <Play size={24} fill="white" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] font-black text-white">
                            {ep.duration || "45m"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-lg group-hover:text-[#00a8e1] transition-colors line-clamp-1">
                              {ep.episodeNumber}. {ep.title || `Episode ${ep.episodeNumber}`}
                            </h4>
                          </div>
                          <p className="text-sm text-[#8197a4] line-clamp-3 leading-relaxed font-medium">
                            {ep.description || `Watch Episode ${ep.episodeNumber} of ${movie.title}.`}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-20 bg-[#1b252f]/30 rounded-2xl border border-dashed border-[#303c44]">
                  <p className="text-xl text-[#8197a4] font-bold">This content is not episodic or seasons haven't been added yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "trailers" && (
            <div className="space-y-8">
              {movie.youtubeId ? (
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black relative">
                    <iframe
                      src={`https://www.youtube.com/embed/${movie.youtubeId}?autoplay=0&rel=0&modestbranding=1&iv_load_policy=3&showinfo=0`}
                      className="w-full h-full border-none scale-[1.15] origin-center"
                      allowFullScreen
                      allow="autoplay; encrypted-media"
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <Film size={24} className="text-[#00a8e1]" /> Official Trailer: {movie.title}
                    </h3>
                    <p className="text-[#8197a4] text-lg max-w-2xl">
                      Watch the official trailer and exclusive clips for {movie.title}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 bg-[#1b252f]/30 rounded-2xl border border-dashed border-[#303c44]">
                  <Film size={48} className="mx-auto mb-4 text-[#8197a4] opacity-50" />
                  <p className="text-xl text-[#8197a4] font-bold">No trailer available for this title yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "related" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {similar.slice(0, 5).map((m, i) => (
                <MovieCard key={m.id} movie={m} index={i} />
              ))}
            </div>
          )}

          {activeTab === "details" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-sm leading-relaxed">
              <div className="space-y-6">
                <div>
                  <h4 className="text-[#8197a4] font-bold mb-2">Director</h4>
                  <p className="text-white/80">{movie.director || "Deepak Kumar Mishra"}</p>
                </div>
                <div>
                  <h4 className="text-[#8197a4] font-bold mb-2">Starring</h4>
                  <p className="text-white/80">
                    {movie.cast?.join(", ") || ""}
                  </p>
                </div>
                <div>
                  <h4 className="text-[#8197a4] font-bold mb-2">Genres</h4>
                  <p className="text-white/80">{movie.genres.join(", ")}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-[#8197a4] font-bold mb-2">Audio Languages</h4>
                  <p className="text-white/80 flex items-center gap-2">
                    <Check size={14} className="text-[#00a8e1]" /> Hindi, Hindi Dialogue Boost: Medium
                  </p>
                </div>
                <div>
                  <h4 className="text-[#8197a4] font-bold mb-2">Maturity Rating</h4>
                  <p className="text-white/80">
                    {movie.maturityRating} (Recommended for {movie.maturityRating === "A" ? "18+" : movie.maturityRating})
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-[#8197a4] font-bold mb-2">Subtitles</h4>
                  <p className="text-white/80">Hindi [CC], English [CC], French (auto), Malay, Portuguese [Brazil]</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
      <VolumeBoosterHint />

      {/* Video Player Modal */}
      <AnimatePresence>
        {showPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
          >
            <button
              onClick={() => setShowPlayer(false)}
              className="absolute top-6 right-6 z-[210] w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all shadow-2xl backdrop-blur-md"
            >
              <X size={24} />
            </button>
            <div className="w-full h-full relative overflow-hidden">
              <VideoPlayer
                url={playerUrl}
                poster={movie.backdrop_path || movie.poster_path}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
}
