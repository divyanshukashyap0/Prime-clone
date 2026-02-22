import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { Shield, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function SecuritySettingsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!user) {
        navigate("/login");
        return null;
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password should be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            if (user.email && currentPassword) {
                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                await reauthenticateWithCredential(user, credential);
                await updatePassword(user, newPassword);
                toast.success("Password updated successfully");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                toast.error("Please enter your current password.");
            }
        } catch (error: any) {
            console.error("Password update error", error);
            if (error.code === 'auth/invalid-credential') {
                toast.error("Current password is incorrect.");
            } else {
                toast.error(error.message || "Failed to update password");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f171e] text-white flex flex-col">
            <Navbar />
            <main className="flex-1 pt-28 px-4 md:px-12 max-w-3xl mx-auto w-full pb-20">
                <div className="mb-10 flex flex-col gap-2">
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                        <Shield className="text-[#00a8e1] w-10 h-10" /> Security Settings
                    </h1>
                    <p className="text-[#8197a4]">Update your password and secure your account.</p>
                </div>

                <div className="bg-[#1b252f] rounded-2xl border border-[#303c44] p-8 md:p-12 shadow-2xl">
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                        <Lock className="text-[#00a8e1]" size={20} /> Change Password
                    </h2>

                    {/* Provider warning */}
                    {user.providerData.some(p => p.providerId === 'google.com') && (
                        <div className="mb-8 p-4 bg-[#00a8e1]/10 border border-[#00a8e1]/30 rounded-xl flex items-start gap-4">
                            <AlertCircle className="text-[#00a8e1] shrink-0 mt-0.5" size={20} />
                            <p className="text-sm text-[#8197a4]">
                                You are signed in with Google. If you wish to set a local password, please ensure you use the same email address.
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-black text-[#8197a4] mb-2 uppercase tracking-widest">Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-[#0f171e] border border-[#303c44] rounded-lg px-5 py-4 font-bold text-white outline-none focus:border-[#00a8e1] transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-black text-[#8197a4] mb-2 uppercase tracking-widest">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-[#0f171e] border border-[#303c44] rounded-lg px-5 py-4 font-bold text-white outline-none focus:border-[#00a8e1] transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-black text-[#8197a4] mb-2 uppercase tracking-widest">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-[#0f171e] border border-[#303c44] rounded-lg px-5 py-4 font-bold text-white outline-none focus:border-[#00a8e1] transition-all"
                                required
                            />
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate("/account")}
                                className="px-8 py-4 bg-transparent hover:bg-white/5 border border-[#303c44] text-white rounded-lg font-black transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-4 bg-[#00a8e1] hover:bg-[#00a8e1]/90 text-white rounded-lg font-black transition-all disabled:opacity-60"
                            >
                                {loading ? "Updating..." : "Update Password"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}
