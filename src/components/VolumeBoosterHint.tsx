import React, { useState, useEffect } from 'react';
import { Volume2, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VolumeBoosterHint = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasSeenHint = localStorage.getItem('hasSeenVolumeHint');
        if (!hasSeenHint) {
            const timer = setTimeout(() => setIsVisible(true), 5000); // Show after 5 seconds
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('hasSeenVolumeHint', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-6 right-6 z-[300] max-w-sm"
                >
                    <div className="bg-[#1b252f] border border-[#00a8e1]/30 rounded-xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden group">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#00a8e1]/5 rounded-full -mr-12 -mt-12 blur-2xl" />

                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 text-[#8197a4] hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#00a8e1]/10 flex items-center justify-center shrink-0 border border-[#00a8e1]/20">
                                <Volume2 className="text-[#00a8e1]" size={24} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-white font-bold text-sm">Low Volume?</h4>
                                <p className="text-[#8197a4] text-xs leading-relaxed">
                                    Boost your audio up to 600% with our recommended Sound Booster extension for Chrome.
                                </p>
                                <a
                                    href="https://chromewebstore.google.com/detail/sound-booster-that-works/gnidjfdekbljleajoeamecfijnhbgndl?pli=1"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-[#00a8e1] text-xs font-bold hover:underline group-hover:gap-3 transition-all"
                                >
                                    Get Booster <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VolumeBoosterHint;
