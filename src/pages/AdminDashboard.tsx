import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { Movie, Season, Episode } from "@/data/movies";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Search, Filter, Save, X, ExternalLink, Settings, Database, RefreshCw, AlertTriangle, Check, Film, Clock, Star, Info, ChevronRight, Layout, Play, List, BarChart3, Image as ImageIcon } from "lucide-react";

function SeasonSection({
    season,
    sIdx,
    formData,
    setFormData,
    addEpisode,
    removeSeason,
    removeEpisode,
    updateEpisode,
    fetchSeasonMetadata,
    isFetchingEpisodes
}: any) {
    const [bulkInput, setBulkInput] = useState("");
    const [showBulk, setShowBulk] = useState(false);
    const [isReverseOrder, setIsReverseOrder] = useState(false);

    const handleBulkAdd = () => {
        if (!bulkInput.trim()) return;

        const lines = bulkInput.split('\n').filter(l => l.trim());
        const newEpisodes: any[] = [];

        lines.forEach((line) => {
            if (line.includes('|')) {
                // Standard Title | Link | Thumb format
                const [title, videoUrl, thumbnailUrl] = line.split('|').map(s => s.trim());
                if (title && videoUrl) {
                    newEpisodes.push({
                        episodeNumber: season.episodes.length + newEpisodes.length + 1,
                        title,
                        videoUrl,
                        thumbnailUrl: thumbnailUrl || "",
                        description: "",
                        duration: ""
                    });
                }
            } else {
                // Handle comma-separated, space-separated, or newline-separated links
                // Regex to find things that look like URLs or Drive IDs
                const potentialLinks = line.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);

                potentialLinks.forEach((link) => {
                    if (link.startsWith('http') || link.length > 20) { // Simple URL or Drive ID check
                        newEpisodes.push({
                            episodeNumber: season.episodes.length + newEpisodes.length + 1,
                            title: `Episode ${season.episodes.length + newEpisodes.length + 1}`,
                            videoUrl: link,
                            thumbnailUrl: "",
                            description: "",
                            duration: ""
                        });
                    }
                });
            }
        });

        if (newEpisodes.length > 0) {
            if (isReverseOrder) {
                newEpisodes.reverse();
                // Re-assign episode numbers after reversing
                newEpisodes.forEach((ep, idx) => {
                    ep.episodeNumber = season.episodes.length + idx + 1;
                    if (ep.title.startsWith("Episode ")) {
                        ep.title = `Episode ${ep.episodeNumber}`;
                    }
                });
            }

            const updatedSeasons = [...formData.seasons];
            updatedSeasons[sIdx].episodes = [...updatedSeasons[sIdx].episodes, ...newEpisodes];
            setFormData({ ...formData, seasons: updatedSeasons });
            setBulkInput("");
            setShowBulk(false);
            setIsReverseOrder(false);
            toast.success(`${newEpisodes.length} episodes added successfully!`);
        }
    };

    return (
        <div key={sIdx} className="bg-[#0f171e] p-6 rounded-lg border border-[#303c44] space-y-6">
            <div className="flex justify-between items-center border-b border-[#303c44] pb-4">
                <h4 className="font-bold text-lg">Season {season.seasonNumber}</h4>
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => setShowBulk(!showBulk)}
                        className="text-xs font-bold text-[#00a8e1] hover:underline"
                    >
                        {showBulk ? "Cancel Bulk" : "Bulk Add"}
                    </button>
                    <button
                        type="button"
                        onClick={() => addEpisode(sIdx)}
                        className="text-xs font-bold text-[#00a8e1] hover:underline"
                    >
                        + Add Episode
                    </button>
                    {formData.tmdbId && formData.type === "tv-show" && (
                        <button
                            type="button"
                            disabled={isFetchingEpisodes.includes(sIdx)}
                            onClick={() => fetchSeasonMetadata(sIdx)}
                            className="text-xs font-bold text-green-500 hover:underline disabled:opacity-50"
                        >
                            {isFetchingEpisodes.includes(sIdx) ? "Fetching..." : "Fetch from TMDB"}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => removeSeason(sIdx)}
                        className="text-xs font-bold text-red-500 hover:underline"
                    >
                        Remove Season
                    </button>
                </div>
            </div>

            {showBulk && (
                <div className="space-y-4 p-4 bg-white/5 rounded border border-dashed border-[#303c44]">
                    <label className="block text-sm font-bold text-[#8197a4]">
                        Bulk Input (Format: Title | Stream Link | Thumbnail URL)
                    </label>
                    <textarea
                        rows={5}
                        value={bulkInput}
                        onChange={(e) => setBulkInput(e.target.value)}
                        placeholder={"Episode 1 | https://... | https://...\nEpisode 2 | https://... | https://..."}
                        className="w-full bg-[#0f171e] border border-[#303c44] rounded px-4 py-2 focus:border-primary outline-none text-sm font-mono"
                    />
                    <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2 text-xs font-bold text-[#8197a4] cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isReverseOrder}
                                onChange={(e) => setIsReverseOrder(e.target.checked)}
                                className="accent-[#00a8e1]"
                            />
                            Links are in reverse order (e.g. Ep 10 to Ep 1)
                        </label>
                        <button
                            type="button"
                            onClick={handleBulkAdd}
                            className="bg-[#00a8e1] text-white px-4 py-2 rounded text-xs font-bold hover:bg-[#0092c3]"
                        >
                            Import Episodes
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {season.episodes.map((episode: any, eIdx: number) => (
                    <div key={eIdx} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/5 rounded relative group">
                        <button
                            type="button"
                            onClick={() => removeEpisode(sIdx, eIdx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Trash2 size={12} />
                        </button>
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-[#8197a4]">Ep. Number</label>
                            <input
                                type="number"
                                value={episode.episodeNumber}
                                onChange={(e) => updateEpisode(sIdx, eIdx, "episodeNumber", parseInt(e.target.value))}
                                className="w-full bg-[#0f171e] border border-[#303c44] rounded px-3 py-1.5 focus:border-primary outline-none text-sm"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="block text-xs font-bold text-[#8197a4]">Episode Title</label>
                            <input
                                type="text"
                                value={episode.title}
                                onChange={(e) => updateEpisode(sIdx, eIdx, "title", e.target.value)}
                                className="w-full bg-[#0f171e] border border-[#303c44] rounded px-3 py-1.5 focus:border-primary outline-none text-sm"
                                placeholder="The Arrival"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="block text-xs font-bold text-[#8197a4]">Stream Link (Google Drive ID or Direct Link)</label>
                            <input
                                type="text"
                                value={episode.videoUrl}
                                onChange={(e) => updateEpisode(sIdx, eIdx, "videoUrl", e.target.value)}
                                className="w-full bg-[#0f171e] border border-[#303c44] rounded px-3 py-1.5 focus:border-primary outline-none text-sm"
                                placeholder="Google Drive ID or Direct link"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-[#8197a4]">Thumbnail URL (Optional)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={episode.thumbnailUrl}
                                    onChange={(e) => updateEpisode(sIdx, eIdx, "thumbnailUrl", e.target.value)}
                                    className="w-full bg-[#0f171e] border border-[#303c44] rounded px-3 py-1.5 focus:border-primary outline-none text-sm"
                                    placeholder="https://..."
                                />
                                {episode.thumbnailUrl && (
                                    <div className="w-10 h-10 rounded border border-[#303c44] overflow-hidden shrink-0">
                                        <img src={episode.thumbnailUrl} alt="Ep" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const { isAdmin, loading } = useAuth();
    const [activeTab, setActiveTab] = useState("manage-content");
    const [allContent, setAllContent] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tmdbKey, setTmdbKey] = useState("");
    const [imdbKey, setImdbKey] = useState("");
    const [isFetching, setIsFetching] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isFetchingEpisodes, setIsFetchingEpisodes] = useState<number[]>([]);
    const [refreshProgress, setRefreshProgress] = useState({ current: 0, total: 0 });
    const [adminSearchQuery, setAdminSearchQuery] = useState("");

    const [formData, setFormData] = useState<any>({
        title: "",
        overview: "",
        type: "movie",
        category: "",
        genres: "",
        duration: "",
        release_date: new Date().getFullYear().toString(),
        maturityRating: "U",
        backdrop_path: "",
        poster_path: "",
        isFeatured: false,
        isPublished: true,
        allowDownload: true,
        allowPlayback: true,
        quality: "HD",
        youtubeId: "",
        movieDriveID: "",
        director: "",
        cast: "",
        seasons: [],
        tags: "",
        tmdbId: ""
    });

    useEffect(() => {
        if (activeTab === "manage-content") {
            fetchContent();
        }

        // Load settings
        const savedTmdb = localStorage.getItem("tmdb_api_key");
        const savedImdb = localStorage.getItem("imdb_api_key");
        if (savedTmdb) setTmdbKey(savedTmdb);
        if (savedImdb) setImdbKey(savedImdb);
    }, [activeTab]);

    const saveSettings = () => {
        localStorage.setItem("tmdb_api_key", tmdbKey);
        localStorage.setItem("imdb_api_key", imdbKey);
        toast.success("Settings saved successfully!");
    };

    const addSeason = () => {
        setFormData({
            ...formData,
            seasons: [
                ...(formData.seasons || []),
                { seasonNumber: (formData.seasons?.length || 0) + 1, episodes: [] }
            ]
        });
    };

    const addEpisode = (seasonIndex: number) => {
        const newSeasons = [...formData.seasons];
        const lastEpisode = newSeasons[seasonIndex].episodes[newSeasons[seasonIndex].episodes.length - 1];

        newSeasons[seasonIndex].episodes.push({
            episodeNumber: newSeasons[seasonIndex].episodes.length + 1,
            title: "",
            description: lastEpisode?.description || "",
            thumbnailUrl: lastEpisode?.thumbnailUrl || "",
            videoUrl: "",
            duration: lastEpisode?.duration || ""
        });
        setFormData({ ...formData, seasons: newSeasons });
    };

    const fetchMetadata = async () => {
        if (!tmdbKey) {
            toast.error("Please add your TMDB API Key in Settings first!");
            setActiveTab("settings");
            return;
        }

        if (!formData.title) {
            toast.error("Please enter a title to search for.");
            return;
        }

        setIsFetching(true);
        try {
            // 1. Search for the title (with Indian region preference)
            const searchRes = await fetch(
                `https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(formData.title)}&language=en-IN&region=IN`
            );
            const searchData = await searchRes.json();

            if (!searchData.results || searchData.results.length === 0) {
                toast.error("No results found on TMDB.");
                return;
            }

            const result = searchData.results[0];
            const mediaType = result.media_type || (formData.type === "tv-show" ? "tv" : "movie");

            // 2. Fetch full details including credits and videos
            const detailRes = await fetch(
                `https://api.themoviedb.org/3/${mediaType}/${result.id}?api_key=${tmdbKey}&append_to_response=credits,videos&language=en-IN`
            );
            const data = await detailRes.json();

            // 3. Find Trailer
            const trailer = data.videos?.results?.find(
                (v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
            );

            // 3. Format duration
            let duration = "";
            if (data.runtime) {
                const h = Math.floor(data.runtime / 60);
                const m = data.runtime % 60;
                duration = h > 0 ? `${h}h ${m}m` : `${m}m`;
            } else if (data.episode_run_time && data.episode_run_time.length > 0) {
                duration = `${data.episode_run_time[0]}m`;
            }

            // 4. Map TMDB genres to human readable names
            const fetchedGenres = data.genres ? data.genres.map((g: any) => g.name).join(", ") : "";

            // 5. Get Cast & Director
            const castNames = data.credits?.cast?.slice(0, 10).map((c: any) => c.name).join(", ") || "";
            const director = data.credits?.crew?.find((c: any) => c.job === "Director")?.name || "";

            setFormData({
                ...formData,
                title: data.title || data.name || formData.title,
                overview: data.overview || "",
                genres: fetchedGenres,
                duration: duration || formData.duration,
                release_date: (data.release_date || data.first_air_date || "").split("-")[0] || formData.release_date,
                backdrop_path: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : "",
                poster_path: data.poster_path ? `https://image.tmdb.org/t/p/w780${data.poster_path}` : "",
                director: director,
                cast: castNames,
                type: mediaType === "tv" ? "tv-show" : "movie",
                tmdbId: result.id.toString(),
                youtubeId: trailer?.key || formData.youtubeId
            });

            toast.success(`Metadata fetched for "${data.title || data.name}"!`);
        } catch (error) {
            console.error("TMDB Fetch Error:", error);

            // Fallback to OMDb
            if (imdbKey) {
                toast.info("TMDB timed out. Trying OMDb API...");
                try {
                    const omdbRes = await fetch(
                        `https://www.omdbapi.com/?t=${encodeURIComponent(formData.title)}&apikey=${imdbKey}`
                    );
                    const omdbData = await omdbRes.json();

                    if (omdbData.Response === "True") {
                        setFormData({
                            ...formData,
                            title: omdbData.Title || formData.title,
                            overview: omdbData.Plot !== "N/A" ? omdbData.Plot : "",
                            genres: omdbData.Genre !== "N/A" ? omdbData.Genre : "",
                            duration: omdbData.Runtime !== "N/A" ? omdbData.Runtime : formData.duration,
                            release_date: omdbData.Year || formData.release_date,
                            director: omdbData.Director !== "N/A" ? omdbData.Director : "",
                            cast: omdbData.Actors !== "N/A" ? omdbData.Actors : "",
                            poster_path: omdbData.Poster !== "N/A" ? omdbData.Poster : "",
                            type: omdbData.Type === "series" ? "tv-show" : "movie"
                        });
                        toast.success(`Found details for "${omdbData.Title}" on OMDb!`);
                        return;
                    }
                } catch (omdbError) {
                    console.error("OMDb Fetch Error:", omdbError);
                }
            }

            toast.error("Network Error: Could not reach TMDB or OMDb. Please check your internet or use a VPN if these services are blocked in your region.");
        } finally {
            setIsFetching(false);
        }
    };

    const fetchSeasonMetadata = async (seasonIndex: number) => {
        const activeTmdbKey = localStorage.getItem("tmdb_api_key") || tmdbKey;
        if (!activeTmdbKey) {
            toast.error("Please add your TMDB API Key in Settings first!");
            return;
        }

        const tmdbId = formData.tmdbId;
        if (!tmdbId || formData.type !== "tv-show") {
            toast.error("Please fetch series metadata first to get the TMDB ID.");
            return;
        }

        const seasonNumber = formData.seasons[seasonIndex].seasonNumber;
        setIsFetchingEpisodes(prev => [...prev, seasonIndex]);

        try {
            const res = await fetch(
                `https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNumber}?api_key=${activeTmdbKey}&language=en-IN`
            );
            const data = await res.json();

            if (!data.episodes) {
                toast.error("No episodes found for this season on TMDB.");
                return;
            }

            const newSeasons = [...formData.seasons];
            const fetchedEpisodes = data.episodes.map((ep: any) => ({
                episodeNumber: ep.episode_number,
                title: ep.name || `Episode ${ep.episode_number}`,
                description: ep.overview || "",
                thumbnailUrl: ep.still_path ? `https://image.tmdb.org/t/p/w780${ep.still_path}` : "",
                videoUrl: "",
                duration: ep.runtime ? `${ep.runtime}m` : ""
            }));

            // Merge or replace? Let's merge based on episode number or append if not exists
            const existingEpisodes = [...newSeasons[seasonIndex].episodes];

            fetchedEpisodes.forEach((fetchedEp: any) => {
                const existingIdx = existingEpisodes.findIndex(e => e.episodeNumber === fetchedEp.episodeNumber);
                if (existingIdx !== -1) {
                    // Update existing
                    existingEpisodes[existingIdx] = {
                        ...existingEpisodes[existingIdx],
                        title: existingEpisodes[existingIdx].title || fetchedEp.title,
                        description: existingEpisodes[existingIdx].description || fetchedEp.description,
                        thumbnailUrl: existingEpisodes[existingIdx].thumbnailUrl || fetchedEp.thumbnailUrl,
                        duration: existingEpisodes[existingIdx].duration || fetchedEp.duration
                    };
                } else {
                    // Add new
                    existingEpisodes.push(fetchedEp);
                }
            });

            // Sort by episode number
            existingEpisodes.sort((a, b) => a.episodeNumber - b.episodeNumber);

            newSeasons[seasonIndex].episodes = existingEpisodes;
            setFormData({ ...formData, seasons: newSeasons });
            toast.success(`Fetched ${fetchedEpisodes.length} episodes for Season ${seasonNumber}`);
        } catch (error) {
            console.error("TMDB Season Fetch Error:", error);
            toast.error("Failed to fetch season metadata.");
        } finally {
            setIsFetchingEpisodes(prev => prev.filter(idx => idx !== seasonIndex));
        }
    };

    const updateEpisode = (seasonIndex: number, episodeIndex: number, field: string, value: any) => {
        const newSeasons = [...formData.seasons];
        newSeasons[seasonIndex].episodes[episodeIndex] = {
            ...newSeasons[seasonIndex].episodes[episodeIndex],
            [field]: value
        };
        setFormData({ ...formData, seasons: newSeasons });
    };

    const removeSeason = (index: number) => {
        const newSeasons = formData.seasons.filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, seasons: newSeasons });
    };

    const removeEpisode = (seasonIndex: number, episodeIndex: number) => {
        const newSeasons = [...formData.seasons];
        newSeasons[seasonIndex].episodes = newSeasons[seasonIndex].episodes.filter((_: any, i: number) => i !== episodeIndex);
        setFormData({ ...formData, seasons: newSeasons });
    };

    const handleBulkRefresh = async () => {
        if (!window.confirm("This will attempt to re-fetch and correct metadata for ALL items in your database (TMDB/OMDb). This may take a while. Proceed?")) return;

        setIsRefreshing(true);
        setRefreshProgress({ current: 0, total: allContent.length });
        let successCount = 0;
        let failCount = 0;

        // Use state keys as defaults if localStorage is empty
        const activeTmdbKey = localStorage.getItem("tmdb_api_key") || tmdbKey;
        const activeImdbKey = localStorage.getItem("imdb_api_key") || imdbKey;

        for (let i = 0; i < allContent.length; i++) {
            const item = allContent[i];
            setRefreshProgress({ current: i + 1, total: allContent.length });

            // Skip mock data as it's not persisted
            if (!item.isPersisted) {
                continue;
            }

            try {
                const query = item.title;
                if (!query) {
                    failCount++;
                    continue;
                }

                let updatedData: any = {};
                let fetchedFromTMDB = false;

                // 1. Try TMDB
                if (activeTmdbKey) {
                    try {
                        const searchRes = await fetch(
                            `https://api.themoviedb.org/3/search/multi?api_key=${activeTmdbKey}&query=${encodeURIComponent(query)}&language=en-IN&region=IN`
                        );
                        const searchData = await searchRes.json();

                        if (searchData.results && searchData.results.length > 0) {
                            const result = searchData.results[0];
                            const mediaType = result.media_type || (item.type === "tv-show" ? "tv" : "movie");

                            const detailRes = await fetch(
                                `https://api.themoviedb.org/3/${mediaType}/${result.id}?api_key=${activeTmdbKey}&append_to_response=credits,videos&language=en-IN`
                            );
                            const data = await detailRes.json();

                            // Find Trailer
                            const trailer = data.videos?.results?.find(
                                (v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
                            );

                            // Format duration
                            let duration = "";
                            if (data.runtime) {
                                const h = Math.floor(data.runtime / 60);
                                const m = data.runtime % 60;
                                duration = h > 0 ? `${h}h ${m}m` : `${m}m`;
                            } else if (data.episode_run_time && data.episode_run_time.length > 0) {
                                duration = `${data.episode_run_time[0]}m`;
                            }

                            updatedData = {
                                overview: data.overview || item.overview,
                                genres: data.genres ? data.genres.map((g: any) => g.name) : (Array.isArray(item.genres) ? item.genres : []),
                                duration: duration || item.duration,
                                release_date: (data.release_date || data.first_air_date || "").split("-")[0] || item.release_date,
                                backdrop_path: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : item.backdrop_path,
                                poster_path: data.poster_path ? `https://image.tmdb.org/t/p/w780${data.poster_path}` : item.poster_path,
                                director: data.credits?.crew?.find((c: any) => c.job === "Director")?.name || item.director,
                                cast: data.credits?.cast?.slice(0, 10).map((c: any) => c.name) || (Array.isArray(item.cast) ? item.cast : []),
                                youtubeId: trailer?.key || item.youtubeId,
                                tmdbId: result.id.toString()
                            };
                            fetchedFromTMDB = true;
                        }
                    } catch (tmdbErr) {
                        console.error(`TMDB bulk refresh error for ${query}:`, tmdbErr);
                    }
                }

                // 2. Try OMDb Fallback if TMDB failed
                if (!fetchedFromTMDB && activeImdbKey) {
                    try {
                        const omdbRes = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=${activeImdbKey}`);
                        const omdbData = await omdbRes.json();

                        if (omdbData.Response === "True") {
                            updatedData = {
                                overview: omdbData.Plot !== "N/A" ? omdbData.Plot : item.overview,
                                genres: omdbData.Genre !== "N/A" ? omdbData.Genre.split(",").map((g: string) => g.trim()) : (Array.isArray(item.genres) ? item.genres : []),
                                duration: omdbData.Runtime !== "N/A" ? omdbData.Runtime : item.duration,
                                release_date: omdbData.Year !== "N/A" ? omdbData.Year : item.release_date,
                                poster_path: omdbData.Poster !== "N/A" ? omdbData.Poster : item.poster_path,
                                director: omdbData.Director !== "N/A" ? omdbData.Director : item.director,
                                cast: omdbData.Actors !== "N/A" ? omdbData.Actors.split(",").map((a: string) => a.trim()) : (Array.isArray(item.cast) ? item.cast : []),
                            };
                        }
                    } catch (omdbErr) {
                        console.error(`OMDb bulk refresh error for ${query}:`, omdbErr);
                    }
                }

                // 3. Update Firestore
                if (Object.keys(updatedData).length > 0 && item.id) {
                    const collectionName = item.source === "content" ? "content" : "movies";
                    await updateDoc(doc(db, collectionName, item.id), {
                        ...updatedData,
                        updatedAt: serverTimestamp()
                    });
                    successCount++;
                } else {
                    failCount++;
                }

            } catch (err) {
                console.error(`General error refreshing ${item.title}:`, err);
                failCount++;
            }
            // Small delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 300));
        }

        setIsRefreshing(false);
        toast.success(`Bulk Refresh Complete! Success: ${successCount}, Failed/Skipped: ${failCount}`);
        fetchContent(); // Re-fetch content to update UI
    };

    const fetchContent = async () => {
        try {
            // Fetch from both collections
            const [moviesSnap, contentSnap] = await Promise.all([
                getDocs(collection(db, "movies")),
                getDocs(collection(db, "content"))
            ]);

            // Normalize new movies
            const newMovies = moviesSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data() as any,
                isPersisted: true,
                source: "movies"
            }));

            // Normalize legacy content
            const legacyMovies = contentSnap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title || "Untitled",
                    overview: data.overview || data.description || "",
                    type: data.type || "movie",
                    category: data.category || "Trending Now",
                    genres: data.genres || data.tags || [],
                    poster_path: data.poster_path || data.thumbnailUrl || "",
                    backdrop_path: data.backdrop_path || data.bannerUrl || "",
                    duration: data.duration || "2h 0m",
                    vote_average: data.vote_average || data.rating || 0,
                    release_date: data.release_date || (data.releaseYear ? data.releaseYear.toString() : "2024"),
                    isFeatured: data.isFeatured || false,
                    isPublished: data.isPublished ?? true,
                    allowDownload: data.allowDownload ?? true,
                    allowPlayback: data.allowPlayback ?? true,
                    quality: data.quality || "HD",
                    maturityRating: data.maturityRating || data.maturity || "13+",
                    youtubeId: data.youtubeId || (data.trailerUrl ? data.trailerUrl.split('v=')[1] : ""),
                    movieDriveID: data.movieDriveID || data.movieDriveId || data.videoUrl || "",
                    director: data.director || "",
                    cast: data.cast || [],
                    seasons: data.seasons || [],
                    tags: data.tags || [],
                    isPersisted: true,
                    source: "content"
                };
            });

            setAllContent([...newMovies, ...legacyMovies]);
        } catch (error) {
            console.error("fetchContent Error:", error);
            toast.error("Failed to fetch content from database");
        }
    };

    const filteredContent = adminSearchQuery.trim() === ""
        ? allContent
        : allContent.filter(item =>
            item.title.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
            (item.genres && Array.isArray(item.genres) && item.genres.some((g: any) => g.toLowerCase().includes(adminSearchQuery.toLowerCase()))) ||
            (item.category && item.category.toLowerCase().includes(adminSearchQuery.toLowerCase())) ||
            (item.type && item.type.toLowerCase().includes(adminSearchQuery.toLowerCase()))
        );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const genresArray = Array.isArray(formData.genres)
                ? formData.genres
                : formData.genres.split(",").map((g: string) => g.trim());

            const castArray = Array.isArray(formData.cast)
                ? formData.cast
                : formData.cast.split(",").map((c: string) => c.trim()).filter((c: string) => c !== "");

            // Extract youtubeId if full URL is provided
            let finalYoutubeId = formData.youtubeId;
            if (finalYoutubeId.includes("youtube.com") || finalYoutubeId.includes("youtu.be")) {
                const url = new URL(finalYoutubeId);
                finalYoutubeId = url.searchParams.get("v") || finalYoutubeId.split("/").pop() || "";
            }

            const tagsArray = Array.isArray(formData.tags)
                ? formData.tags
                : formData.tags.split(",").map((t: string) => t.trim()).filter((t: string) => t !== "");

            const payload = {
                ...formData,
                youtubeId: finalYoutubeId,
                genres: genresArray,
                cast: castArray,
                tags: tagsArray,
                updatedAt: serverTimestamp()
            };

            // Remove empty fields or arrays from final payload if not needed
            if (formData.type !== "tv-show") {
                delete (payload as any).seasons;
            } else {
                delete (payload as any).movieDriveID;
            }

            if (isEditing && editingId) {
                const originalItem = allContent.find(i => i.id === editingId);
                if (originalItem && !originalItem.isPersisted) {
                    // Promoting default/mock data to Firestore (always to 'movies')
                    await addDoc(collection(db, "movies"), {
                        ...payload,
                        vote_average: originalItem.vote_average || 0,
                        createdAt: serverTimestamp()
                    });
                    toast.success("Content promoted to database and saved!");
                } else {
                    // Update the correct collection
                    const collectionName = originalItem?.source === "content" ? "content" : "movies";
                    await updateDoc(doc(db, collectionName, editingId), payload);
                    toast.success(`Content updated in ${collectionName} successfully!`);
                }
            } else {
                // New entries always go to 'movies'
                await addDoc(collection(db, "movies"), {
                    ...payload,
                    vote_average: 0,
                    createdAt: serverTimestamp()
                });
                toast.success("Content added to database successfully!");
            }

            setIsEditing(false);
            setEditingId(null);
            setFormData({
                title: "", overview: "", type: "movie", category: "",
                genres: "", duration: "", release_date: new Date().getFullYear().toString(),
                maturityRating: "U", backdrop_path: "", poster_path: "", isFeatured: false,
                isPublished: true, allowDownload: true, allowPlayback: true, quality: "HD",
                youtubeId: "", movieDriveID: "", director: "", cast: "", seasons: [], tags: ""
            });
            fetchContent();
            setActiveTab("manage-content");
        } catch (error) {
            toast.error("Operation failed");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this content?")) return;
        try {
            const item = allContent.find(i => i.id === id);
            const collectionName = item?.source === "content" ? "content" : "movies";
            await deleteDoc(doc(db, collectionName, id));
            toast.success(`Content deleted from ${collectionName}`);
            fetchContent();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const handleEdit = (item: any) => {
        setFormData({
            title: item.title || "",
            overview: item.overview || "",
            type: item.type || "movie",
            category: item.category || "",
            genres: Array.isArray(item.genres) ? item.genres.join(", ") : (item.genres || ""),
            duration: item.duration || "",
            release_date: item.release_date || new Date().getFullYear().toString(),
            maturityRating: item.maturityRating || "U",
            backdrop_path: item.backdrop_path || "",
            poster_path: item.poster_path || "",
            isFeatured: item.isFeatured || false,
            isPublished: item.isPublished ?? true,
            allowDownload: item.allowDownload ?? true,
            allowPlayback: item.allowPlayback ?? true,
            quality: item.quality || "HD",
            youtubeId: item.youtubeId || "",
            movieDriveID: item.movieDriveID || "",
            director: item.director || "",
            cast: Array.isArray(item.cast) ? item.cast.join(", ") : (item.cast || ""),
            tags: Array.isArray(item.tags) ? item.tags.join(", ") : (item.tags || ""),
            seasons: item.seasons || [],
            tmdbId: item.tmdbId || ""
        });
        setEditingId(item.id);
        setIsEditing(true);
        setActiveTab("add-content");
    };



    if (loading) return <Loader />;

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-[#0f171e] text-white flex flex-col items-center justify-center p-4">
                <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
                <p className="text-[#8197a4]">You don't have permission to view the Admin Dashboard.</p>
                <a href="/" className="mt-8 text-primary hover:underline font-bold">Return to Prime Video</a>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f171e] text-white">
            <Navbar />

            <main className="pt-24 flex min-h-[calc(100vh-80px)]">
                {/* Sidebar */}
                <aside className="w-64 bg-[#1b252f] border-r border-[#303c44] hidden md:block">
                    <div className="p-6">
                        <h2 className="text-[#00a8e1] font-bold text-xs uppercase tracking-widest mb-6">Admin Controls</h2>
                        <nav className="space-y-2">
                            <button
                                onClick={() => { setActiveTab("manage-content"); setIsEditing(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === "manage-content" ? "bg-[#00a8e1] text-white" : "text-[#8197a4] hover:bg-white/5"}`}
                            >
                                <List size={18} /> Manage Content
                            </button>
                            <button
                                onClick={() => setActiveTab("add-content")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === "add-content" ? "bg-[#00a8e1] text-white" : "text-[#8197a4] hover:bg-white/5"}`}
                            >
                                <Plus size={18} /> {isEditing ? "Edit Content" : "Add Content"}
                            </button>
                            <div className="pt-4 mt-4 border-t border-[#303c44] space-y-2">
                                <button
                                    onClick={() => setActiveTab("analytics")}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === "analytics" ? "bg-[#00a8e1] text-white" : "text-[#8197a4] hover:bg-white/5"}`}
                                >
                                    <BarChart3 size={18} /> Analytics
                                </button>
                                <button
                                    onClick={() => setActiveTab("settings")}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === "settings" ? "bg-[#00a8e1] text-white" : "text-[#8197a4] hover:bg-white/5"}`}
                                >
                                    <Settings size={18} /> Settings
                                </button>
                            </div>
                        </nav>
                    </div>
                </aside>

                {/* Content Area */}
                <div className="flex-1 p-8 overflow-y-auto">
                    {activeTab === "manage-content" ? (
                        <div>
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h1 className="text-3xl font-bold">Content Library</h1>
                                    <p className="text-[#8197a4]">Total items: {allContent.length}</p>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 items-center">
                                    <div className="relative w-full md:w-64">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8197a4]">
                                            <Search size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search title, genre..."
                                            value={adminSearchQuery}
                                            onChange={(e) => setAdminSearchQuery(e.target.value)}
                                            className="w-full bg-[#1b252f] border border-[#303c44] rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[#00a8e1] outline-none transition-all"
                                        />
                                        {adminSearchQuery && (
                                            <button
                                                onClick={() => setAdminSearchQuery("")}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8197a4] hover:text-white"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setActiveTab("add-content")}
                                        className="w-full md:w-auto bg-[#00a8e1] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#0092c3] transition-all"
                                    >
                                        + New Title
                                    </button>
                                </div>
                            </div>

                            <p className="text-[#8197a4] mb-6 text-sm">
                                {adminSearchQuery.trim() !== ""
                                    ? `Showing ${filteredContent.length} results for "${adminSearchQuery}"`
                                    : `Total items: ${allContent.length}`
                                }
                            </p>

                            <div className="bg-[#1b252f] rounded-xl border border-[#303c44] overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-[#0f171e] text-[#8197a4] text-xs uppercase font-bold">
                                        <tr>
                                            <th className="px-6 py-4">Poster</th>
                                            <th className="px-6 py-4">Title</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#303c44]">
                                        {filteredContent.map((item) => (
                                            <tr
                                                key={item.id}
                                                onClick={() => handleEdit(item)}
                                                className="hover:bg-white/5 transition-all text-sm cursor-pointer group"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="w-12 h-16 bg-[#0f171e] rounded overflow-hidden border border-white/5">
                                                        {(item.poster_path || item.backdrop_path) ? (
                                                            <img
                                                                src={item.poster_path || item.backdrop_path}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-white/10">
                                                                <Database size={16} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-bold group-hover:text-[#00a8e1] transition-colors">{item.title}</td>
                                                <td className="px-6 py-4 capitalize">{item.type}</td>
                                                <td className="px-6 py-4">{item.category}</td>
                                                <td className="px-6 py-4">
                                                    {item.source === "movies" ? (
                                                        <span className="text-[#00a8e1] bg-[#00a8e1]/10 px-2 py-1 rounded text-xs">New Database</span>
                                                    ) : (
                                                        <span className="text-purple-400 bg-purple-400/10 px-2 py-1 rounded text-xs">Legacy Database</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                                            className="p-2 hover:text-red-500 transition-all"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : activeTab === "add-content" ? (
                        <div className="max-w-3xl">
                            <h1 className="text-3xl font-bold mb-2">{isEditing ? "Edit Content" : "Add New Content"}</h1>
                            <p className="text-[#8197a4] mb-10">
                                {isEditing ? "Update title details and save changes." : "Upload new movies, TV shows, or live channels to the platform."}
                            </p>

                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#1b252f] p-8 rounded-xl border border-[#303c44]">
                                <div className="col-span-2">
                                    <div className="flex justify-between items-end mb-2">
                                        <label className="block text-sm font-bold text-[#8197a4]">Title</label>
                                        <button
                                            type="button"
                                            onClick={fetchMetadata}
                                            disabled={isFetching}
                                            className="text-xs font-black uppercase tracking-widest text-[#00a8e1] hover:text-[#0092c3] flex items-center gap-1 transition-colors disabled:opacity-50"
                                        >
                                            <Database size={12} /> {isFetching ? "Fetching..." : "Auto-Fetch from TMDB"}
                                        </button>
                                    </div>
                                    <input
                                        required type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-[#0f171e] border border-[#303c44] rounded px-4 py-2 focus:border-primary outline-none"
                                        placeholder="Tu Meri Main Tera"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-[#8197a4] mb-2">Description / Overview (Optional)</label>
                                    <textarea
                                        rows={3}
                                        value={formData.overview}
                                        onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                                        className="w-full bg-[#0f171e] border border-[#303c44] rounded px-4 py-2 focus:border-primary outline-none resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#8197a4] mb-2">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                        className="w-full bg-[#0f171e] border border-[#303c44] rounded px-4 py-2 focus:border-primary outline-none"
                                    >
                                        <option value="movie">Movie</option>
                                        <option value="tv-show">TV Show</option>
                                        <option value="live">Live Channel</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#8197a4] mb-2">Category (Primary) (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-[#0f171e] border border-[#303c44] rounded px-4 py-2 focus:border-primary outline-none"
                                        placeholder="Romance"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#8197a4] mb-2">Director</label>
                                    <input
                                        type="text"
                                        value={formData.director}
                                        onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                                        className="w-full bg-[#0f171e] border border-[#303c44] rounded px-4 py-2 focus:border-primary outline-none"
                                        placeholder="S.S. Rajamouli"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-[#8197a4] mb-2">Cast (Comma separated)</label>
                                    <input
                                        type="text"
                                        value={formData.cast}
                                        onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                                        className="w-full bg-[#0f171e] border border-[#303c44] rounded px-4 py-2 focus:border-primary outline-none"
                                        placeholder="Prabhas, Rana Daggubati, Anushka Shetty"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#8197a4] mb-2">Genres (Comma separated) (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.genres}
                                        onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                                        className="w-full bg-[#0f171e] border border-[#303c44] rounded px-4 py-2 focus:border-primary outline-none"
                                        placeholder="Action, Thriller, Drama"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#8197a4] mb-2">Duration (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full bg-[#0f171e] border border-[#303c44] rounded px-4 py-2 focus:border-primary outline-none"
                                        placeholder="2h 15m or 45m"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#8197a4] mb-2">Maturity Rating</label>
                                    <select
                                        value={formData.maturityRating}
                                        onChange={(e) => setFormData({ ...formData, maturityRating: e.target.value })}
                                        className="w-full bg-[#0f171e] border border-[#303c44] rounded px-4 py-2 focus:border-primary outline-none"
                                    >
                                        <option value="U">U (All Ages)</option>
                                        <option value="U/A 7+">U/A 7+</option>
                                        <option value="U/A 13+">U/A 13+</option>
                                        <option value="U/A 16+">U/A 16+</option>
                                        <option value="A">A (Adults Only)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#8197a4] mb-2">Release Date (Year or YYYY-MM-DD) (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.release_date}
                                        onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                                        className="w-full bg-[#0f171e] border border-[#303c44] rounded px-4 py-2 focus:border-primary outline-none"
                                        placeholder="2024"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#8197a4] mb-2">Backdrop URL (16:9) (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.backdrop_path}
                                        onChange={(e) => setFormData({ ...formData, backdrop_path: e.target.value })}
                                        className="w-full bg-[#0f171e] border border-[#303c44] rounded px-4 py-2 focus:border-primary outline-none text-sm"
                                        placeholder="https://..."
                                    />
                                    {formData.backdrop_path && (
                                        <div className="mt-2 aspect-video w-full rounded border border-[#303c44] overflow-hidden bg-black">
                                            <img src={formData.backdrop_path} alt="Backdrop Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#8197a4] mb-2">Poster URL (2:3) (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.poster_path}
                                        onChange={(e) => setFormData({ ...formData, poster_path: e.target.value })}
                                        className="w-full bg-[#0f171e] border border-[#303c44] rounded px-4 py-2 focus:border-primary outline-none text-sm"
                                        placeholder="https://..."
                                    />
                                    {formData.poster_path && (
                                        <div className="mt-2 aspect-[2/3] w-32 rounded border border-[#303c44] overflow-hidden bg-black">
                                            <img src={formData.poster_path} alt="Poster Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 col-span-2 py-4 border-y border-[#303c44]">
                                    <div className="space-y-2 text-center">
                                        <label className="block text-sm font-bold text-[#8197a4]">Featured?</label>
                                        <div
                                            onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                                            className={`mx-auto w-12 h-6 rounded-full p-1 cursor-pointer transition-all ${formData.isFeatured ? "bg-[#00a8e1]" : "bg-[#0f171e] border border-[#303c44]"}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${formData.isFeatured ? "translate-x-6" : ""}`} />
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-center">
                                        <label className="block text-sm font-bold text-[#8197a4]">Published?</label>
                                        <div
                                            onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
                                            className={`mx-auto w-12 h-6 rounded-full p-1 cursor-pointer transition-all ${formData.isPublished ? "bg-green-500" : "bg-[#0f171e] border border-[#303c44]"}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${formData.isPublished ? "translate-x-6" : ""}`} />
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-center">
                                        <label className="block text-sm font-bold text-[#8197a4]">Allow Download?</label>
                                        <div
                                            onClick={() => setFormData({ ...formData, allowDownload: !formData.allowDownload })}
                                            className={`mx-auto w-12 h-6 rounded-full p-1 cursor-pointer transition-all ${formData.allowDownload ? "bg-[#00a8e1]" : "bg-[#0f171e] border border-[#303c44]"}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${formData.allowDownload ? "translate-x-6" : ""}`} />
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-center">
                                        <label className="block text-sm font-bold text-[#8197a4]">Allow Playback?</label>
                                        <div
                                            onClick={() => setFormData({ ...formData, allowPlayback: !formData.allowPlayback })}
                                            className={`mx-auto w-12 h-6 rounded-full p-1 cursor-pointer transition-all ${formData.allowPlayback ? "bg-[#00a8e1]" : "bg-[#0f171e] border border-[#303c44]"}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${formData.allowPlayback ? "translate-x-6" : ""}`} />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2 flex flex-wrap gap-4">
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-sm font-bold text-[#8197a4] mb-2">Quality Label</label>
                                        <select
                                            value={formData.quality}
                                            onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                                            className="w-full bg-[#0f171e] border border-[#303c44] rounded px-4 py-2 focus:border-primary outline-none"
                                        >
                                            <option value="HD">HD</option>
                                            <option value="4K">4K UHD</option>
                                            <option value="HDR">HDR</option>
                                            <option value="SD">SD</option>
                                        </select>
                                    </div>
                                    <div className="flex-[2] min-w-[200px]">
                                        <label className="block text-sm font-bold text-[#8197a4] mb-2">Search Tags (Comma separated)</label>
                                        <input
                                            type="text"
                                            value={formData.tags}
                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                            className="w-full bg-[#0f171e] border border-[#303c44] rounded px-4 py-2 focus:border-primary outline-none"
                                            placeholder="Trending, Blockbuster, Award-winning"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#303c44]">
                                    <div>
                                        <label className="block text-sm font-bold text-[#8197a4] mb-2">Trailer (YouTube ID or Link)</label>
                                        <input
                                            type="text"
                                            value={formData.youtubeId}
                                            onChange={(e) => setFormData({ ...formData, youtubeId: e.target.value })}
                                            className="w-full bg-[#0f171e] border border-[#303c44] rounded px-4 py-2 focus:border-primary outline-none"
                                            placeholder="YouTube ID or link"
                                        />
                                    </div>
                                    {formData.type !== "tv-show" && (
                                        <div>
                                            <label className="block text-sm font-bold text-[#8197a4] mb-2">Movie Drive ID / Video URL</label>
                                            <input
                                                type="text"
                                                value={formData.movieDriveID}
                                                onChange={(e) => setFormData({ ...formData, movieDriveID: e.target.value })}
                                                className="w-full bg-[#0f171e] border border-[#303c44] rounded px-4 py-2 focus:border-primary outline-none"
                                                placeholder="Google Drive ID or Direct link"
                                            />
                                        </div>
                                    )}
                                </div>

                                {formData.type === "tv-show" && (
                                    <div className="col-span-2 space-y-6 pt-4 border-t border-[#303c44]">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-xl font-bold">Seasons & Episodes</h3>
                                            <button
                                                type="button"
                                                onClick={addSeason}
                                                className="bg-[#00a8e1]/10 text-[#00a8e1] border border-[#00a8e1]/20 px-4 py-2 rounded font-bold hover:bg-[#00a8e1]/20 transition-all flex items-center gap-2"
                                            >
                                                <Plus size={16} /> Add Season
                                            </button>
                                        </div>

                                        {formData.seasons.map((season: any, sIdx: number) => (
                                            <SeasonSection
                                                key={sIdx}
                                                season={season}
                                                sIdx={sIdx}
                                                formData={formData}
                                                setFormData={setFormData}
                                                addEpisode={addEpisode}
                                                removeSeason={removeSeason}
                                                removeEpisode={removeEpisode}
                                                updateEpisode={updateEpisode}
                                                fetchSeasonMetadata={fetchSeasonMetadata}
                                                isFetchingEpisodes={isFetchingEpisodes}
                                            />
                                        ))}
                                    </div>
                                )}

                                <div className="col-span-2 pt-8 flex gap-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-[#00a8e1] text-white py-3 rounded font-bold hover:bg-[#0092c3] transition-all"
                                    >
                                        {isEditing ? "Save Changes" : "Save Content"}
                                    </button>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditingId(null);
                                                setFormData({
                                                    title: "", overview: "", type: "movie", category: "",
                                                    genres: "", duration: "", release_date: new Date().getFullYear().toString(),
                                                    maturityRating: "U", backdrop_path: "", poster_path: "", isFeatured: false,
                                                    isPublished: true, allowDownload: true, allowPlayback: true, quality: "HD",
                                                    youtubeId: "", movieDriveID: "", director: "", cast: "", seasons: [], tags: ""
                                                });
                                                setActiveTab("manage-content");
                                            }}
                                            className="px-6 border border-[#303c44] rounded font-bold hover:bg-white/5 transition-all text-[#8197a4]"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    ) : activeTab === "analytics" ? (
                        <div>
                            <h1 className="text-3xl font-bold mb-8">Platform Analytics</h1>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-[#1b252f] p-6 rounded-xl border border-[#303c44]">
                                    <p className="text-[#8197a4] text-sm font-bold mb-2 uppercase tracking-widest">Total Movies</p>
                                    <h3 className="text-3xl font-bold">{allContent.filter(i => i.type === 'movie').length}</h3>
                                </div>
                                <div className="bg-[#1b252f] p-6 rounded-xl border border-[#303c44]">
                                    <p className="text-[#8197a4] text-sm font-bold mb-2 uppercase tracking-widest">TV Shows</p>
                                    <h3 className="text-3xl font-bold">{allContent.filter(i => i.type === 'tv-show').length}</h3>
                                </div>
                                <div className="bg-[#1b252f] p-6 rounded-xl border border-[#303c44]">
                                    <p className="text-[#8197a4] text-sm font-bold mb-2 uppercase tracking-widest">Total Views</p>
                                    <h3 className="text-3xl font-bold">12.8K</h3>
                                </div>
                                <div className="bg-[#1b252f] p-6 rounded-xl border border-[#303c44]">
                                    <p className="text-[#8197a4] text-sm font-bold mb-2 uppercase tracking-widest">Avg. Watchtime</p>
                                    <h3 className="text-3xl font-bold">42m</h3>
                                </div>
                            </div>
                            <div className="bg-[#1b252f] p-8 rounded-xl border border-[#303c44] h-96 flex flex-col items-center justify-center text-[#8197a4]">
                                <BarChart3 size={48} className="mb-4 opacity-20" />
                                <p>Deep analytics integration coming soon.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-2xl">
                            <h1 className="text-3xl font-bold mb-8">System Settings</h1>
                            <div className="bg-[#1b252f] p-8 rounded-xl border border-[#303c44] space-y-8">
                                <div className="p-6 bg-[#1b252f] rounded-xl border border-[#303c44] space-y-4">
                                    <div className="flex items-center gap-3 text-red-400">
                                        <AlertTriangle size={24} />
                                        <h3 className="text-lg font-bold">Danger Zone</h3>
                                    </div>
                                    <p className="text-sm text-[#8197a4]">
                                        Use these tools to maintain your database. Be careful, some actions are irreversible.
                                    </p>
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        <button
                                            onClick={handleBulkRefresh}
                                            disabled={isRefreshing}
                                            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
                                        >
                                            <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
                                            {isRefreshing ? `Refreshing (${refreshProgress.current}/${refreshProgress.total})...` : "Bulk Refresh Metadata"}
                                        </button>
                                    </div>
                                    {isRefreshing && (
                                        <div className="w-full bg-[#0f171e] h-2 rounded-full overflow-hidden mt-4">
                                            <div
                                                className="bg-[#00a8e1] h-full transition-all duration-300"
                                                style={{ width: `${(refreshProgress.current / refreshProgress.total) * 100}%` }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 bg-[#1b252f] rounded-xl border border-[#303c44] space-y-6">
                                    <div className="flex items-center gap-3">
                                        <Settings size={24} className="text-[#00a8e1]" />
                                        <h3 className="text-lg font-bold">API Configuration</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-[#8197a4] mb-2">TMDB API Key (v3)</label>
                                            <input
                                                type="password"
                                                value={tmdbKey}
                                                onChange={(e) => setTmdbKey(e.target.value)}
                                                className="w-full bg-[#0f171e] border border-[#303c44] rounded px-4 py-2 focus:border-primary outline-none"
                                                placeholder="e547e17d4e91f3e62a571655cd1ccaff"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#8197a4] mb-2">IMDB API Key (OMDb API)</label>
                                            <input
                                                type="password"
                                                value={imdbKey}
                                                onChange={(e) => setImdbKey(e.target.value)}
                                                className="w-full bg-[#0f171e] border border-[#303c44] rounded px-4 py-2 focus:border-primary outline-none"
                                                placeholder="966c4f4f"
                                            />
                                        </div>
                                        <p className="text-xs text-[#8197a4]">
                                            These keys are used to automatically fetch movie details, posters, and cast information.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-[#303c44]">
                                    <button
                                        onClick={saveSettings}
                                        className="bg-[#00a8e1] text-white px-6 py-2 rounded font-bold hover:bg-[#0092c3] transition-all"
                                    >
                                        Save All Settings
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

