import React from "react";
import { X, Map, Dices, PenTool, Camera } from "lucide-react";

const RulesModal = ({ isOpen, onClose, onStartDemo }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-stone-900/80 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-stone-100 p-5 flex justify-between items-center border-b border-stone-200">
                    <div>
                        <h2 className="text-2xl font-bold text-stone-800">How to Play</h2>
                        <p className="text-stone-500 text-sm">Your journey to becoming a Global Citizen</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                        <X size={20} className="text-stone-600" />
                    </button>
                </div>

                {/* Steps */}
                <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                            <Map size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-stone-800">1. Select a Country</h3>
                            <p className="text-stone-600 text-sm leading-relaxed">
                                Met an international student? Tap their home country on the map to start the unlocking process.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                            <Dices size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-stone-800">2. Roll the Souvenir Die</h3>
                            <p className="text-stone-600 text-sm leading-relaxed">
                                Ask them to roll the die! It lands on a cultural topic (Music, Food, Slang, etc.) to spark a unique conversation.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                            <Camera size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-stone-800">3. Capture the Moment</h3>
                            <p className="text-stone-600 text-sm leading-relaxed">
                                Record their answer and take a selfie together. This stamps your passport and unlocks the country on your map!
                            </p>
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-bold text-yellow-800 mb-1 text-sm">🏆 Mastery Levels</h4>
                        <ul className="text-xs text-yellow-700 space-y-1 ml-4 list-disc">
                            <li><span className="font-bold">Bronze:</span> Unlock a country by meeting 1 person.</li>
                            <li><span className="font-bold">Silver:</span> Meet people from 2 different regions!</li>
                            <li><span className="font-bold">Gold:</span> Master a country by meeting people from 3+ regions!</li>
                        </ul>
                    </div>

                </div>

                <div className="m-6 mt-0 flex flex-col gap-2">
                    <button
                        onClick={onStartDemo}
                        className="w-full bg-yellow-400 text-stone-900 py-3 rounded-xl font-bold hover:bg-yellow-500 transition-transform active:scale-95"
                    >
                        🎯 Try Demo Walk-through →
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full bg-stone-800 text-white py-3 rounded-xl font-bold hover:bg-stone-900 transition-transform active:scale-95"
                    >
                        Got it, let's explore!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RulesModal;
