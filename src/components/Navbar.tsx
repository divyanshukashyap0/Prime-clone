import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Grid, Bookmark, User, LayoutGrid, X, Plus, HelpCircle, Settings, LogOut, Edit3, Monitor, Film } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useMovies } from "@/hooks/useMovies";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Movies", to: "/movies" },
  { label: "TV Shows", to: "/tv-shows" },
  { label: "Live TV", to: "/live-tv" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { logout, user } = useAuth();
  const { data: movies = [] } = useMovies();

  const searchResults = searchValue.length > 1
    ? movies.filter(m => {
      const titleMatch = (m.title || "").toLowerCase().includes(searchValue.toLowerCase());
      const genresMatch = Array.isArray(m.genres) && m.genres.some(g => typeof g === "string" && g.toLowerCase().includes(searchValue.toLowerCase()));
      return titleMatch || genresMatch;
    }).slice(0, 5)
    : [];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchFocused(false);
      setSearchValue("");
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-start justify-between px-4 md:px-12 pt-5 pointer-events-none transition-all duration-700 h-[160px] ${scrolled
        ? "bg-gradient-to-b from-[#0f171e] via-[#0f171e]/70 to-transparent"
        : "bg-gradient-to-b from-black/80 via-black/20 to-transparent"
        }`}
    >
      <div className="pointer-events-auto flex items-center gap-8">
        <Link to="/" className="flex items-center shrink-0">
          <img
            src="/logo.png"
            alt="Prime Video"
            className="h-6 md:h-8"
          />
        </Link>

        <div className={`hidden lg:flex items-center gap-6 h-full transition-all duration-300 ${searchFocused ? "opacity-30 blur-sm scale-95 pointer-events-none" : "opacity-100"}`}>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`text-[15px] font-extrabold transition-all hover:text-white border-b-2 py-6 ${location.pathname === link.to
                ? "text-white border-[#00a8e1]"
                : "text-[#8197a4] border-transparent"
                }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/subscriptions"
            className={`text-[15px] font-extrabold transition-all hover:text-white border-b-2 py-6 ${location.pathname === "/subscriptions"
              ? "text-white border-[#00a8e1]"
              : "text-[#8197a4] border-transparent"
              }`}
          >
            Subscriptions
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Expandable Search */}
        <div
          className={`relative flex items-center transition-all duration-500 ease-in-out pointer-events-auto ${searchFocused ? "w-[300px] md:w-[450px]" : "w-10"
            }`}
        >
          <form
            onSubmit={handleSearchSubmit}
            className={`absolute right-0 flex items-center w-full h-10 rounded-md transition-all ${searchFocused ? "bg-white/10 ring-1 ring-white/20" : "bg-transparent"}`}
          >
            <button
              type="submit"
              onClick={() => {
                if (!searchFocused) {
                  setSearchFocused(true);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }
              }}
              className="p-2 text-white hover:scale-110 transition-transform"
            >
              <Search size={22} strokeWidth={2.5} />
            </button>

            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search content, actors, genres..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => {
                // Delay blur to allow clicking results
                setTimeout(() => {
                  if (!searchValue) setSearchFocused(false);
                }, 200);
              }}
              className={`bg-transparent text-white text-sm font-medium w-full outline-none transition-all ${searchFocused ? "opacity-100 px-1" : "opacity-0 w-0"
                }`}
            />

            {searchFocused && (
              <button
                type="button"
                onClick={() => {
                  setSearchValue("");
                  setSearchFocused(false);
                }}
                className="p-2 text-[#8197a4] hover:text-white"
              >
                <X size={20} />
              </button>
            )}

            {/* Live Search Results Dropsown */}
            <AnimatePresence>
              {searchFocused && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 left-0 right-0 bg-[#1a242f] border border-white/10 rounded-lg shadow-2xl overflow-hidden overflow-y-auto max-h-[400px]"
                >
                  <div className="p-2 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-[#8197a4]">
                    Top Results
                  </div>
                  {searchResults.map((item) => (
                    <Link
                      key={item.id}
                      to={`/movie/${item.id}`}
                      onClick={() => {
                        setSearchValue("");
                        setSearchFocused(false);
                      }}
                      className="flex items-center gap-4 p-3 hover:bg-white/5 transition-colors group"
                    >
                      <img
                        src={item.poster_path}
                        alt={item.title}
                        className="w-12 h-16 object-cover rounded shadow-md group-hover:scale-105 transition-transform"
                      />
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-sm text-white group-hover:text-[#00a8e1] transition-colors line-clamp-1">{item.title}</span>
                        <div className="flex items-center gap-2 text-[10px] text-[#8197a4] font-bold">
                          <span>{item.type === "movie" ? "Movie" : "TV Show"}</span>
                          <span>•</span>
                          <span>{item.release_date}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full p-3 text-center text-[#00a8e1] text-xs font-bold hover:bg-white/5 border-t border-white/5 transition-all"
                  >
                    See all results for "{searchValue}"
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        <div className={`pointer-events-auto flex items-center gap-6 transition-all duration-300 ${searchFocused ? "opacity-0 translate-x-10 pointer-events-none" : "opacity-100"}`}>
          <Link to="/mystuff" className="text-[#8197a4] hover:text-white transition-colors">
            <Bookmark size={24} strokeWidth={2.5} />
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setIsProfileOpen(true)}
            onMouseLeave={() => setIsProfileOpen(false)}
          >
            <button
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00a8e1] to-[#60c9ff] flex items-center justify-center border border-white/20 overflow-hidden hover:ring-2 ring-[#00a8e1] transition-all overflow-hidden"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={22} className="text-white" />
              )}
            </button>

            {/* Redesigned 2-Column Dropdown (Screenshot 3) */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 w-[520px] bg-[#1a242f]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex z-50"
                >
                  {/* Left Column: Your Account */}
                  <div className="flex-1 p-6 border-r border-white/5">
                    <h4 className="text-[#8197a4] text-xs font-black uppercase tracking-widest mb-6">Your Account</h4>
                    <div className="space-y-4">
                      <Link to="/help" className="flex items-center gap-3 text-white/90 hover:text-white font-bold transition-colors">
                        help
                      </Link>
                      <Link to="/watch-anywhere" className="flex items-center gap-3 text-white/90 hover:text-white font-bold transition-colors">
                        View Anywhere
                      </Link>
                      <Link to="/account" className="flex items-center gap-3 text-white/90 hover:text-white font-bold transition-colors">
                        Account & Settings
                      </Link>
                      <button
                        onClick={() => logout()}
                        className="flex items-center gap-3 text-white/90 hover:text-white font-bold transition-colors w-full text-left"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Profile */}
                  <div className="flex-1 p-6 bg-white/5">
                    <h4 className="text-[#8197a4] text-xs font-black uppercase tracking-widest mb-6">Profile</h4>
                    <div className="space-y-4">
                      <Link to="/profiles/new" className="flex items-center gap-3 text-white/90 hover:text-white font-bold transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                          <Plus size={16} />
                        </div>
                        Add new
                      </Link>
                      <Link to="/profiles/edit" className="flex items-center gap-3 text-white/90 hover:text-white font-bold transition-colors">
                        Edit Profile
                      </Link>
                      <Link to="/profiles/learn-more" className="flex items-center gap-3 text-white/90 hover:text-white font-bold transition-colors">
                        Learn More
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}
