import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { User, Shield, LogOut, ChevronRight, Plus, Pencil, Check, Mail, UserCircle, X, Monitor } from "lucide-react";
import { toast } from "sonner";

export default function AccountPage() {
    const { user, isAdmin, preferences, activeProfile, switchProfile, updateAccount } = useAuth();
    const navigate = useNavigate();

    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [newName, setNewName] = useState(user?.displayName || "");
    const [newEmail, setNewEmail] = useState(user?.email || "");
    const [updating, setUpdating] = useState(false);

    const [pinPromptInfo, setPinPromptInfo] = useState<{ id: string, pin: string } | null>(null);
    const [enteredPin, setEnteredPin] = useState("");

    const handleProfileClick = (profile: any) => {
        if (profile.pin && preferences.activeProfileId !== profile.id) {
            setPinPromptInfo({ id: profile.id, pin: profile.pin });
            setEnteredPin("");
        } else {
            switchProfile(profile.id);
        }
    };

    const handlePinSubmit = () => {
        if (pinPromptInfo && enteredPin === pinPromptInfo.pin) {
            switchProfile(pinPromptInfo.id);
            setPinPromptInfo(null);
            toast.success("Profile switched");
        } else {
            toast.error("Incorrect PIN");
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success("Logged out successfully");
            navigate("/");
        } catch (error) {
            toast.error("Logout failed");
        }
    };

    const handleUpdateName = async () => {
        if (!newName.trim() || newName === user?.displayName) {
            setIsEditingName(false);
            return;
        }
        setUpdating(true);
        try {
            await updateAccount({ displayName: newName.trim() });
            toast.success("Name updated successfully");
            setIsEditingName(false);
        } catch (error) {
            toast.error("Failed to update name");
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateEmail = async () => {
        if (!newEmail.trim() || newEmail === user?.email) {
            setIsEditingEmail(false);
            return;
        }
        setUpdating(true);
        try {
            await updateAccount({ email: newEmail.trim() });
            toast.success("Email updated successfully");
            setIsEditingEmail(false);
        } catch (error) {
            toast.error("Failed to update email. You may need to re-login.");
        } finally {
            setUpdating(false);
        }
    };

    if (!user) {
        navigate("/login");
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0f171e] text-white">
            <Navbar />

            <main className="pt-28 px-4 md:px-12 max-w-5xl mx-auto pb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div className="flex items-center gap-6">
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center text-white border-4 border-[#1b252f] shadow-2xl transition-all"
                            style={{ backgroundColor: activeProfile?.avatarColor || "#00a8e1" }}
                        >
                            <User size={56} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-4xl font-black tracking-tight">{user.displayName || "Prime Member"}</h1>
                                {isAdmin && <span className="bg-[#00a8e1] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Admin</span>}
                            </div>
                            <p className="text-[#8197a4] font-medium">{user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profiles Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-[#1b252f] rounded-2xl border border-[#303c44] overflow-hidden shadow-2xl">
                            <div className="p-8 border-b border-[#303c44] flex items-center justify-between bg-white/[0.02]">
                                <div>
                                    <h2 className="text-xl font-black mb-1">Profiles</h2>
                                    <p className="text-[#8197a4] text-sm">Personalized space for each viewer</p>
                                </div>
                                <Link
                                    to="/profiles/new"
                                    className="flex items-center gap-2 bg-[#00a8e1] hover:bg-[#0092c3] text-white px-4 py-2 rounded-lg font-black text-xs transition-all hover:scale-105"
                                >
                                    <Plus size={16} /> Add Profile
                                </Link>
                            </div>

                            <div className="p-8 grid grid-cols-2 md:grid-cols-3 gap-6">
                                {preferences.profiles.map(profile => (
                                    <div key={profile.id} className="group relative">
                                        <button
                                            onClick={() => handleProfileClick(profile)}
                                            className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all ${preferences.activeProfileId === profile.id
                                                ? "ring-4 ring-[#00a8e1] ring-offset-4 ring-offset-[#1b252f]"
                                                : "opacity-60 hover:opacity-100"
                                                }`}
                                            style={{ backgroundColor: profile.avatarColor }}
                                        >
                                            <User size={48} className="text-white mb-2" />
                                            <span className="font-black text-sm absolute bottom-4">{profile.name}</span>
                                        </button>
                                        <Link
                                            to={`/profiles/edit/${profile.id}`}
                                            className="absolute -top-2 -right-2 p-2 bg-[#252e39] border border-[#303c44] rounded-full text-[#8197a4] hover:text-white transition-colors shadow-lg"
                                        >
                                            <Pencil size={14} />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Account Controls */}
                        <section className="bg-[#1b252f] rounded-2xl border border-[#303c44] overflow-hidden shadow-2xl">
                            <div className="p-8 border-b border-[#303c44] bg-white/[0.02]">
                                <h2 className="text-xl font-black mb-1">Account Management</h2>
                                <p className="text-[#8197a4] text-sm">Update your contact and billing information</p>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Name Update */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[#0f171e] rounded-xl border border-[#303c44]/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#8197a4]">
                                            <UserCircle size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[#8197a4] text-[10px] font-black uppercase tracking-widest">Display Name</p>
                                            {isEditingName ? (
                                                <input
                                                    autoFocus
                                                    value={newName}
                                                    onChange={e => setNewName(e.target.value)}
                                                    className="bg-transparent border-b border-[#00a8e1] outline-none font-bold py-1 w-full"
                                                />
                                            ) : (
                                                <p className="font-bold">{user.displayName || "Not set"}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {isEditingName ? (
                                            <>
                                                <button onClick={handleUpdateName} disabled={updating} className="text-[#46d369] font-black text-sm hover:underline flex items-center gap-1">
                                                    <Check size={16} /> Save
                                                </button>
                                                <button onClick={() => { setIsEditingName(false); setNewName(user?.displayName || ""); }} className="text-[#8197a4] font-black text-sm hover:underline">Cancel</button>
                                            </>
                                        ) : (
                                            <button onClick={() => setIsEditingName(true)} className="text-[#00a8e1] font-black text-sm hover:underline">Update</button>
                                        )}
                                    </div>
                                </div>

                                {/* Email Update */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[#0f171e] rounded-xl border border-[#303c44]/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#8197a4]">
                                            <Mail size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[#8197a4] text-[10px] font-black uppercase tracking-widest">Email Address</p>
                                            {isEditingEmail ? (
                                                <input
                                                    autoFocus
                                                    type="email"
                                                    value={newEmail}
                                                    onChange={e => setNewEmail(e.target.value)}
                                                    className="bg-transparent border-b border-[#00a8e1] outline-none font-bold py-1 w-full"
                                                />
                                            ) : (
                                                <p className="font-bold">{user.email}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {isEditingEmail ? (
                                            <>
                                                <button onClick={handleUpdateEmail} disabled={updating} className="text-[#46d369] font-black text-sm hover:underline flex items-center gap-1">
                                                    <Check size={16} /> Save
                                                </button>
                                                <button onClick={() => { setIsEditingEmail(false); setNewEmail(user?.email || ""); }} className="text-[#8197a4] font-black text-sm hover:underline">Cancel</button>
                                            </>
                                        ) : (
                                            <button onClick={() => setIsEditingEmail(true)} className="text-[#00a8e1] font-black text-sm hover:underline">Update</button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Links */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-0 p-8 border-t border-[#303c44]/50">
                                <Link to="/security" className="flex items-center gap-4 p-6 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all group">
                                    <div className="w-12 h-12 rounded-full bg-[#1b252f] flex items-center justify-center group-hover:bg-[#00a8e1] transition-colors">
                                        <Shield className="text-[#8197a4] group-hover:text-white" size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">Security Settings</p>
                                        <p className="text-[#8197a4] text-xs font-medium">Update your password</p>
                                    </div>
                                </Link>
                                <Link to="/devices" className="flex items-center gap-4 p-6 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all group">
                                    <div className="w-12 h-12 rounded-full bg-[#1b252f] flex items-center justify-center group-hover:bg-[#00a8e1] transition-colors">
                                        <Monitor className="text-[#8197a4] group-hover:text-white" size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">Your Devices</p>
                                        <p className="text-[#8197a4] text-xs font-medium">Manage signed-in devices</p>
                                    </div>
                                </Link>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        {isAdmin && (
                            <Link
                                to="/admin"
                                className="block p-8 bg-gradient-to-br from-[#00a8e1]/20 to-[#00a8e1]/5 rounded-2xl border border-[#00a8e1]/30 hover:border-[#00a8e1]/60 transition-all group overflow-hidden relative"
                            >
                                <div className="relative z-10">
                                    <Shield className="text-[#00a8e1] mb-4 group-hover:scale-110 transition-transform" size={40} />
                                    <h3 className="text-xl font-black mb-1">Admin Panel</h3>
                                    <p className="text-[#8197a4] text-sm">Manage entire platform catalog</p>
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Shield size={120} />
                                </div>
                            </Link>
                        )}

                        <div className="bg-[#1b252f] p-8 rounded-2xl border border-[#303c44] flex flex-col gap-6">
                            <div>
                                <h3 className="font-black text-sm uppercase tracking-widest text-[#8197a4] mb-2">Membership</h3>
                                <p className="font-black text-xl text-white">{preferences.subscription?.planName || 'Free Plan'}</p>
                                <p className="text-sm text-[#8197a4] mt-1">
                                    {preferences.subscription?.planName === 'Free' ? 'Upgrade to watch premium content' : `Active subscription (${preferences.subscription?.billingCycle})`}
                                </p>
                            </div>

                            <Link to="/subscription" className="w-full py-3 bg-[#00a8e1] hover:bg-[#0092c3] text-white text-center rounded-xl font-black text-sm transition-all">
                                Manage Subscription
                            </Link>

                            <Link to="/billing-history" className="w-full flex items-center justify-center py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-center rounded-xl font-black text-sm transition-all text-[#8197a4] hover:text-white">
                                View Billing History
                            </Link>

                            <hr className="border-[#303c44] w-full" />

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-900/50 py-4 rounded-xl font-black transition-all"
                            >
                                <LogOut size={20} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* PIN Prompt Modal */}
            {pinPromptInfo && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#1b252f] rounded-2xl p-8 max-w-sm w-full border border-white/10 shadow-2xl relative">
                        <button onClick={() => setPinPromptInfo(null)} className="absolute top-4 right-4 text-[#8197a4] hover:text-white">
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-black mb-2">Enter PIN</h2>
                        <p className="text-[#8197a4] text-sm mb-6">This profile is PIN protected.</p>
                        <input
                            type="password"
                            autoFocus
                            maxLength={4}
                            value={enteredPin}
                            onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                            onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
                            className="w-full bg-[#0f171e] text-white border border-white/10 rounded-lg px-5 py-4 text-center text-3xl tracking-widest font-black outline-none focus:border-[#00a8e1] transition-all mb-6"
                        />
                        <button onClick={handlePinSubmit} className="w-full py-4 bg-[#00a8e1] hover:bg-[#00a8e1]/90 text-white rounded-lg font-black transition-all">
                            Unlock Profile
                        </button>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
