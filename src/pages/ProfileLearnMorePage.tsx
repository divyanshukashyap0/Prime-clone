import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Lock, Star, Shield, Film, BookmarkCheck, ChevronRight } from "lucide-react";

const benefits = [
    {
        icon: Users,
        color: "text-[#00a8e1]",
        bg: "bg-[#00a8e1]/10",
        title: "Up to 6 Profiles",
        desc: "Each household member gets their own profile — separate watchlists, recommendations, and watch history."
    },
    {
        icon: Lock,
        color: "text-[#46d369]",
        bg: "bg-[#46d369]/10",
        title: "Pin-Protected Profiles",
        desc: "Set a PIN on any profile to prevent others from accessing it without your permission."
    },
    {
        icon: Star,
        color: "text-yellow-400",
        bg: "bg-yellow-400/10",
        title: "Personalized Recommendations",
        desc: "Get movie and show suggestions tailored specifically to each viewer's taste and history."
    },
    {
        icon: Shield,
        color: "text-purple-400",
        bg: "bg-purple-400/10",
        title: "Kids Profiles",
        desc: "Create a safe, filtered profile for children with only age-appropriate content visible."
    },
    {
        icon: Film,
        color: "text-orange-400",
        bg: "bg-orange-400/10",
        title: "Separate Watch History",
        desc: "Your Continue Watching list is always personal to you. No cross-profile history mixing."
    },
    {
        icon: BookmarkCheck,
        color: "text-pink-400",
        bg: "bg-pink-400/10",
        title: "Individual Watchlists",
        desc: "Each profile has their own Watchlist — save titles without affecting other members of the household."
    },
];

const faqs = [
    { q: "How many profiles can I create?", a: "You can create up to 6 profiles per Prime Video account, including 1 default profile." },
    { q: "Can I switch between profiles easily?", a: "Yes — tap or click your avatar in the top-right corner of any page to switch profiles instantly." },
    { q: "Is each profile completely separate?", a: "Yes. Watch history, continue watching, recommendations, and watchlist are all independently maintained per profile." },
    { q: "Can I set a PIN to protect a profile?", a: "Yes, you can set a 5-digit PIN on any profile from the Profile Settings. The PIN is required to access that profile." },
    { q: "Can I delete a profile?", a: "Yes. You can delete any profile (except the main account profile) from Edit Profile. Deleted profiles cannot be recovered." },
];

export default function ProfileLearnMorePage() {
    return (
        <div className="min-h-screen bg-[#0f171e] text-white">
            <Navbar />

            {/* Hero */}
            <div className="bg-gradient-to-b from-[#1a2736] to-[#0f171e] pt-28 pb-16 px-4 md:px-12 text-center">
                <div className="flex justify-center gap-[-8px] mb-8">
                    {["#00a8e1", "#46d369", "#f59e0b", "#ef4444"].map((color, i) => (
                        <div key={color} className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-[#0f171e] -ml-3 first:ml-0" style={{ backgroundColor: color, zIndex: 4 - i }}>
                            <Users size={28} className="text-white" />
                        </div>
                    ))}
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-4">Prime Video Profiles</h1>
                <p className="text-[#8197a4] text-xl max-w-2xl mx-auto">
                    One account, everyone's own experience. Create separate profiles for every member of your household.
                </p>
            </div>

            <div className="max-w-5xl mx-auto px-4 md:px-12 py-12">
                {/* Quick Actions */}
                <div className="flex gap-4 justify-center mb-16">
                    <Link to="/profiles/new" className="flex items-center gap-2 bg-[#00a8e1] hover:bg-[#00a8e1]/90 text-white font-black px-8 py-4 rounded-lg transition-all">
                        Add a Profile <ChevronRight size={18} />
                    </Link>
                    <Link to="/profiles/edit" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black px-8 py-4 rounded-lg transition-all">
                        Edit Profile <ChevronRight size={18} />
                    </Link>
                </div>

                {/* Benefits */}
                <h2 className="text-2xl font-black mb-8">What you get with Profiles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {benefits.map(({ icon: Icon, color, bg, title, desc }) => (
                        <div key={title} className="bg-[#1b252f] border border-white/5 rounded-2xl p-6 hover:border-[#00a8e1]/30 transition-all">
                            <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                                <Icon className={color} size={24} />
                            </div>
                            <h3 className="font-black text-lg mb-2">{title}</h3>
                            <p className="text-[#8197a4] text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>

                {/* FAQ */}
                <h2 className="text-2xl font-black mb-6">Profile FAQs</h2>
                <div className="space-y-4">
                    {faqs.map(({ q, a }) => (
                        <div key={q} className="bg-[#1b252f] border border-white/5 rounded-xl p-6">
                            <p className="font-black mb-2">{q}</p>
                            <p className="text-[#8197a4] text-sm leading-relaxed">{a}</p>
                        </div>
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    );
}
