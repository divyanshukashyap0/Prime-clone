import React from 'react';
import './Loader.css';

const Loader = ({ fullScreen = true }) => {
    const spinnerContent = (
        <div className="prime-loader-container">
            <div className="prime-spinner"></div>
            <div className="prime-loader-text">Loading</div>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-[#0f171e] z-[9999] flex items-center justify-center overflow-hidden">
                <div
                    className="w-64 h-48 md:w-96 md:h-64 relative flex items-center justify-center mix-blend-screen"
                    style={{
                        maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 80%)',
                        WebkitMaskImage: 'radial-gradient(ellipse at center, black 50%, transparent 80%)'
                    }}
                >
                    <video
                        src="/loader.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover scale-[1.5]"
                    />
                </div>
            </div>
        );
    }

    return spinnerContent;
};

export default Loader;
