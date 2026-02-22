import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Grid, Bookmark, User, LayoutGrid, X, Plus, HelpCircle, Settings, LogOut, Edit3, Monitor, Film } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useMovies } from "@/hooks/useMovies";
import { toast } from "sonner";

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
  const { logout, user, preferences, activeProfile, switchProfile } = useAuth();
  const { data: movies = [] } = useMovies();

  const [pinPromptInfo, setPinPromptInfo] = useState<{ id: string, pin: string } | null>(null);
  const [enteredPin, setEnteredPin] = useState("");

  const handleProfileClick = (profile: any) => {
    if (profile.pin && preferences.activeProfileId !== profile.id) {
      setPinPromptInfo({ id: profile.id, pin: profile.pin });
      setEnteredPin("");
      setIsProfileOpen(false);
    } else {
      switchProfile(profile.id);
      setIsProfileOpen(false);
    }
  };

  const handlePinSubmit = () => {
    if (pinPromptInfo && enteredPin === pinPromptInfo.pin) {
      switchProfile(pinPromptInfo.id);
      setPinPromptInfo(null);
      toast.success("Profile switched");
    } else {
      toast.error("Incorrect PIN");
    }
  };

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
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 pointer-events-none transition-all duration-700 h-20 ${scrolled
        ? "bg-[#0f171e]/90 backdrop-blur-xl shadow-2xl"
        : "bg-gradient-to-b from-black/80 to-transparent"
        }`}
    >
      {/* Gradient Bottom Edge */}
      <div className={`absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`} />
      <div className="pointer-events-auto flex items-center gap-8">
        <Link to="/" className="flex items-center shrink-0">
          <img
            src="/logo.png"
            alt="Prime Video"
            className="h-5 md:h-6"
          />
        </Link>

        <div className={`hidden lg:flex items-center gap-8 h-full transition-all duration-300 ${searchFocused ? "opacity-30 blur-sm scale-95 pointer-events-none" : "opacity-100"}`}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.label}
                to={link.to}
                className={`text-sm font-semibold transition-all duration-300 relative px-1 py-1 ${isActive ? "text-white" : "text-[#8197a4] hover:text-white"}`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#00a8e1] rounded-full shadow-[0_0_8px_rgba(0,168,225,0.6)]"
                  />
                )}
              </Link>
            );
          })}
          <Link
            to="/subscriptions"
            className={`text-sm font-semibold transition-all duration-300 relative px-1 py-1 ${location.pathname === "/subscriptions" ? "text-white" : "text-[#8197a4] hover:text-white"}`}
          >
            Subscriptions
            {location.pathname === "/subscriptions" && (
              <motion.div
                layoutId="nav-underline"
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#00a8e1] rounded-full shadow-[0_0_8px_rgba(0,168,225,0.6)]"
              />
            )}
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
              className="p-2 text-[#8197a4] hover:text-white hover:scale-110 transition-all duration-300"
            >
              <Search size={20} strokeWidth={2} />
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
          <Link to="/mystuff" className="text-[#8197a4] hover:text-white transition-all duration-300 hover:scale-110">
            <Bookmark size={20} strokeWidth={2} />
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setIsProfileOpen(true)}
            onMouseLeave={() => setIsProfileOpen(false)}
          >
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 overflow-hidden hover:ring-2 transition-all"
              style={{ backgroundColor: activeProfile?.avatarColor || "#00a8e1" }}
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={18} className="text-white" />
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

                  {/* Right Column: Profile Switcher */}
                  <div className="flex-1 p-6 bg-white/5">
                    <h4 className="text-[#8197a4] text-xs font-black uppercase tracking-widest mb-6">Profiles</h4>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                      {preferences.profiles.map(p => (
                        <div key={p.id} className="relative group">
                          <button
                            onClick={() => handleProfileClick(p)}
                            className={`flex items-center justify-between w-full ${preferences.activeProfileId === p.id ? "pointer-events-none" : ""}`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${preferences.activeProfileId === p.id ? "ring-2 ring-[#00a8e1] ring-offset-2 ring-offset-[#1a242f]" : ""}`}
                                style={{ backgroundColor: p.avatarColor }}
                              >
                                <User size={14} className="text-white" />
                              </div>
                              <span className={`font-bold transition-colors ${preferences.activeProfileId === p.id ? "text-[#00a8e1]" : "text-white/90 group-hover:text-white"}`}>
                                {p.name}
                              </span>
                            </div>
                            <Link
                              to={`/profiles/edit/${p.id}`}
                              className="p-1.5 rounded-full hover:bg-white/10 text-[#8197a4] hover:text-white transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Edit3 size={14} />
                            </Link>
                          </button>
                        </div>
                      ))}

                      <Link to="/profiles/new" className="flex items-center gap-3 text-white/90 hover:text-white font-bold transition-colors group pt-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                          <Plus size={16} />
                        </div>
                        Add new profile
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* PIN Prompt Modal */}
      {pinPromptInfo && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm pointer-events-auto">
          <div className="bg-[#1b252f] rounded-2xl p-8 max-w-sm w-full border border-white/10 shadow-2xl relative">
            <button onClick={() => setPinPromptInfo(null)} className="absolute top-4 right-4 text-[#8197a4] hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black mb-2 text-white">Enter PIN</h2>
            <p className="text-[#8197a4] text-sm mb-6">This profile is PIN protected.</p>
            <input
              type="password"
              autoFocus
              maxLength={4}
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
              className="w-full bg-[#0f171e] text-white border border-white/10 rounded-lg px-5 py-4 text-center text-3xl tracking-[0.5em] font-black outline-none focus:border-[#00a8e1] transition-all mb-6"
            />
            <button onClick={handlePinSubmit} className="w-full py-4 bg-[#00a8e1] hover:bg-[#00a8e1]/90 text-white rounded-lg font-black transition-all">
              Unlock Profile
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
