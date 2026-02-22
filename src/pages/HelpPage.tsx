import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ChevronDown, ChevronUp, Search, MessageCircle, Phone, Mail, PlayCircle, Download, CreditCard, Shield, Wifi, Tv2, Settings2, HelpCircle } from "lucide-react";

const faqs = [
    {
        category: "Playback & Streaming",
        icon: PlayCircle,
        questions: [
            { q: "Why is my video buffering or loading slowly?", a: "Buffering can be caused by a slow internet connection. Prime Video recommends at least 1 Mbps for SD, 5 Mbps for HD, and 25 Mbps for Ultra HD content. Try restarting your router or connecting via Ethernet for a more stable connection." },
            { q: "How do I change video quality?", a: "Go to the player and click the Settings (gear) icon. From there you can choose between Auto, Good, Better, and Best quality options. 'Auto' adjusts based on your connection speed." },
            { q: "Why does the video keep stopping or crashing?", a: "Try clearing your browser cache, restarting the app, or checking that your device software is up to date. If problems persist, try uninstalling and reinstalling the app." },
        ]
    },
    {
        category: "Downloads",
        icon: Download,
        questions: [
            { q: "How many titles can I download?", a: "You can download up to 25 titles at a time on up to 3 registered devices. Some titles may not be available for download due to licensing restrictions." },
            { q: "How long do downloads last?", a: "Downloaded titles are available for up to 30 days. Once you start watching a downloaded title, you have 48 hours to finish it before it expires." },
            { q: "Can I download in HD?", a: "Yes, if you have a Prime membership, you can download titles in HD where available. Download quality can be set in the app Settings under Download Quality." },
        ]
    },
    {
        category: "Account & Billing",
        icon: CreditCard,
        questions: [
            { q: "How do I cancel my Prime membership?", a: "Go to Account & Settings → Manage Membership → End Membership. Your access continues until the end of your current billing period." },
            { q: "Why was I charged twice?", a: "This may be a temporary authorization hold. The duplicate charge should clear within 3–5 business days. Contact support if it does not resolve." },
            { q: "How do I update my payment method?", a: "Go to Account & Settings → Membership & Payment → Manage Payment Methods. You can add, remove, or set a default payment method there." },
        ]
    },
    {
        category: "Privacy & Security",
        icon: Shield,
        questions: [
            { q: "How do I manage parental controls?", a: "Go to Account & Settings → Parental Controls. You can set a PIN to restrict content by maturity rating, preventing access to content above a certain rating without the PIN." },
            { q: "How do I sign out of all devices?", a: "Go to Account & Settings → Registered Devices. You can deregister individual devices or sign out of all devices at once from this page." },
        ]
    },
];

export default function HelpPage() {
    const [openIdx, setOpenIdx] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const filteredFaqs = search
        ? faqs.map(cat => ({
            ...cat,
            questions: cat.questions.filter(q =>
                q.q.toLowerCase().includes(search.toLowerCase()) ||
                q.a.toLowerCase().includes(search.toLowerCase())
            )
        })).filter(cat => cat.questions.length > 0)
        : faqs;

    return (
        <div className="min-h-screen bg-[#0f171e] text-white">
            <Navbar />

            {/* Hero */}
            <div className="bg-gradient-to-b from-[#1a2736] to-[#0f171e] pt-28 pb-16 px-4 md:px-12 text-center">
                <HelpCircle className="mx-auto mb-4 text-[#00a8e1]" size={48} />
                <h1 className="text-4xl md:text-5xl font-black mb-4">How can we help?</h1>
                <p className="text-[#8197a4] text-lg mb-8">Search our Help Center or browse topics below</p>
                <div className="relative max-w-xl mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8197a4]" size={20} />
                    <input
                        type="text"
                        placeholder="Search help topics..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-white/10 border border-white/10 rounded-full pl-12 pr-6 py-4 text-white placeholder-[#8197a4] font-medium outline-none focus:border-[#00a8e1] focus:ring-1 focus:ring-[#00a8e1] transition-all"
                    />
                </div>
            </div>

            {/* Quick Links */}
            <div className="max-w-5xl mx-auto px-4 md:px-12 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    {[
                        { icon: PlayCircle, label: "Playback Help", color: "text-[#00a8e1]" },
                        { icon: Download, label: "Downloads", color: "text-[#46d369]" },
                        { icon: CreditCard, label: "Billing & Plans", color: "text-yellow-400" },
                        { icon: Shield, label: "Privacy & Security", color: "text-purple-400" },
                        { icon: Wifi, label: "Connectivity Issues", color: "text-orange-400" },
                        { icon: Tv2, label: "Device Support", color: "text-pink-400" },
                        { icon: Settings2, label: "Account Settings", color: "text-[#8197a4]" },
                        { icon: MessageCircle, label: "Contact Support", color: "text-red-400" },
                    ].map(({ icon: Icon, label, color }) => (
                        <button key={label} className="bg-[#1b252f] border border-white/5 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-[#00a8e1] hover:bg-[#1b252f]/80 transition-all group">
                            <Icon className={`${color} group-hover:scale-110 transition-transform`} size={28} />
                            <span className="text-sm font-bold text-center">{label}</span>
                        </button>
                    ))}
                </div>

                {/* FAQ Accordion */}
                <h2 className="text-2xl font-black mb-8">Frequently Asked Questions</h2>
                <div className="space-y-8">
                    {filteredFaqs.map(cat => (
                        <div key={cat.category}>
                            <div className="flex items-center gap-3 mb-4">
                                <cat.icon className="text-[#00a8e1]" size={20} />
                                <h3 className="text-lg font-black text-[#00a8e1]">{cat.category}</h3>
                            </div>
                            <div className="space-y-2">
                                {cat.questions.map((item, i) => {
                                    const key = `${cat.category}-${i}`;
                                    const isOpen = openIdx === key;
                                    return (
                                        <div key={key} className="bg-[#1b252f] border border-white/5 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => setOpenIdx(isOpen ? null : key)}
                                                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-all"
                                            >
                                                <span className="font-bold pr-4">{item.q}</span>
                                                {isOpen ? <ChevronUp size={18} className="text-[#00a8e1] shrink-0" /> : <ChevronDown size={18} className="text-[#8197a4] shrink-0" />}
                                            </button>
                                            {isOpen && (
                                                <div className="px-5 pb-5 text-[#8197a4] leading-relaxed border-t border-white/5 pt-4">
                                                    {item.a}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Support */}
                <div className="mt-16 bg-[#1b252f] border border-white/10 rounded-2xl p-10 text-center">
                    <h2 className="text-2xl font-black mb-2">Still need help?</h2>
                    <p className="text-[#8197a4] mb-8">Our support team is available 24/7</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="flex items-center gap-3 bg-[#00a8e1] hover:bg-[#00a8e1]/90 text-white font-black px-8 py-4 rounded-lg transition-all">
                            <MessageCircle size={20} /> Live Chat
                        </button>
                        <button className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black px-8 py-4 rounded-lg transition-all">
                            <Phone size={20} /> Call Support
                        </button>
                        <button className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black px-8 py-4 rounded-lg transition-all">
                            <Mail size={20} /> Email Us
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
