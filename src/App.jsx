import React, { useState, useEffect } from "react";
import WorldMap from "./components/WorldMap";
import JournalModal from "./components/JournalModal";
import PassportGallery from "./components/PassportGallery";
import RulesModal from "./components/RulesModal";
import FeedbackModal from "./components/FeedbackModal";
import { BookOpen, Map as MapIcon, Plus, HelpCircle, MessageCircle, PlayCircle } from "lucide-react";

function App() {
    const [entries, setEntries] = useState([]);
    const [isJournalOpen, setIsJournalOpen] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isRulesOpen, setIsRulesOpen] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(null);

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem("global-atlas-entries");
        if (saved) {
            setEntries(JSON.parse(saved));
        }
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        localStorage.setItem("global-atlas-entries", JSON.stringify(entries));
    }, [entries]);

    // Calculate mastery stats for each country
    const countryStats = entries.reduce((acc, entry) => {
        if (!acc[entry.country]) {
            acc[entry.country] = { regions: new Set(), lastPhoto: entry.photo };
        }
        acc[entry.country].regions.add(entry.region);
        return acc;
    }, {});

    const visitedCount = Object.keys(countryStats).length;

    const handleCountryClick = (countryName) => {
        setSelectedCountry(countryName);
        setIsJournalOpen(true);
    };

    const handleSaveEntry = (newEntry) => {
        setEntries(prev => [newEntry, ...prev]);
        setIsJournalOpen(false);
    };

    return (
        <div className="h-full w-full bg-stone-100 flex flex-col overflow-hidden font-sans text-stone-900">
            {/* Navbar / Header */}
            <header
                className="bg-white border-b border-stone-200 px-4 flex justify-between items-center z-[100] shrink-0 shadow-sm"
                style={{
                    paddingTop: '1rem',
                    paddingBottom: '0.75rem'
                }}
            >
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🌍</span>
                    <h1 className="font-bold text-lg tracking-tight">The Global Atlas</h1>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={() => window.open("https://drive.google.com/file/d/1EgH6v_Wyaplxamoo-mP6_14hyUU9gLFitnCiySeLWEI/view", "_blank")}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded-full transition-colors text-sm font-medium border border-stone-200 shadow-sm"
                        title="Watch Explainer"
                    >
                        <PlayCircle size={18} className="text-stone-800 animate-pulse" />
                        <span className="hidden md:inline">Watch Intro</span>
                    </button>

                    <button
                        onClick={() => setIsFeedbackOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-stone-500 hover:bg-stone-100 rounded-full transition-colors text-sm font-medium"
                        title="Give Feedback"
                    >
                        <MessageCircle size={18} />
                        <span className="hidden sm:inline">Feedback</span>
                    </button>

                    <button
                        onClick={() => setIsRulesOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-stone-500 hover:bg-stone-100 rounded-full transition-colors text-sm font-medium"
                        title="How to Play"
                    >
                        <HelpCircle size={18} />
                        <span className="hidden sm:inline">How to Play</span>
                    </button>

                    <div className="bg-stone-100 px-3 py-1 rounded-full text-xs font-semibold text-stone-600">
                        {visitedCount} / 195
                    </div>

                    <button
                        onClick={() => setIsGalleryOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-full hover:bg-stone-900 shadow-md transition-colors text-sm font-semibold"
                    >
                        <BookOpen size={18} />
                        <span className="hidden xs:inline">Passport</span>
                    </button>
                </div>
            </header>

            {/* Main Map Area */}
            <main className="flex-1 relative">
                <WorldMap
                    onCountryClick={handleCountryClick}
                    countryStats={countryStats}
                />
            </main>

            {/* Modals */}
            <RulesModal
                isOpen={isRulesOpen}
                onClose={() => setIsRulesOpen(false)}
            />

            <JournalModal
                isOpen={isJournalOpen}
                countryName={selectedCountry}
                onClose={() => setIsJournalOpen(false)}
                onSave={handleSaveEntry}
            />

            <PassportGallery
                isOpen={isGalleryOpen}
                entries={entries}
                countryStats={countryStats}
                onClose={() => setIsGalleryOpen(false)}
            />

            <FeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
            />
        </div>
    );
}

export default App;
