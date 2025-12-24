import React from 'react';

const PageLoader: React.FC = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md z-[9999]">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-lg shadow-amber-500/20"></div>
                </div>
            </div>
        </div>
    );
};

export default PageLoader;
