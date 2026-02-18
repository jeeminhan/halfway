import React, { useState } from "react";
import { X, Map } from "lucide-react";

const VideoModal = ({ isOpen, onClose }) => {
    const [isMinimized, setIsMinimized] = useState(false);

    if (!isOpen) return null;

    // Handle backdrop click to minimize
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !isMinimized) {
            setIsMinimized(true);
        }
    };

    return (
        <div
            className={`fixed transition-all duration-500 ease-in-out z-[300] ${isMinimized
                ? "bottom-6 right-6 w-72 sm:w-96 aspect-video shadow-2xl scale-100"
                : "inset-0 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4"
                }`}
            onClick={handleBackdropClick}
        >
            <div className={`bg-stone-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative border border-stone-800 transition-all duration-500 ${isMinimized
                ? "w-full h-full border-stone-700"
                : "w-full max-w-4xl aspect-video animate-in zoom-in-95"
                }`}>

                {/* Always-visible X button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="absolute top-3 right-3 z-20 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                    aria-label="Close"
                >
                    <X size={18} />
                </button>

                {/* Video Iframe - PERSISTENT so it doesn't restart */}
                <div className="flex-1 w-full relative pointer-events-auto">
                    <iframe
                        src="https://drive.google.com/file/d/1EgH6v_Wyaplxamoo-mP6_14hyUU9gLFitnCiySeLWEI/preview"
                        className="absolute inset-0 w-full h-full border-0"
                        allow="autoplay"
                        title="Global Atlas Explainer"
                    />
                </div>

                {/* OBVIOUS ACTION BUTTON (Only in full mode) */}
                {!isMinimized && (
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 sm:pb-12 pointer-events-none">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMinimized(true);
                            }}
                            className="pointer-events-auto bg-yellow-400 text-stone-900 px-6 py-3 sm:px-8 sm:py-4 rounded-full font-black text-base sm:text-lg shadow-[0_0_50px_rgba(250,204,21,0.3)] hover:bg-yellow-500 hover:scale-110 active:scale-95 transition-all flex items-center gap-2 sm:gap-3 animate-bounce mb-4 sm:mb-0"
                        >
                            <Map size={24} />
                            START EXPLORING MAP
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default VideoModal;
