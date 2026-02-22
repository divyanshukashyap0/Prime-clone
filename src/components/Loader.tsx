import React from 'react';
import './Loader.css';

const Loader = ({ fullScreen = true }) => {
    const content = (
        <div className="prime-loader-container">
            <div className="prime-spinner"></div>
            <div className="prime-loader-text">Loading</div>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-[#0f171e] z-[9999] flex items-center justify-center">
                {content}
            </div>
        );
    }

    return content;
};

export default Loader;
