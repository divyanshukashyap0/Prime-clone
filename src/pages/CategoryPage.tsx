import { useEffect, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import CategoryRow from "@/components/CategoryRow";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import { useMovies } from "@/hooks/useMovies";
import { Check, Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CategoryPage() {
    const location = useLocation();
    const { category } = useParams();
    const { data: movies = [], isLoading } = useMovies();

    const config = useMemo(() => {
        const path = location.pathname;
        let title = "";
        let rows: { name: string; movies: any[] }[] = [];
        let hMovies: any[] = [];

        if (path === "/movies") {
            title = "Movies";
            const movieItems = movies.filter(m => m.type === "movie");
            hMovies = movieItems.filter(m => m.isFeatured);
            rows = [
                { name: "Top Rated Movies", movies: [...movieItems].sort((a, b) => b.vote_average - a.vote_average).slice(0, 8) },
                { name: "Action & Adventure", movies: movieItems.filter(m => m.genres.includes("Action") || m.genres.includes("Adventure")) },
                { name: "Bollywood Blockbusters", movies: movieItems.filter(m => parseInt(m.release_date) > 2010 && m.vote_average > 8.0) },
                { name: "Family & Drama", movies: movieItems.filter(m => m.genres.includes("Family") || m.genres.includes("Drama")) },
                { name: "All-Time Classics", movies: movieItems.filter(m => parseInt(m.release_date) < 2010) },
            ];
        } else if (path === "/tv-shows") {
            title = "TV Shows";
            const tvItems = movies.filter(m => m.type === "tv-show");
            hMovies = tvItems.filter(m => m.isFeatured);
            rows = [
                { name: "Binge-worthy Indian Originals", movies: tvItems.filter(m => parseInt(m.release_date) >= 2020) },
                { name: "Top Picks for You", movies: tvItems.slice(0, 8) },
                { name: "Comedy TV", movies: tvItems.filter(m => m.genres.includes("Comedy")) },
                { name: "Crime & Thrillers", movies: tvItems.filter(m => m.genres.includes("Crime") || m.genres.includes("Thriller")) },
                { name: "Drama Series", movies: tvItems.filter(m => m.genres.includes("Drama") && !m.genres.includes("Comedy")) },
            ];
        } else if (path === "/live-tv") {
            title = "Live TV";
            const liveItems = movies.filter(m => m.type === "live");
            hMovies = liveItems;
            rows = [
                { name: "Live Now", movies: liveItems },
                { name: "Sports & News", movies: liveItems.filter(m => m.genres.includes("Sports") || m.category === "News") },
            ];
        } else if (path === "/sacrifice") {
            title = "Sacrifice";
            const epicMovies = movies.filter(m => (m.genres || []).includes("Sacrifice") || (m.genres || []).includes("Epic") || m.category === "Epic");
            hMovies = epicMovies.slice(0, 1);
            rows = [
                { name: "Epics & Tragedies", movies: epicMovies },
                { name: "Heroic Sacrifices", movies: movies.filter(m => (m.overview || "").toLowerCase().includes("sacrifice")) },
            ];
        } else if (path === "/subscriptions") {
            title = "Subscriptions";
            hMovies = [];
            rows = [];
        }
        else if (path.startsWith("/legal/") || path === "/help") {
            title = path === "/help" ? "Help & Support" : (category ? category.charAt(0).toUpperCase() + category.slice(1) : "Legal Info");
            rows = [];
            hMovies = [];
        } else if (category) {
            title = category.charAt(0).toUpperCase() + category.slice(1);
            const catMovies = movies.filter(m => (m.genres || []).includes(title) || m.category === title);
            hMovies = catMovies.filter(m => m.isFeatured);
            rows = [
                { name: `Best of ${title}`, movies: catMovies },
                { name: "New Releases", movies: [...catMovies].sort((a, b) => (parseInt(b.release_date) || 0) - (parseInt(a.release_date) || 0)).slice(0, 8) },
            ];
        }

        return { title, rows, hMovies };
    }, [location.pathname, category, movies]);

    const { title: pageTitle, rows: filteredRows, hMovies: heroMovies } = config;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    if (isLoading) {
        return <Loader />;
    }

    const isSubscriptionPage = location.pathname === "/subscriptions";

    return (
        <div className="min-h-screen bg-[#0f171e] text-white">
            <Navbar />

            {heroMovies.length > 0 && (
                <>
                    <HeroSlider movies={heroMovies} />
                    <div className="relative z-10 px-4 md:px-12 mb-8 mt-12">
                        <h1 className="text-3xl md:text-5xl font-bold mb-2">{pageTitle}</h1>
                        <div className="h-1.5 w-24 bg-[#00a8e1] rounded-full" />
                    </div>
                </>
            )}

            <div className={`${(heroMovies.length > 0 || isSubscriptionPage) ? "relative" : "pt-28"} z-10 pb-20`}>

                {isSubscriptionPage ? (
                    <div className="relative min-h-screen flex items-center pt-20">
                        {/* Background Gradients */}
                        <div className="absolute inset-0 bg-[#000508]" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />

                        <div className="relative z-20 px-4 md:px-16 w-full max-w-screen-2xl mx-auto flex flex-col lg:flex-row items-center gap-12 py-20 mt-10">
                            {/* Left Content (Screenshot 1) */}
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="flex-1 space-y-10"
                            >
                                <div className="space-y-4">
                                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
                                        Welcome to Prime Video
                                    </h1>
                                    <p className="text-2xl md:text-3xl text-white/90 font-medium leading-tight max-w-2xl">
                                        Join Prime to watch latest movies, exclusive TV shows and award-winning Amazon Originals
                                    </p>
                                </div>

                                {/* Pricing Section */}
                                <div className="space-y-8 max-w-[440px]">
                                    <div className="space-y-2 group">
                                        <button className="w-full bg-white text-black font-black py-4 rounded-md text-xl hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                            Join Prime Lite at ₹799/year
                                        </button>
                                        <div className="flex items-center justify-between px-2">
                                            <p className="text-white font-bold text-base">Effectively ₹67/month</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <button className="w-full bg-white text-black font-black py-4 rounded-md text-xl hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                            Join Prime Annual at ₹1499/year
                                        </button>
                                        <div className="flex items-center justify-between px-2">
                                            <p className="text-white font-bold text-base">Effectively ₹125/month</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <button className="w-full bg-white text-black font-black py-4 rounded-md text-xl hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                            Join Prime Monthly at ₹299/month
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 text-white/60 text-sm font-medium">
                                    <span>T&C Apply.</span>
                                    <button className="hover:text-white underline">Learn more</button>
                                </div>
                            </motion.div>

                            {/* Right Poster Grid (Screenshot 1 Style) */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1 }}
                                className="hidden lg:grid grid-cols-3 gap-3 flex-1 max-w-[600px] h-[700px] pointer-events-none opacity-80"
                            >
                                {movies.slice(0, 9).map((m, i) => (
                                    <div key={m.id} className={`rounded-lg overflow-hidden border border-white/5 shadow-2xl ${i % 2 === 0 ? "mt-8" : "-mt-8"}`}>
                                        <img src={m.poster_path} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Store/Channels Section */}
                        <div className="relative z-20 px-4 md:px-16 pb-32">
                            <div className="max-w-screen-2xl mx-auto border-t border-white/10 pt-20">
                                <h2 className="text-3xl font-bold mb-12 flex items-center gap-3">
                                    <Zap className="text-[#00a8e1]" fill="#00a8e1" /> Add-on Subscriptions
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                    {["Discovery+", "Lionsgate Play", "Eros Now", "MUBI", "hoichoi", "Manorama Max", "BBC Player", "Namma Flix", "DocuBay"].map((channel) => (
                                        <div key={channel} className="aspect-[16/9] bg-[#1b252f] border border-[#303c44] rounded-lg flex flex-col items-center justify-center p-4 hover:border-[#00a8e1] hover:bg-[#1b252f]/80 cursor-pointer transition-all group overflow-hidden relative">
                                            <span className="font-extrabold text-center text-sm group-hover:scale-105 transition-transform z-10">{channel}</span>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : filteredRows.length > 0 ? (
                    <div className="space-y-8">
                        {filteredRows.map((row, idx) => (
                            row.movies.length > 0 && (
                                <CategoryRow key={idx} title={row.name} movies={row.movies} />
                            )
                        ))}
                    </div>
                ) : (
                    <div className="px-4 md:px-12 py-12 max-w-5xl mx-auto">
                        <div className="bg-[#1b252f] p-8 md:p-12 rounded-xl border border-[#303c44] shadow-2xl">
                            <h2 className="text-3xl font-bold mb-8 text-[#00a8e1] border-b border-[#303c44] pb-4">
                                {pageTitle}
                            </h2>
                            <div className="space-y-6 text-[#8197a4] leading-relaxed text-lg">
                                <p>
                                    Welcome to the <span className="text-white font-bold">{pageTitle}</span> section for   Cinema.
                                    Our platform is committed to providing a transparent and secure streaming experience for all our users.
                                </p>
                                <section className="space-y-3">
                                    <h3 className="text-xl font-bold text-white">1. Overview</h3>
                                    <p>
                                        These guidelines govern your access to and use of our streaming services. By continuing to use the platform,
                                        you agree to abide by the standards set forth in this document.
                                    </p>
                                </section>
                                <section className="space-y-3">
                                    <h3 className="text-xl font-bold text-white">2. Content Usage</h3>
                                    <p>
                                        Primeprovides access to a wide variety of content. All digital media on this platform is protected
                                        under intellectual property laws. Users are granted a limited, non-exclusive license to view content
                                        for personal, non-commercial use.
                                    </p>
                                </section>
                                <section className="space-y-3">
                                    <h3 className="text-xl font-bold text-white">3. Data Privacy</h3>
                                    <p>
                                        We value your privacy. Your data is used solely to enhance your viewing experience and provide
                                        personalized recommendations. For detailed information on data handling, please refer to our
                                        Full Privacy Policy.
                                    </p>
                                </section>
                                <div className="mt-12 pt-8 border-t border-[#303c44] flex flex-wrap gap-4">
                                    <button className="bg-[#00a8e1] hover:bg-[#0092c3] text-white px-6 py-2 rounded font-bold transition-all">
                                        Download PDF
                                    </button>
                                    <button className="text-[#00a8e1] font-bold hover:underline px-4 py-2">
                                        Contact Support
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
