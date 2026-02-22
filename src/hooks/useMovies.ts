import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Movie } from "@/data/movies";

export const useMovies = () => {
    return useQuery({
        queryKey: ["movies"],
        queryFn: async () => {
            try {
                // Fetch from both collections
                const [moviesSnap, contentSnap] = await Promise.all([
                    getDocs(query(collection(db, "movies"), orderBy("createdAt", "desc"))),
                    getDocs(collection(db, "content"))
                ]);

                // Standardization: Both collections now follow the same format
                const normalizeArray = (data: any) => {
                    if (Array.isArray(data)) return data;
                    if (typeof data === "string" && data.trim()) {
                        return data.split(",").map(s => s.trim()).filter(Boolean);
                    }
                    return [];
                };

                const isRickroll = (val: any) => typeof val === 'string' && val.includes("dQw4w9WgXcQ");
                const getValid = (val: any) => isRickroll(val) ? "" : val;

                const newMovies = moviesSnap.docs.map((doc) => {
                    const data = doc.data();
                    const genres = normalizeArray(data.genres || data.tags);
                    const cast = normalizeArray(data.cast);

                    return {
                        id: doc.id,
                        ...data,
                        genres,
                        cast,
                        movieDriveID: getValid(data.movieDriveID || data.movieDriveId || data.videoUrl || ""),
                        isPublished: data.isPublished ?? true,
                        allowDownload: data.allowDownload ?? true,
                        allowPlayback: data.allowPlayback ?? true,
                        quality: data.quality || "HD",
                    };
                }) as Movie[];

                const legacyMovies = contentSnap.docs.map((doc) => {
                    const data = doc.data();
                    const genres = normalizeArray(data.genres || data.tags);
                    const cast = normalizeArray(data.cast);

                    return {
                        id: doc.id,
                        ...data,
                        genres,
                        cast,
                        movieDriveID: getValid(data.movieDriveID || data.movieDriveId || data.videoUrl || ""),
                        isPublished: data.isPublished ?? true,
                        allowDownload: data.allowDownload ?? true,
                        allowPlayback: data.allowPlayback ?? true,
                        quality: data.quality || "HD",
                        youtubeId: getValid(data.youtubeId) || getValid(data.trailerUrl ? data.trailerUrl.split('v=')[1] : ""),
                    };
                }) as Movie[];

                return [...newMovies, ...legacyMovies];
            } catch (error) {
                console.error("Firestore Fetch Error: ", error);
                // Return empty array if Firestore fails
                return [] as Movie[];
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
