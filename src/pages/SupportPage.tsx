import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { HelpCircle, MessagesSquare, Mail, PlayCircle, Settings, FileText, ChevronDown } from "lucide-react";

export default function SupportPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const faqs = [
        {
            q: "How do I change my subscription plan?",
            a: "Go to your Account Settings, select 'Manage Subscription' under the Membership section, and choose your new plan."
        },
        {
            q: "Can I download movies to watch offline?",
            a: "Yes! Use our mobile or tablet app to download titles and watch them when you don't have an internet connection."
        },
        {
            q: "How do I set up parental controls?",
            a: "You can create a separate profile for your children and set a maturity rating limit when creating it. You can also protect your own profile with a 4-digit PIN."
        },
        {
            q: "Why is a video buffering?",
            a: "Buffering usually indicates a slow internet connection. Try lowering your default video quality in your Profile settings."
        }
    ];

    const topics = [
        { icon: PlayCircle, title: "Watching & Streaming", desc: "Troubleshoot playback issues" },
        { icon: Settings, title: "Account & Settings", desc: "Manage your profile and passwords" },
        { icon: FileText, title: "Billing & Subscriptions", desc: "Manage your payments and plans" },
    ];

    return (
        <div className="min-h-screen bg-[#0f171e] text-white flex flex-col">
            <Navbar />
            <main className="flex-1 pt-28 px-4 md:px-12 max-w-5xl mx-auto w-full pb-20">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">How can we help?</h1>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search for articles, questions, issues..."
                            className="w-full bg-[#1b252f] border-2 border-[#303c44] rounded-full px-6 py-4 text-lg font-bold outline-none focus:border-[#00a8e1] transition-colors pl-6"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {topics.map((topic, i) => {
                        const Icon = topic.icon;
                        return (
                            <div key={i} className="bg-[#1b252f] border border-[#303c44] rounded-2xl p-8 hover:bg-[#23303d] transition-colors cursor-pointer group">
                                <Icon className="text-[#00a8e1] w-12 h-12 mb-6 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-black mb-2">{topic.title}</h3>
                                <p className="text-[#8197a4]">{topic.desc}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                        <h2 className="text-2xl font-black mb-8">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <div key={i} className="bg-[#1b252f] border border-[#303c44] rounded-xl overflow-hidden group">
                                    <button className="w-full text-left p-6 flex items-center justify-between font-bold text-lg hover:text-[#00a8e1] transition-colors focus:outline-none">
                                        {faq.q}
                                        <ChevronDown className="text-[#8197a4] group-hover:text-[#00a8e1]" size={20} />
                                    </button>
                                    <div className="px-6 pb-6 text-[#8197a4] leading-relaxed hidden group-focus-within:block border-t border-[#303c44] pt-4">
                                        {faq.a}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#00a8e1] rounded-2xl p-8 text-white h-fit relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <MessagesSquare size={120} />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-2xl font-black mb-4">Still need help?</h2>
                            <p className="mb-8 font-medium">Our support team is available 24/7 to assist you with any questions or issues.</p>

                            <div className="space-y-4">
                                <button className="w-full py-4 bg-white text-[#00a8e1] rounded-xl font-black flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors">
                                    <MessagesSquare size={20} /> Start Live Chat
                                </button>
                                <button className="w-full py-4 bg-transparent border-2 border-white text-white rounded-xl font-black flex items-center justify-center gap-3 hover:bg-white/10 transition-colors">
                                    <Mail size={20} /> Send an Email
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
