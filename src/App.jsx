import React, { useState, useEffect } from "react";
import WorldMap from "./components/WorldMap";
import JournalModal from "./components/JournalModal";
import PeopleBook from "./components/PeopleBook";
import RulesModal from "./components/RulesModal";
import FeedbackModal from "./components/FeedbackModal";
import { BookOpen, HelpCircle, MessageCircle, PlayCircle } from "lucide-react";
import { demopeople } from "./data/demoData";

function App() {
    const [people, setPeople] = useState([]);
    const [isJournalOpen, setIsJournalOpen] = useState(false);
    const [isPeopleBookOpen, setIsPeopleBookOpen] = useState(false);
    const [isRulesOpen, setIsRulesOpen] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [filterCountry, setFilterCountry] = useState(null);
    const [isDemoMode, setIsDemoMode] = useState(false);

    // Load from localStorage, seed demo data on first visit
    useEffect(() => {
        const saved = localStorage.getItem("global-atlas-people");
        if (saved) {
            setPeople(JSON.parse(saved));
        } else {
            setPeople(demopeople);
            localStorage.setItem("global-atlas-people", JSON.stringify(demopeople));
        }
        // Auto-open rules on first visit
        const onboarded = localStorage.getItem("global-atlas-onboarded");
        if (!onboarded) {
            setIsRulesOpen(true);
        }
    }, []);

    // Save to localStorage whenever people changes
    useEffect(() => {
        if (people.length > 0) {
            localStorage.setItem("global-atlas-people", JSON.stringify(people));
        }
    }, [people]);

    // Derive country stats from non-demo real people only (for map colors)
    const realPeople = people.filter(p => !p.isDemo);
    const countryStats = realPeople.reduce((acc, person) => {
        if (!acc[person.country]) {
            acc[person.country] = { count: 0, people: [] };
        }
        acc[person.country].count += 1;
        acc[person.country].people.push(person);
        return acc;
    }, {});

    // Also include demo people in a separate allCountryStats for hover preview
    const allCountryStats = people.reduce((acc, person) => {
        if (!acc[person.country]) {
            acc[person.country] = { count: 0, people: [] };
        }
        acc[person.country].count += 1;
        acc[person.country].people.push(person);
        return acc;
    }, {});

    const visitedCount = Object.keys(allCountryStats).length;

    const handleCountryClick = (countryName) => {
        setSelectedCountry(countryName);
        setIsJournalOpen(true);
    };

    const handleCountryRightClick = (countryName) => {
        const stats = allCountryStats[countryName];
        if (stats && stats.count > 0) {
            setFilterCountry(countryName);
            setIsPeopleBookOpen(true);
        }
    };

    const handleSavePerson = (newPerson) => {
        setPeople(prev => [newPerson, ...prev]);
        setIsJournalOpen(false);
    };

    const handleDeletePerson = (id) => {
        setPeople(prev => prev.filter(p => p.id !== id));
    };

    const handleOpenPeopleBook = () => {
        setFilterCountry(null);
        setIsPeopleBookOpen(true);
    };

    const handleStartDemo = () => {
        setIsRulesOpen(false);
        setIsDemoMode(true);
        setSelectedCountry("South Korea");
        setIsJournalOpen(true);
    };

    return (
        <div className="h-full w-full bg-stone-100 flex flex-col overflow-hidden font-sans text-stone-900">
            {/* Header */}
            <header className="bg-white border-b border-stone-200 px-4 flex justify-between items-center z-[100] shrink-0 shadow-sm" style={{ paddingTop: '1rem', paddingBottom: '0.75rem' }}>
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🌍</span>
                    <h1 className="font-bold text-lg tracking-tight">The Global Atlas</h1>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={() => window.open("https://drive.google.com/file/d/1EgH6v_Wyaplxamoo-mP6_14hyUU9gLFitnCiySeLWEI/view", "_blank")}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-stone-600 hover:bg-stone-100 rounded-full transition-colors text-sm font-medium border border-stone-200 shadow-sm"
                    >
                        <PlayCircle size={18} className="text-stone-800 animate-pulse" />
                        <span className="hidden md:inline">Watch Intro</span>
                    </button>
                    <button
                        onClick={() => setIsFeedbackOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-stone-500 hover:bg-stone-100 rounded-full transition-colors text-sm font-medium"
                    >
                        <MessageCircle size={18} />
                        <span className="hidden sm:inline">Feedback</span>
                    </button>
                    <button
                        onClick={() => setIsRulesOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-stone-500 hover:bg-stone-100 rounded-full transition-colors text-sm font-medium"
                    >
                        <HelpCircle size={18} />
                        <span className="hidden sm:inline">How to Play</span>
                    </button>
                    <div className="bg-stone-100 px-3 py-1 rounded-full text-xs font-semibold text-stone-600">
                        {visitedCount} / 195
                    </div>
                    <button
                        onClick={handleOpenPeopleBook}
                        className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-full hover:bg-stone-900 shadow-md transition-colors text-sm font-semibold"
                    >
                        <BookOpen size={18} />
                        <span className="hidden xs:inline">Passport</span>
                    </button>
                </div>
            </header>

            {/* Map */}
            <main className="flex-1 relative">
                <WorldMap
                    onCountryClick={handleCountryClick}
                    onCountryRightClick={handleCountryRightClick}
                    countryStats={allCountryStats}
                    allCountryStats={allCountryStats}
                />
            </main>

            <RulesModal
                isOpen={isRulesOpen}
                onClose={() => {
                    setIsRulesOpen(false);
                    localStorage.setItem("global-atlas-onboarded", "true");
                }}
                onStartDemo={handleStartDemo}
            />
            <JournalModal
                isOpen={isJournalOpen}
                countryName={selectedCountry}
                isDemoMode={isDemoMode}
                onClose={() => { setIsJournalOpen(false); setIsDemoMode(false); }}
                onSave={handleSavePerson}
            />
            <PeopleBook
                isOpen={isPeopleBookOpen}
                people={people}
                filterCountry={filterCountry}
                onClose={() => { setIsPeopleBookOpen(false); setFilterCountry(null); }}
                onDelete={handleDeletePerson}
            />
            <FeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
            />
        </div>
    );
}

export default App;
