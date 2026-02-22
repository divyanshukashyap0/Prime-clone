import { useAuth } from "@/context/AuthContext";
import { useMovies } from "@/hooks/useMovies";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CategoryRow from "@/components/CategoryRow";
import Loader from "@/components/Loader";
import { useEffect } from "react";
import { History, Heart, BookmarkPlus } from "lucide-react";

export default function MyStuffPage() {
    const { preferences } = useAuth();
    const { data: movies = [], isLoading } = useMovies();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (isLoading) {
        return <Loader />;
    }

    // Map IDs to Movie objects
    const watchlistMovies = preferences.watchlist
        .map(id => movies.find(m => m.id === id))
        .filter(Boolean) as any[];

    const likedMovies = preferences.likes
        .map(id => movies.find(m => m.id === id))
        .filter(Boolean) as any[];

    // For history, we want to include the playbackProgress and playbackDuration
    const historyMovies = preferences.history
        .map(h => {
            const movie = movies.find(m => m.id === h.movieId);
            if (!movie) return null;
            return { ...movie, playbackProgress: h.progress, playbackDuration: h.duration };
        })
        .filter(Boolean) as any[];

    const isEmpty = watchlistMovies.length === 0 && likedMovies.length === 0 && historyMovies.length === 0;

    return (
        <div className="min-h-screen bg-[#0f171e] text-white">
            <Navbar />

            <div className="pt-28 pb-20 px-4 md:px-12 max-w-[1600px] mx-auto min-h-screen">
                <h1 className="text-4xl md:text-5xl font-bold mb-8">My Stuff</h1>

                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-[#1b252f] rounded-xl border border-[#303c44] shadow-2xl">
                        <BookmarkPlus size={64} className="text-[#8197a4] mb-6 opacity-50" />
                        <h2 className="text-2xl font-bold text-white mb-2">Nothing here yet</h2>
                        <p className="text-[#8197a4] max-w-md mx-auto">
                            Titles you add to your Watchlist, your Liked videos, and your Watch History will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {historyMovies.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-2xl font-bold px-4 md:px-0">
                                    <History className="text-[#00a8e1]" /> Watch History
                                </div>
                                <div className="bg-[#1b252f]/30 p-6 rounded-xl border border-white/5">
                                    <CategoryRow title="" movies={historyMovies} />
                                </div>
                            </div>
                        )}

                        {watchlistMovies.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-2xl font-bold px-4 md:px-0">
                                    <BookmarkPlus className="text-[#00a8e1]" /> My Watchlist
                                </div>
                                <div className="bg-[#1b252f]/30 p-6 rounded-xl border border-white/5">
                                    <CategoryRow title="" movies={watchlistMovies} />
                                </div>
                            </div>
                        )}

                        {likedMovies.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-2xl font-bold px-4 md:px-0">
                                    <Heart className="text-[#00a8e1]" /> Liked Videos
                                </div>
                                <div className="bg-[#1b252f]/30 p-6 rounded-xl border border-white/5">
                                    <CategoryRow title="" movies={likedMovies} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
