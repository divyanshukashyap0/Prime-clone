import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function SubscriptionPage() {
    const { preferences, updateSubscription } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const currentPlan = preferences?.subscription?.planName || "Free";

    const plans = [
        {
            name: "Free",
            price: "₹0",
            cycle: "none",
            description: "Basic access to free content with ads.",
            features: ["Ad-supported viewing", "720p resolution"],
            color: "border-[#303c44] bg-[#1b252f]"
        },
        {
            name: "Prime Lite",
            price: "₹799",
            cycle: "yearly",
            description: "Great value for single mobile devices.",
            features: ["Ad-free viewing", "1080p resolution", "1 mobile device limit", "Download for offline viewing"],
            color: "border-[#00a8e1]/50 bg-[#00a8e1]/10"
        },
        {
            name: "Prime Monthly",
            price: "₹299",
            cycle: "monthly",
            description: "Flexible monthly plan for all devices.",
            features: ["Ad-free viewing", "4K HDR support", "Multiple devices", "Download for offline viewing"],
            color: "border-[#00a8e1] bg-[#00a8e1]/20"
        },
        {
            name: "Prime Annual",
            price: "₹1499",
            cycle: "yearly",
            description: "Best overall value for all devices.",
            features: ["Ad-free viewing", "4K HDR support", "Multiple devices", "Exclusive deals & music"],
            color: "border-yellow-500 bg-yellow-500/10"
        }
    ];

    const handleUpgrade = async (plan: any) => {
        if (plan.name === currentPlan) return;
        setLoading(true);
        // Simulate payment/processing delay
        setTimeout(async () => {
            await updateSubscription({
                planName: plan.name,
                billingCycle: plan.cycle,
                amount: parseInt(plan.price.replace('₹', '')) || 0,
                nextRenewal: new Date(Date.now() + (plan.cycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString()
            });
            toast.success(`Successfully upgraded to ${plan.name}!`);
            setLoading(false);
            navigate("/account");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#0f171e] text-white">
            <Navbar />

            <main className="pt-28 px-4 md:px-12 max-w-6xl mx-auto pb-20">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">Choose Your Plan</h1>
                    <p className="text-xl text-[#8197a4]">Upgrade your viewing experience with Prime Video</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.name} className={`relative flex flex-col p-8 rounded-2xl border-2 transition-all ${plan.color} ${currentPlan === plan.name ? 'ring-2 ring-white ring-offset-4 ring-offset-[#0f171e]' : 'hover:scale-105'}`}>
                            {currentPlan === plan.name && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-black uppercase px-3 py-1 rounded-full tracking-widest">
                                    Current Plan
                                </div>
                            )}

                            <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                            <div className="mb-4">
                                <span className="text-4xl font-black">{plan.price}</span>
                                {plan.cycle !== "none" && <span className="text-[#8197a4]"> /{plan.cycle === "monthly" ? "mo" : "yr"}</span>}
                            </div>
                            <p className="text-[#8197a4] text-sm mb-8 h-10">{plan.description}</p>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Check size={20} className={currentPlan === plan.name ? "text-white" : "text-[#00a8e1]"} />
                                        <span className="text-sm font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                disabled={loading || currentPlan === plan.name}
                                onClick={() => handleUpgrade(plan)}
                                className={`w-full py-4 rounded-xl font-black transition-all ${currentPlan === plan.name
                                    ? 'bg-white/10 text-white/50 cursor-not-allowed'
                                    : plan.name === 'Prime Annual'
                                        ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                                        : 'bg-[#00a8e1] text-white hover:bg-[#0092c3]'
                                    }`}
                            >
                                {loading ? 'Processing...' : currentPlan === plan.name ? 'Current Plan' : `Select ${plan.name}`}
                            </button>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}
