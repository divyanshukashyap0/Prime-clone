import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tv2, Smartphone, Tablet, Monitor, Gamepad2, Chrome, Download, Wifi, CheckCircle2 } from "lucide-react";

const devices = [
    {
        category: "Smart TVs",
        icon: Tv2,
        color: "text-[#00a8e1]",
        bg: "bg-[#00a8e1]/10",
        border: "border-[#00a8e1]/20",
        list: ["Samsung Smart TV (2016+)", "LG webOS TV (2016+)", "Sony Android TV", "TCL Roku TV", "Fire TV Edition TVs", "Hisense VIDAA TV", "Philips Android TV"],
    },
    {
        category: "Mobile & Tablets",
        icon: Smartphone,
        color: "text-[#46d369]",
        bg: "bg-[#46d369]/10",
        border: "border-[#46d369]/20",
        list: ["iPhone & iPad (iOS 14+)", "Android phones (Android 8+)", "Android tablets", "Kindle Fire tablets", "Fire HD 8 & 10"],
    },
    {
        category: "Computers",
        icon: Monitor,
        color: "text-yellow-400",
        bg: "bg-yellow-400/10",
        border: "border-yellow-400/20",
        list: ["Chrome browser", "Firefox browser", "Safari (Mac)", "Edge browser", "Windows 10/11 app", "macOS app"],
    },
    {
        category: "Streaming Devices",
        icon: Chrome,
        color: "text-orange-400",
        bg: "bg-orange-400/10",
        border: "border-orange-400/20",
        list: ["Amazon Fire TV Stick", "Chromecast with Google TV", "Apple TV (4th gen+)", "Roku devices", "NVIDIA SHIELD", "Android TV box"],
    },
    {
        category: "Game Consoles",
        icon: Gamepad2,
        color: "text-purple-400",
        bg: "bg-purple-400/10",
        border: "border-purple-400/20",
        list: ["PlayStation 4 & 5", "Xbox One, Series X/S", "Nintendo Switch", "Xbox 360 (limited)"],
    },
];

const features = [
    { icon: Download, title: "Offline Downloads", desc: "Download titles on mobile & tablet. Watch without internet on the go." },
    { icon: Wifi, title: "4K Ultra HD", desc: "Stream in stunning 4K HDR on supported devices and TVs." },
    { icon: Tablet, title: "3 Streams at Once", desc: "Watch on up to 3 devices simultaneously with one Prime account." },
    { icon: CheckCircle2, title: "Cross-Device Resume", desc: "Pick up exactly where you left off on any device, automatically." },
];

export default function WatchAnywherePage() {
    return (
        <div className="min-h-screen bg-[#0f171e] text-white">
            <Navbar />

            {/* Hero */}
            <div className="relative bg-gradient-to-b from-[#1a2736] to-[#0f171e] pt-28 pb-20 px-4 md:px-12 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00a8e1]/10 via-transparent to-transparent" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="flex justify-center gap-6 mb-8 opacity-70">
                        <Tv2 size={48} className="text-[#00a8e1]" />
                        <Smartphone size={42} className="text-[#46d369]" />
                        <Tablet size={40} className="text-yellow-400" />
                        <Monitor size={44} className="text-purple-400" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">Watch on Any Device,<br />Anywhere</h1>
                    <p className="text-[#8197a4] text-xl max-w-2xl mx-auto leading-relaxed">
                        Stream thousands of movies and TV shows on your TV, phone, tablet, or computer — online or offline.
                    </p>
                </div>
            </div>

            {/* Feature Highlights */}
            <div className="max-w-5xl mx-auto px-4 md:px-12 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    {features.map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="bg-[#1b252f] border border-white/5 rounded-xl p-6 hover:border-[#00a8e1]/40 transition-all">
                            <Icon className="text-[#00a8e1] mb-4" size={32} />
                            <h3 className="font-black mb-2">{title}</h3>
                            <p className="text-[#8197a4] text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>

                {/* Device Grid */}
                <h2 className="text-2xl font-black mb-8">Supported Devices</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {devices.map(({ category, icon: Icon, color, bg, border, list }) => (
                        <div key={category} className={`bg-[#1b252f] border ${border} rounded-2xl p-6 hover:scale-[1.01] transition-transform`}>
                            <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                                <Icon className={color} size={24} />
                            </div>
                            <h3 className="font-black text-lg mb-4">{category}</h3>
                            <ul className="space-y-2">
                                {list.map(item => (
                                    <li key={item} className="flex items-center gap-2 text-[#8197a4] text-sm">
                                        <CheckCircle2 size={14} className={color} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Download CTA */}
                <div className="bg-gradient-to-r from-[#1b252f] to-[#1a2736] border border-[#00a8e1]/20 rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h2 className="text-2xl font-black mb-2">Get the Prime Video App</h2>
                        <p className="text-[#8197a4]">Download for iOS or Android to watch offline, anytime.</p>
                    </div>
                    <div className="flex gap-4 shrink-0">
                        <button className="bg-white text-black font-black px-6 py-3 rounded-lg hover:bg-white/90 transition-all flex items-center gap-2">
                            <Download size={18} /> App Store
                        </button>
                        <button className="bg-white text-black font-black px-6 py-3 rounded-lg hover:bg-white/90 transition-all flex items-center gap-2">
                            <Download size={18} /> Google Play
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
