import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { User, Pencil, Check } from "lucide-react";
import { toast } from "sonner";

const avatarColors = [
    "#00a8e1", "#46d369", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"
];

const maturityRatings = ["Little Kids (U)", "Older Kids (U/A 7+)", "Teens (U/A 13+)", "Adults (A)"];

export default function AddProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [selectedColor, setSelectedColor] = useState(avatarColors[0]);
    const [maturity, setMaturity] = useState("Teens (U/A 13+)");
    const [saving, setSaving] = useState(false);

    if (!user) { navigate("/login"); return null; }

    const handleSave = async () => {
        if (!name.trim()) { toast.error("Please enter a profile name"); return; }
        setSaving(true);
        await new Promise(r => setTimeout(r, 800)); // simulate save
        toast.success(`Profile "${name}" created!`);
        navigate("/account");
        setSaving(false);
    };

    return (
        <div className="min-h-screen bg-[#0f171e] text-white">
            <Navbar />
            <main className="pt-28 pb-20 px-4 md:px-12 max-w-lg mx-auto">
                <h1 className="text-3xl font-black mb-2">Add a Profile</h1>
                <p className="text-[#8197a4] mb-10">Create a profile to keep your watchlist and recommendations separate.</p>

                {/* Avatar Preview */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div
                            className="w-28 h-28 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white/10 transition-all"
                            style={{ backgroundColor: selectedColor }}
                        >
                            <User size={52} />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#00a8e1] rounded-full flex items-center justify-center border-2 border-[#0f171e]">
                            <Pencil size={14} />
                        </div>
                    </div>
                </div>

                {/* Avatar Color Picker */}
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
                        <label className="block text-sm font-black text-[#8197a4] mb-2 uppercase tracking-widest">Profile Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Arjun, Family, Kids..."
                            value={name}
                            onChange={e => setName(e.target.value)}
                            maxLength={20}
                            className="w-full bg-[#1b252f] border border-white/10 rounded-lg px-5 py-4 font-bold text-white placeholder-[#8197a4] outline-none focus:border-[#00a8e1] transition-all"
                        />
                        <p className="text-[#8197a4] text-xs mt-1 text-right">{name.length}/20</p>
                    </div>

                    {/* Maturity Rating */}
                    <div>
                        <label className="block text-sm font-black text-[#8197a4] mb-2 uppercase tracking-widest">Maturity Rating</label>
                        <div className="grid grid-cols-2 gap-3">
                            {maturityRatings.map(r => (
                                <button
                                    key={r}
                                    onClick={() => setMaturity(r)}
                                    className={`py-3 px-4 rounded-lg border font-bold text-sm transition-all ${maturity === r
                                        ? "bg-[#00a8e1] border-[#00a8e1] text-white"
                                        : "bg-[#1b252f] border-white/10 text-[#8197a4] hover:border-white/30"}`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
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
                            {saving ? "Saving..." : "Save Profile"}
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
