export interface Episode {
  episodeNumber: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration?: string;
}

export interface Season {
  seasonNumber: number;
  episodes: Episode[];
}

export interface Movie {
  id: string;
  title: string;
  overview: string;
  category: string;
  genres: string[];
  poster_path: string;
  backdrop_path: string;
  duration: string;
  vote_average: number;
  release_date: string;
  isFeatured: boolean;
  maturityRating: string;
  type: "movie" | "tv-show" | "live";
  youtubeId?: string;
  movieDriveID?: string;
  seasons?: Season[];
  allowDownload?: boolean;
  allowPlayback?: boolean;
  cast?: string[];
  director?: string;
  isPublished?: boolean;
  mobile_backdrop_path?: string;
  mobile_poster_path?: string;
  quality?: string;
  tags?: string[];
  createdAt?: string;
}

export const movies: Movie[] = [];
export const featuredMovies: Movie[] = [];
export const categories: { name: string; movies: Movie[] }[] = [];
