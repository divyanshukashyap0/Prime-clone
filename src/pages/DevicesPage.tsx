import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { Monitor, Smartphone, Laptop, Tv, LogOut, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function DevicesPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Mock device data
    const [devices, setDevices] = useState([
        { id: 1, name: "MacBook Pro", type: "laptop", location: "Bangalore, IN", active: true, lastActive: "Just now" },
        { id: 2, name: "iPhone 13", type: "mobile", location: "Bangalore, IN", active: false, lastActive: "2 hours ago" },
        { id: 3, name: "Samsung Smart TV", type: "tv", location: "Mumbai, IN", active: false, lastActive: "Yesterday" }
    ]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!user) {
        navigate("/login");
        return null;
    }

    const handleSignOut = (id: number) => {
        setDevices(prev => prev.filter(d => d.id !== id));
        toast.success("Signed out of device successfully");
    };

    const handleSignOutAll = () => {
        setDevices(prev => prev.filter(d => d.active));
        toast.success("Signed out of all other devices");
    };

    const getDeviceIcon = (type: string) => {
        switch (type) {
            case "laptop": return <Laptop size={32} className="text-[#00a8e1]" />;
            case "mobile": return <Smartphone size={32} className="text-[#00a8e1]" />;
            case "tv": return <Tv size={32} className="text-[#00a8e1]" />;
            default: return <Monitor size={32} className="text-[#00a8e1]" />;
        }
    };

    return (
        <div className="min-h-screen bg-[#0f171e] text-white flex flex-col">
            <Navbar />
            <main className="flex-1 pt-28 px-4 md:px-12 max-w-4xl mx-auto w-full pb-20">
                <div className="mb-10 flex flex-col gap-2">
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                        <Monitor className="text-[#00a8e1] w-10 h-10" /> Registered Devices
                    </h1>
                    <p className="text-[#8197a4]">Manage devices where your account is currently signed in.</p>
                </div>

                <div className="bg-[#1b252f] rounded-2xl border border-[#303c44] shadow-2xl overflow-hidden">
                    <div className="p-8 border-b border-[#303c44] flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black">Your Devices</h2>
                            <p className="text-sm text-[#8197a4] mt-1">You are currently signed in on {devices.length} {devices.length === 1 ? 'device' : 'devices'}.</p>
                        </div>
                        {devices.length > 1 && (
                            <button
                                onClick={handleSignOutAll}
                                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg font-bold text-sm transition-all"
                            >
                                Sign out of all other devices
                            </button>
                        )}
                    </div>

                    <div className="divide-y divide-[#303c44]">
                        {devices.map((device) => (
                            <div key={device.id} className="p-6 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-xl bg-[#0f171e] border border-[#303c44] flex items-center justify-center shrink-0">
                                        {getDeviceIcon(device.type)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <p className="font-bold text-lg">{device.name}</p>
                                            {device.active && (
                                                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#46d369] bg-[#46d369]/10 px-2 py-0.5 rounded-full">
                                                    <CheckCircle2 size={10} /> Active Now
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-[#8197a4] mt-1">{device.location} • Last active: {device.lastActive}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-[#303c44] pt-4 md:pt-0">
                                    {!device.active && (
                                        <button
                                            onClick={() => handleSignOut(device.id)}
                                            className="w-full md:w-auto px-6 py-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 rounded-lg font-black text-sm flex items-center justify-center gap-2 transition-all"
                                        >
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
