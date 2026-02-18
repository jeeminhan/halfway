import React from "react";
import { X } from "lucide-react";

const VideoModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[300]"
            onClick={onClose}
        >
            <div
                className="bg-stone-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative border border-stone-800 w-full max-w-4xl aspect-video animate-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Always-visible X button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-20 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                    aria-label="Close"
                >
                    <X size={18} />
                </button>

                {/* Video Iframe */}
                <div className="flex-1 w-full relative">
                    <iframe
                        src="https://drive.google.com/file/d/1EgH6v_Wyaplxamoo-mP6_14hyUU9gLFitnCiySeLWEI/preview"
                        className="absolute inset-0 w-full h-full border-0"
                        allow="autoplay"
                        title="Global Atlas Explainer"
                    />
                </div>
            </div>
        </div>
    );
};

export default VideoModal;
