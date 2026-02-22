import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import CategoryRow from "@/components/CategoryRow";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import { useMovies } from "@/hooks/useMovies";

const Index = () => {
  const { data: movies = [], isLoading } = useMovies();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  const featured = movies.filter((m) => m.isFeatured);
  const recent = [...movies].sort((a, b) => b.releaseYear - a.releaseYear).slice(0, 10);

  // Dynamic categorization: matches either category field or genres array
  const actionMovies = movies.filter((m) => m.category === "Action" || (m.genres || []).includes("Action"));
  const dramaMovies = movies.filter((m) => m.category === "Drama" || (m.genres || []).includes("Drama"));
  const romanceMovies = movies.filter((m) => m.category === "Romance" || (m.genres || []).includes("Romance"));
  const sciFiMovies = movies.filter((m) => m.category === "Sci-Fi" || (m.genres || []).includes("Sci-Fi"));
  const tvShows = movies.filter((m) => m.type === "tv-show");

  return (
    <div className="min-h-screen bg-[#0f171e] text-white overflow-x-hidden">
      <Navbar />

      <HeroSlider movies={featured} />

      <div className="relative z-10 space-y-12 pb-20 pt-8">
        <CategoryRow title="New Releases" movies={recent} />
        <CategoryRow title="Popular TV Shows" movies={tvShows} />
        {actionMovies.length > 0 && <CategoryRow title="Action & Adventure" movies={actionMovies} />}
        {sciFiMovies.length > 0 && <CategoryRow title="Sci-Fi & Fantasy" movies={sciFiMovies} />}
        {romanceMovies.length > 0 && <CategoryRow title="Feel Good Romance" movies={romanceMovies} />}
        {dramaMovies.length > 0 && <CategoryRow title="Compelling Dramas" movies={dramaMovies} />}
        <CategoryRow title="Top Rated" movies={[...movies].sort((a, b) => b.rating - a.rating).slice(0, 10)} />
      </div>

      <Footer />
    </div>
  );
};

export default Index;
