import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { User, Shield, LogOut, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function AccountPage() {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success("Logged out successfully");
            navigate("/");
        } catch (error) {
            toast.error("Logout failed");
        }
    };

    if (!user) {
        navigate("/login");
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0f171e] text-white">
            <Navbar />

            <main className="pt-28 px-4 md:px-12 max-w-4xl mx-auto pb-20">
                <div className="flex items-center gap-6 mb-12">
                    <div className="w-20 h-20 rounded-full bg-[#00a8e1] flex items-center justify-center text-white border-4 border-[#1b252f] shadow-2xl">
                        <User size={48} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">{user.displayName || "Prime Member"}</h1>
                        <p className="text-[#8197a4]">{user.email}</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    {/* Admin Access Section */}
                    {isAdmin && (
                        <Link
                            to="/admin"
                            className="bg-[#1b252f] p-6 rounded-lg border border-[#303c44] flex items-center justify-between hover:border-[#00a8e1] transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded bg-[#00a8e1]/10 flex items-center justify-center text-[#00a8e1]">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Admin Dashboard</h2>
                                    <p className="text-[#8197a4] text-sm">Manage movies, series, and live content.</p>
                                </div>
                            </div>
                            <ChevronRight className="text-[#8197a4] group-hover:text-white transition-colors" />
                        </Link>
                    )}

                    {/* Account Details */}
                    <section className="bg-[#1b252f] p-8 rounded-lg border border-[#303c44] space-y-8">
                        <div className="border-b border-[#303c44] pb-6">
                            <h2 className="text-xl font-bold mb-4">Membership & Billing</h2>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-[#f2f4f6]">Prime Membership</p>
                                    <p className="text-sm text-[#8197a4]">Active • Renews on Dec 20, 2026</p>
                                </div>
                                <button className="text-[#00a8e1] font-bold text-sm hover:underline">Manage Membership</button>
                            </div>
                        </div>

                        <div className="border-b border-[#303c44] pb-6">
                            <h2 className="text-xl font-bold mb-4">Account Settings</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[#8197a4]">Email</span>
                                    <span className="font-bold">{user.email}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[#8197a4]">Prime ID</span>
                                    <span className="font-bold uppercase">{user.uid.slice(0, 8)}...</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-900/50 py-3 rounded-lg font-bold transition-all"
                        >
                            <LogOut size={20} />
                            Sign Out of Prime Video
                        </button>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
