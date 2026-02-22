import { useSearchParams, Link } from "react-router-dom";
import { useMovies } from "@/hooks/useMovies";
import MovieCard from "@/components/MovieCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import { Search, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const { data: movies = [], isLoading } = useMovies();

    const results = movies.filter((movie) => {
        const genresStr = Array.isArray(movie.genres) ? movie.genres.join(" ") : "";
        const castStr = Array.isArray(movie.cast) ? movie.cast.join(" ") : "";
        const searchStr = `${movie.title || ""} ${movie.overview || ""} ${genresStr} ${castStr} ${movie.director || ""}`.toLowerCase();
        return searchStr.includes(query.toLowerCase());
    });

    if (isLoading) return <Loader />;

    return (
        <div className="min-h-screen bg-[#0f171e] text-white">
            <Navbar />

            <div className="pt-32 px-4 md:px-12 pb-20 max-w-screen-2xl mx-auto">
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <Search size={28} className="text-[#00a8e1]" />
                                Results for "{query}"
                            </h1>
                            <p className="text-[#8197a4] font-medium mt-1">
                                Found {results.length} results matching your search
                            </p>
                        </div>
                    </div>

                    {results.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                            {results.map((movie, index) => (
                                <motion.div
                                    key={movie.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <MovieCard movie={movie} index={index} />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 bg-[#1b252f]/30 rounded-2xl border border-dashed border-[#303c44]">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                                <Search size={40} className="text-[#8197a4]" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-2xl font-bold text-white">No results found</p>
                                <p className="text-[#8197a4] max-w-md mx-auto">
                                    We couldn't find any movies or TV shows matching "{query}".
                                    Try checking your spelling or using different keywords.
                                </p>
                            </div>
                            <Link
                                to="/"
                                className="bg-white text-black font-bold px-8 py-3 rounded hover:bg-white/90 transition-all"
                            >
                                Clear Search
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
