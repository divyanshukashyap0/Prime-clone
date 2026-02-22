import { useRef } from "react";
import MovieCard from "./MovieCard";
import type { Movie } from "@/data/movies";

interface CategoryRowProps {
  title: string;
  movies: Movie[];
}

export default function CategoryRow({ title, movies }: CategoryRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (movies.length === 0) return null;

  return (
    <section className="relative px-4 md:px-12 mb-8 group/row-container">
      <div className="flex items-center gap-2 mb-3 group/title cursor-pointer inline-block">
        <h2 className="text-lg md:text-xl font-black text-white group-hover:text-[#00a8e1] transition-all">
          {title}
        </h2>
        <span className="text-[#00a8e1] text-xs font-black opacity-0 group-hover:opacity-100 transition-all translate-x-1">See more</span>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 md:gap-4 overflow-x-auto hide-scrollbar py-12 -my-12 scroll-smooth"
      >
        {movies.map((movie, i) => (
          <MovieCard key={`${movie.id}-${i}`} movie={movie} index={i} />
        ))}
      </div>
    </section>
  );
}
