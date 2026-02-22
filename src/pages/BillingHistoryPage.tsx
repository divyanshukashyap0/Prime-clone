import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { Download, CreditCard, ExternalLink } from "lucide-react";
import { useEffect } from "react";

export default function BillingHistoryPage() {
    const { preferences } = useAuth();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Generate mock history based on current plan
    const currentPlan = preferences?.subscription?.planName || "Free";

    const mockInvoices = [
        {
            id: "INV-2023-001",
            date: "Oct 15, 2023",
            amount: preferences?.subscription?.amount ? `₹${preferences.subscription.amount}` : "₹1499",
            status: "Paid",
            plan: currentPlan !== "Free" ? currentPlan : "Prime Annual"
        },
        {
            id: "INV-2022-042",
            date: "Oct 15, 2022",
            amount: "₹1499",
            status: "Paid",
            plan: "Prime Annual"
        }
    ];

    return (
        <div className="min-h-screen bg-[#0f171e] text-white flex flex-col">
            <Navbar />

            <main className="flex-1 pt-28 px-4 md:px-12 max-w-4xl mx-auto w-full pb-20">
                <div className="mb-10">
                    <h1 className="text-4xl font-black mb-2">Billing & Payments</h1>
                    <p className="text-[#8197a4]">Manage your payment methods and view invoice history.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="md:col-span-2 bg-[#1b252f] rounded-2xl border border-[#303c44] p-8">
                        <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                            <CreditCard className="text-[#00a8e1]" /> Payment Methods
                        </h2>

                        <div className="flex items-center justify-between p-4 bg-[#0f171e] border border-[#00a8e1]/30 rounded-xl mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-8 bg-white rounded flex items-center justify-center font-bold text-blue-900 text-xs shadow-inner">
                                    VISA
                                </div>
                                <div>
                                    <p className="font-bold">•••• •••• •••• 4242</p>
                                    <p className="text-xs text-[#8197a4]">Expires 12/25</p>
                                </div>
                            </div>
                            <span className="bg-[#00a8e1]/20 text-[#00a8e1] px-3 py-1 rounded-full text-xs font-bold">Default</span>
                        </div>

                        <button className="text-[#00a8e1] font-bold text-sm hover:underline border border-[#00a8e1]/30 px-4 py-2 rounded-lg">
                            + Add new payment method
                        </button>
                    </div>

                    <div className="bg-[#1b252f] rounded-2xl border border-[#303c44] p-8">
                        <h2 className="text-lg font-black mb-4">Current Plan</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-3xl font-black text-[#00a8e1]">{currentPlan}</p>
                                {preferences?.subscription?.billingCycle !== 'none' && (
                                    <p className="text-sm text-[#8197a4] mt-1">Renews on {new Date(preferences?.subscription?.nextRenewal || Date.now()).toLocaleDateString()}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1b252f] rounded-2xl border border-[#303c44] overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-[#303c44]">
                        <h2 className="text-xl font-black">Invoice History</h2>
                    </div>

                    {currentPlan === 'Free' ? (
                        <div className="p-12 text-center text-[#8197a4]">
                            <p>You have no past invoices on the free plan.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#303c44]">
                            {mockInvoices.map((invoice) => (
                                <div key={invoice.id} className="p-6 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-center gap-6">
                                        <div>
                                            <p className="font-bold text-lg">{invoice.date}</p>
                                            <p className="text-sm text-[#8197a4]">{invoice.id}</p>
                                        </div>
                                        <div>
                                            <p className="font-bold">{invoice.plan}</p>
                                            <p className="text-sm text-[#46d369] font-bold">{invoice.status}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-[#303c44] pt-4 md:pt-0">
                                        <p className="font-black text-xl">{invoice.amount}</p>
                                        <button className="flex items-center justify-center p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10">
                                            <Download size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
