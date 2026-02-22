import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { User, Pencil, Trash2, Check } from "lucide-react";
import { toast } from "sonner";

const avatarColors = [
    "#00a8e1", "#46d369", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"
];

export default function EditProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState(user?.displayName || "Prime Member");
    const [selectedColor, setSelectedColor] = useState(avatarColors[0]);
    const [autoplay, setAutoplay] = useState(true);
    const [previews, setPreviews] = useState(true);
    const [saving, setSaving] = useState(false);

    if (!user) { navigate("/login"); return null; }

    const handleSave = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 800));
        toast.success("Profile updated!");
        navigate("/account");
        setSaving(false);
    };

    return (
        <div className="min-h-screen bg-[#0f171e] text-white">
            <Navbar />
            <main className="pt-28 pb-20 px-4 md:px-12 max-w-lg mx-auto">
                <h1 className="text-3xl font-black mb-2">Edit Profile</h1>
                <p className="text-[#8197a4] mb-10">Update your profile name, avatar and preferences.</p>

                {/* Avatar */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div
                            className="w-28 h-28 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/10 transition-all"
                            style={{ backgroundColor: selectedColor }}
                        >
                            {user.photoURL
                                ? <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover rounded-full" />
                                : <User size={52} className="text-white" />}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#00a8e1] rounded-full flex items-center justify-center border-2 border-[#0f171e]">
                            <Pencil size={14} />
                        </div>
                    </div>
                </div>

                {/* Color Picker */}
                <div className="flex justify-center gap-3 mb-10">
                    {avatarColors.map(color => (
                        <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                            style={{ backgroundColor: color, borderColor: selectedColor === color ? "white" : "transparent" }}
                        >
                            {selectedColor === color && <Check size={14} className="text-white mx-auto" />}
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-black text-[#8197a4] mb-2 uppercase tracking-widest">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            maxLength={20}
                            className="w-full bg-[#1b252f] border border-white/10 rounded-lg px-5 py-4 font-bold text-white outline-none focus:border-[#00a8e1] transition-all"
                        />
                    </div>

                    {/* Playback Preferences */}
                    <div className="bg-[#1b252f] border border-white/5 rounded-xl p-6 space-y-5">
                        <h3 className="font-black text-sm uppercase tracking-widest text-[#8197a4]">Playback Preferences</h3>
                        {[
                            { label: "Autoplay next episode", sub: "Automatically play the next episode in a series", val: autoplay, set: setAutoplay },
                            { label: "Video previews", sub: "Show animated previews while browsing", val: previews, set: setPreviews },
                        ].map(({ label, sub, val, set }) => (
                            <div key={label} className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold">{label}</p>
                                    <p className="text-[#8197a4] text-sm">{sub}</p>
                                </div>
                                <button
                                    onClick={() => set(!val)}
                                    className={`w-12 h-6 rounded-full transition-all ${val ? "bg-[#00a8e1]" : "bg-white/10"}`}
                                >
                                    <span className={`block w-5 h-5 bg-white rounded-full shadow transition-all mx-0.5 ${val ? "translate-x-6" : ""}`} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-2">
                        <button
                            onClick={() => navigate("/account")}
                            className="flex-1 py-4 border border-white/20 rounded-lg font-black hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 py-4 bg-[#00a8e1] hover:bg-[#00a8e1]/90 text-white rounded-lg font-black transition-all disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>

                    {/* Delete Profile */}
                    <button className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 font-bold text-sm py-3 border border-red-900/30 rounded-lg hover:bg-red-900/10 transition-all">
                        <Trash2 size={16} /> Delete Profile
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
}
