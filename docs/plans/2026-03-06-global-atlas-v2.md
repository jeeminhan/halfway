# Global Atlas v2 — Person-First Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign Global Atlas so each entry represents an individual person (not a country), add 2–3 question rolls per interaction, ship pre-loaded demo data, and add first-run onboarding.

**Architecture:** Replace the `entries` array (one entry per interaction) with a `people` array where each element is a person with multiple souvenir answers. The world map derives country colors from person count. The PassportGallery becomes a PeopleBook showing individual cards. Demo data pre-populates localStorage on first visit so the app looks alive immediately.

**Tech Stack:** React 18, Vite, Tailwind CSS, Framer Motion, react-simple-maps, react-tooltip v5, country-state-city, lucide-react. No test framework installed — verification is done via Playwright MCP after each task.

**Working directory:** `/Users/jeeminhan/Code/global-atlas`

---

## Task 1: Utility files — image compression + demo data

**Files:**
- Create: `src/utils/imageUtils.js`
- Create: `src/data/demoData.js`

**Step 1: Create image compression utility**

```js
// src/utils/imageUtils.js
export async function compressImage(base64, maxDim = 400, quality = 0.7) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = base64;
    });
}
```

**Step 2: Create demo data**

```js
// src/data/demoData.js
// 10 pre-loaded people spread across countries (isDemo: true)
// India x3, China x2, Brazil x1, Japan x1, Nigeria x1, South Korea x1, Mexico x1
export const demopeople = [
    {
        id: "demo-1",
        name: "Priya",
        country: "India",
        city: "Mumbai",
        souvenirs: [
            { id: "feast", title: "The Feast", icon: "🍲", question: "What is the one meal you miss the most right now?", answer: "Definitely vada pav — it's like a spiced potato burger you find on every Mumbai street corner.", color: "bg-orange-100 text-orange-600" },
            { id: "anthem", title: "The Anthem", icon: "🎵", question: "What is one song everyone in your country knows by heart?", answer: "Aye Mere Watan Ke Logon — every Indian knows it, especially on Republic Day.", color: "bg-blue-100 text-blue-600" }
        ],
        photo: null,
        createdAt: "2026-01-15T10:00:00Z",
        isDemo: true
    },
    {
        id: "demo-2",
        name: "Arjun",
        country: "India",
        city: "Delhi",
        souvenirs: [
            { id: "slang", title: "The Slang", icon: "💬", question: "Teach me a phrase that only locals use.", answer: "'Jugaad' — it means a creative, improvised fix for any problem. Very Indian way of life.", color: "bg-green-100 text-green-600" },
            { id: "legend", title: "The Legend", icon: "👻", question: "Is there a monster or ghost story children are told?", answer: "Churail — a witch with backwards feet who haunts crossroads at night. Every village has a version of this.", color: "bg-purple-100 text-purple-600" }
        ],
        photo: null,
        createdAt: "2026-01-20T14:30:00Z",
        isDemo: true
    },
    {
        id: "demo-3",
        name: "Meera",
        country: "India",
        city: "Bangalore",
        souvenirs: [
            { id: "gift", title: "The Gift", icon: "🎁", question: "What is one positive trait your culture brings to the world?", answer: "Hospitality — in India, a guest is treated like God. Atithi Devo Bhava.", color: "bg-yellow-100 text-yellow-600" },
            { id: "spot", title: "The Spot", icon: "📍", question: "If I visited, what is one hidden place I must see?", answer: "Nandi Hills at sunrise — it's only 60km from Bangalore but feels like another world above the clouds.", color: "bg-red-100 text-red-600" }
        ],
        photo: null,
        createdAt: "2026-02-01T09:00:00Z",
        isDemo: true
    },
    {
        id: "demo-4",
        name: "Wei",
        country: "China",
        city: "Beijing",
        souvenirs: [
            { id: "feast", title: "The Feast", icon: "🍲", question: "What is the one meal you miss the most right now?", answer: "Jianbing — a savory crepe with egg, crispy wonton, and hoisin sauce. I got it from a street cart every morning.", color: "bg-orange-100 text-orange-600" },
            { id: "anthem", title: "The Anthem", icon: "🎵", question: "What is one song everyone in your country knows by heart?", answer: "Mò Lì Huā (Jasmine Flower) — every Chinese person knows it. It's been around for centuries.", color: "bg-blue-100 text-blue-600" }
        ],
        photo: null,
        createdAt: "2026-01-25T11:00:00Z",
        isDemo: true
    },
    {
        id: "demo-5",
        name: "Lin",
        country: "China",
        city: "Shanghai",
        souvenirs: [
            { id: "slang", title: "The Slang", icon: "💬", question: "Teach me a phrase that only locals use.", answer: "'Nong hao' is how Shanghai locals say hello — it's the local dialect, not standard Mandarin.", color: "bg-green-100 text-green-600" },
            { id: "legend", title: "The Legend", icon: "👻", question: "Is there a monster or ghost story children are told?", answer: "Nian — a beast that comes on New Year's Eve to eat children. That's why we make noise and use red — to scare it away.", color: "bg-purple-100 text-purple-600" }
        ],
        photo: null,
        createdAt: "2026-02-03T15:00:00Z",
        isDemo: true
    },
    {
        id: "demo-6",
        name: "Camila",
        country: "Brazil",
        city: "Rio de Janeiro",
        souvenirs: [
            { id: "feast", title: "The Feast", icon: "🍲", question: "What is the one meal you miss the most right now?", answer: "Feijoada on a Saturday — black bean stew with pork, rice, and orange slices. It's a whole ritual.", color: "bg-orange-100 text-orange-600" },
            { id: "gift", title: "The Gift", icon: "🎁", question: "What is one positive trait your culture brings to the world?", answer: "Jeitinho Brasileiro — our ability to find a warm, creative way out of any situation.", color: "bg-yellow-100 text-yellow-600" }
        ],
        photo: null,
        createdAt: "2026-01-18T13:00:00Z",
        isDemo: true
    },
    {
        id: "demo-7",
        name: "Yuki",
        country: "Japan",
        city: "Osaka",
        souvenirs: [
            { id: "slang", title: "The Slang", icon: "💬", question: "Teach me a phrase that only locals use.", answer: "'Meccha' — Osaka slang for 'very' or 'so much'. Tokyo people use 'totemo' but we say meccha.", color: "bg-green-100 text-green-600" },
            { id: "spot", title: "The Spot", icon: "📍", question: "If I visited, what is one hidden place I must see?", answer: "Dotonbori at 2am — after all the tourists leave, locals come out and it becomes the real Osaka.", color: "bg-red-100 text-red-600" }
        ],
        photo: null,
        createdAt: "2026-01-30T10:30:00Z",
        isDemo: true
    },
    {
        id: "demo-8",
        name: "Chidi",
        country: "Nigeria",
        city: "Lagos",
        souvenirs: [
            { id: "anthem", title: "The Anthem", icon: "🎵", question: "What is one song everyone in your country knows by heart?", answer: "Fela Kuti's Lady — everyone knows the chorus. Afrobeat is our soul.", color: "bg-blue-100 text-blue-600" },
            { id: "legend", title: "The Legend", icon: "👻", question: "Is there a monster or ghost story children are told?", answer: "Mami Wata — a water spirit, half woman half fish, who lures people into the river. Every Nigerian coastal family has a story.", color: "bg-purple-100 text-purple-600" }
        ],
        photo: null,
        createdAt: "2026-02-05T09:30:00Z",
        isDemo: true
    },
    {
        id: "demo-9",
        name: "Seo-yeon",
        country: "South Korea",
        city: "Seoul",
        souvenirs: [
            { id: "feast", title: "The Feast", icon: "🍲", question: "What is the one meal you miss the most right now?", answer: "Tteokbokki from a pojangmacha stall in the rain — spicy rice cakes with fishcake. It tastes different when it's cold outside.", color: "bg-orange-100 text-orange-600" },
            { id: "gift", title: "The Gift", icon: "🎁", question: "What is one positive trait your culture brings to the world?", answer: "Nunchi — the ability to read a room without being told anything. It's emotional intelligence built into the culture.", color: "bg-yellow-100 text-yellow-600" }
        ],
        photo: null,
        createdAt: "2026-02-10T14:00:00Z",
        isDemo: true
    },
    {
        id: "demo-10",
        name: "Valentina",
        country: "Mexico",
        city: "Guadalajara",
        souvenirs: [
            { id: "legend", title: "The Legend", icon: "👻", question: "Is there a monster or ghost story children are told?", answer: "La Llorona — the weeping woman who walks rivers at night crying for her lost children. You stay inside when you hear her.", color: "bg-purple-100 text-purple-600" },
            { id: "slang", title: "The Slang", icon: "💬", question: "Teach me a phrase that only locals use.", answer: "'Chido' means cool in Mexican slang. 'Qué chido' — how cool! Textbooks won't teach you that.", color: "bg-green-100 text-green-600" }
        ],
        photo: null,
        createdAt: "2026-02-12T11:30:00Z",
        isDemo: true
    }
];
```

**Step 3: Commit**

```bash
cd /Users/jeeminhan/Code/global-atlas
git add src/utils/imageUtils.js src/data/demoData.js
git commit -m "feat: add image compression utility and demo people data"
```

---

## Task 2: Rewrite App.jsx — people state + countryStats

**Files:**
- Modify: `src/App.jsx`

**Step 1: Replace App.jsx entirely**

```jsx
// src/App.jsx
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

    const visitedCount = Object.keys(countryStats).length;

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
                    countryStats={countryStats}
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
```

**Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "feat: migrate App to people-first state model with demo seed data"
```

---

## Task 3: Rewrite JournalModal.jsx — 4-step flow with multi-roll

**Files:**
- Modify: `src/components/JournalModal.jsx`

**Step 1: Replace JournalModal.jsx entirely**

Key changes:
- Step 2 is now **Name** (optional)
- Step 3 is **Souvenir Rolls** (2–3 rolls, no repeats, answer after each roll)
- Step 4 is **Photo + Save**
- In demo mode, South Korea / Seoul is pre-filled and the die auto-rolls after 1s

```jsx
// src/components/JournalModal.jsx
import React, { useState, useEffect, useMemo } from "react";
import SouvenirDie from "./SouvenirDie";
import { Camera, X, MapPin, Search, User } from "lucide-react";
import { Country, City } from 'country-state-city';
import { souvenirs } from "../data/souvenirData";
import { compressImage } from "../utils/imageUtils";

const MIN_ROLLS = 2;
const MAX_ROLLS = 3;

const JournalModal = ({ isOpen, countryName, isDemoMode, onClose, onSave }) => {
    const [step, setStep] = useState(1);
    const [city, setCity] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [personName, setPersonName] = useState("");
    const [rolls, setRolls] = useState([]); // [{ souvenir, answer }]
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [pendingSouvenir, setPendingSouvenir] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isRolling, setIsRolling] = useState(false);

    const countryCode = useMemo(() => {
        if (!countryName) return null;
        const countries = Country.getAllCountries();
        const found = countries.find(c =>
            c.name.toLowerCase() === countryName.toLowerCase() ||
            countryName.toLowerCase().includes(c.name.toLowerCase()) ||
            c.name.toLowerCase().includes(countryName.toLowerCase())
        );
        return found ? found.isoCode : null;
    }, [countryName]);

    const cities = useMemo(() => {
        if (!countryCode) return [];
        return City.getCitiesOfCountry(countryCode);
    }, [countryCode]);

    const filteredCities = useMemo(() => {
        if (!searchTerm.trim()) return [];
        return cities
            .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .slice(0, 10);
    }, [cities, searchTerm]);

    // Demo mode: pre-fill Seoul, auto-advance to roll step
    useEffect(() => {
        if (isDemoMode && isOpen) {
            setCity("Seoul");
            setSearchTerm("Seoul");
            setStep(2);
        }
    }, [isDemoMode, isOpen]);

    // Demo mode: auto-roll after arriving at step 3
    useEffect(() => {
        if (isDemoMode && step === 3 && rolls.length === 0) {
            setTimeout(() => setIsRolling(true), 800);
        }
    }, [isDemoMode, step, rolls.length]);

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setCity("");
            setSearchTerm("");
            setPersonName("");
            setRolls([]);
            setCurrentAnswer("");
            setPendingSouvenir(null);
            setPhotoPreview(null);
            setPhoto(null);
            setIsRolling(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const usedIds = rolls.map(r => r.souvenir.id);

    const handleRollComplete = (result) => {
        setPendingSouvenir(result);
        setCurrentAnswer("");
        setIsRolling(false);

        // Demo mode: pre-fill answer
        if (isDemoMode) {
            setTimeout(() => {
                setCurrentAnswer("Tteokbokki from a pojangmacha stall on a rainy evening — it's spicy, warm, and tastes like home.");
            }, 600);
        }
    };

    const handleConfirmAnswer = () => {
        if (!currentAnswer.trim() || !pendingSouvenir) return;
        const newRolls = [...rolls, { souvenir: pendingSouvenir, answer: currentAnswer }];
        setRolls(newRolls);
        setPendingSouvenir(null);
        setCurrentAnswer("");
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = async () => {
            const compressed = await compressImage(reader.result);
            setPhotoPreview(compressed);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        const newPerson = {
            id: `person-${Date.now()}`,
            name: personName.trim() || null,
            country: countryName,
            city,
            souvenirs: rolls.map(r => ({
                id: r.souvenir.id,
                title: r.souvenir.title,
                icon: r.souvenir.icon,
                question: r.souvenir.question,
                answer: r.answer,
                color: r.souvenir.color
            })),
            photo: photoPreview,
            createdAt: new Date().toISOString(),
            isDemo: false
        };
        onSave(newPerson);
    };

    const canAddMoreRolls = rolls.length < MAX_ROLLS && !pendingSouvenir;
    const canFinish = rolls.length >= MIN_ROLLS && !pendingSouvenir;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-stone-800 text-white p-4 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span>✈️</span> Arriving in <span className="text-yellow-400">{countryName}</span>
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-stone-700 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Step indicators */}
                <div className="flex gap-1 px-4 pt-3 shrink-0">
                    {[1,2,3,4].map(s => (
                        <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${step >= s ? 'bg-stone-800' : 'bg-stone-200'}`} />
                    ))}
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {/* Step 1: City */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <p className="text-stone-600">To unlock this country, let's get specific.</p>
                            <div className="relative">
                                <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-1">
                                    <MapPin size={14} /> Which city or region is the student from?
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={city || searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); setCity(""); }}
                                        placeholder="Search for a city (e.g. Rio de Janeiro)"
                                        className="w-full p-3 pl-10 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 outline-none"
                                        autoFocus
                                    />
                                    <Search className="absolute left-3 top-3.5 text-stone-400" size={18} />
                                </div>
                                {filteredCities.length > 0 && !city && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-xl overflow-hidden">
                                        {filteredCities.map((c, idx) => (
                                            <button
                                                key={`${c.name}-${idx}`}
                                                className="w-full text-left px-4 py-2 hover:bg-stone-50 text-stone-700 border-b border-stone-100 last:border-0"
                                                onClick={() => { setCity(c.name); setSearchTerm(c.name); }}
                                            >
                                                {c.name}
                                                {c.stateCode && <span className="text-xs text-stone-400 ml-2">({c.stateCode})</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                disabled={!city.trim() && !searchTerm.trim()}
                                onClick={() => { if (!city) setCity(searchTerm); setStep(2); }}
                                className="w-full bg-stone-800 text-white py-3 rounded-lg font-bold disabled:opacity-50 hover:bg-stone-900 transition-colors"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {/* Step 2: Name */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <p className="text-stone-600">What's their name? <span className="text-stone-400 text-sm">(optional)</span></p>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={personName}
                                    onChange={(e) => setPersonName(e.target.value)}
                                    placeholder="e.g. Priya, Wei, Seo-yeon..."
                                    className="w-full p-3 pl-10 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 outline-none"
                                    autoFocus
                                />
                                <User className="absolute left-3 top-3.5 text-stone-400" size={18} />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(3)}
                                    className="flex-1 border border-stone-300 text-stone-600 py-3 rounded-lg font-medium hover:bg-stone-50 transition-colors"
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    className="flex-1 bg-stone-800 text-white py-3 rounded-lg font-bold hover:bg-stone-900 transition-colors"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Souvenir Rolls */}
                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in zoom-in-95">
                            {/* Progress */}
                            <div className="flex items-center justify-between">
                                <p className="text-stone-600 text-sm">
                                    {isDemoMode && rolls.length === 0
                                        ? "Watch how the Souvenir Die works!"
                                        : "Ask them to roll the Souvenir Die!"}
                                </p>
                                <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded-full">
                                    {rolls.length} / {MIN_ROLLS}–{MAX_ROLLS} rolls
                                </span>
                            </div>

                            {/* Previous rolls */}
                            {rolls.map((roll, i) => (
                                <div key={i} className={`p-3 rounded-lg border ${roll.souvenir.color} bg-opacity-30`}>
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span>{roll.souvenir.icon}</span>
                                        <span className="text-xs font-bold uppercase tracking-wider">{roll.souvenir.title}</span>
                                    </div>
                                    <p className="text-sm text-stone-700">"{roll.answer}"</p>
                                </div>
                            ))}

                            {/* Pending answer */}
                            {pendingSouvenir && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                    <div className={`p-4 rounded-xl border-2 ${pendingSouvenir.color}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-2xl">{pendingSouvenir.icon}</span>
                                            <span className="font-bold uppercase tracking-wider text-xs">{pendingSouvenir.title}</span>
                                        </div>
                                        <p className="text-base font-medium text-stone-800">"{pendingSouvenir.question}"</p>
                                    </div>
                                    <textarea
                                        value={currentAnswer}
                                        onChange={(e) => setCurrentAnswer(e.target.value)}
                                        placeholder="Type their answer here..."
                                        className="w-full p-3 border border-stone-300 rounded-lg h-20 focus:ring-2 focus:ring-stone-500 outline-none resize-none"
                                        autoFocus={!isDemoMode}
                                    />
                                    <button
                                        disabled={!currentAnswer.trim()}
                                        onClick={handleConfirmAnswer}
                                        className="w-full bg-stone-700 text-white py-2 rounded-lg font-bold disabled:opacity-50 hover:bg-stone-800 transition-colors"
                                    >
                                        Save Answer
                                    </button>
                                </div>
                            )}

                            {/* Die + roll controls */}
                            {!pendingSouvenir && (
                                <div className="text-center">
                                    <SouvenirDie
                                        usedIds={usedIds}
                                        onRollComplete={handleRollComplete}
                                        autoRoll={isRolling}
                                        disabled={rolls.length >= MAX_ROLLS}
                                    />
                                </div>
                            )}

                            {/* Finish button */}
                            {canFinish && !pendingSouvenir && (
                                <div className="flex gap-3">
                                    {canAddMoreRolls && (
                                        <p className="text-xs text-stone-400 text-center flex-1 self-center">or roll one more time</p>
                                    )}
                                    <button
                                        onClick={() => setStep(4)}
                                        className="flex-1 bg-yellow-400 text-stone-900 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors shadow"
                                    >
                                        Continue →
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Photo + Save */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                            <div>
                                <label className="block text-sm font-medium text-stone-500 mb-1">Process Visa Photo</label>
                                <label className="cursor-pointer bg-stone-100 hover:bg-stone-200 border-dashed border-2 border-stone-300 rounded-lg h-36 flex flex-col items-center justify-center text-stone-500 transition-colors overflow-hidden">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <>
                                            <Camera size={28} className="mb-2" />
                                            <span className="text-sm font-medium">Tap to Take Selfie</span>
                                            <span className="text-xs text-stone-400 mt-1">optional</span>
                                        </>
                                    )}
                                    <input type="file" accept="image/*" capture="user" onChange={handlePhotoChange} className="hidden" />
                                </label>
                            </div>
                            <button
                                onClick={handleSave}
                                className="w-full bg-yellow-400 text-stone-900 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors shadow-lg transform active:scale-95"
                            >
                                STAMP PASSPORT & UNLOCK 🌍
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JournalModal;
```

**Step 2: Commit**

```bash
git add src/components/JournalModal.jsx
git commit -m "feat: expand JournalModal to 4-step flow with multi-roll and name field"
```

---

## Task 4: Update SouvenirDie.jsx — accept usedIds + autoRoll props

**Files:**
- Modify: `src/components/SouvenirDie.jsx`

**Step 1: Replace SouvenirDie.jsx**

```jsx
// src/components/SouvenirDie.jsx
import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { souvenirs } from "../data/souvenirData";

const SouvenirDie = ({ onRollComplete, usedIds = [], autoRoll = false, disabled = false }) => {
    const [isRolling, setIsRolling] = useState(false);
    const controls = useAnimation();

    const roll = async () => {
        if (isRolling || disabled) return;
        setIsRolling(true);

        await controls.start({
            rotateX: [0, 360 * 4],
            rotateY: [0, 360 * 4],
            transition: { duration: 0.8, ease: "easeInOut" }
        });

        const available = souvenirs.filter(s => !usedIds.includes(s.id));
        const pool = available.length > 0 ? available : souvenirs;
        const result = pool[Math.floor(Math.random() * pool.length)];

        setIsRolling(false);
        onRollComplete(result);
    };

    // Auto-roll trigger (for demo mode)
    useEffect(() => {
        if (autoRoll && !isRolling) {
            roll();
        }
    }, [autoRoll]);

    return (
        <div className="flex flex-col items-center justify-center py-4">
            <motion.div
                className={`w-24 h-24 bg-stone-100 rounded-2xl shadow-xl flex items-center justify-center border-4 ${disabled ? 'border-stone-200 opacity-40 cursor-not-allowed' : 'border-stone-300 cursor-pointer'}`}
                animate={controls}
                whileTap={disabled ? {} : { scale: 0.92 }}
                onClick={roll}
            >
                <span className="text-4xl">{isRolling ? "🎲" : disabled ? "✓" : "🎲"}</span>
            </motion.div>
            <p className="mt-3 text-stone-500 font-medium text-sm">
                {disabled ? "Max rolls reached" : isRolling ? "Rolling..." : "Tap to Roll"}
            </p>
        </div>
    );
};

export default SouvenirDie;
```

**Step 2: Commit**

```bash
git add src/components/SouvenirDie.jsx
git commit -m "feat: update SouvenirDie to support no-repeat rolls and auto-roll for demo"
```

---

## Task 5: Rewrite PassportGallery.jsx → PeopleBook.jsx

**Files:**
- Create: `src/components/PeopleBook.jsx`
- Keep `PassportGallery.jsx` untouched (App.jsx no longer imports it)

**Step 1: Create PeopleBook.jsx**

```jsx
// src/components/PeopleBook.jsx
import React, { useState } from "react";
import { X, Trash2, ChevronDown, ChevronUp, Globe } from "lucide-react";

const PeopleBook = ({ isOpen, onClose, people, filterCountry, onDelete }) => {
    const [expandedId, setExpandedId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    if (!isOpen) return null;

    const displayed = filterCountry
        ? people.filter(p => p.country === filterCountry)
        : people;

    const realCount = people.filter(p => !p.isDemo).length;

    // Get flag emoji from country name (best-effort via unicode)
    const getFlagEmoji = (countryName) => {
        const map = {
            "India": "🇮🇳", "China": "🇨🇳", "Brazil": "🇧🇷", "Japan": "🇯🇵",
            "Nigeria": "🇳🇬", "South Korea": "🇰🇷", "Mexico": "🇲🇽",
            "United States of America": "🇺🇸", "United Kingdom": "🇬🇧",
            "Germany": "🇩🇪", "France": "🇫🇷", "Australia": "🇦🇺"
        };
        return map[countryName] || "🌏";
    };

    return (
        <div className="fixed inset-0 bg-stone-900/90 z-[200] flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <div className="p-4 flex justify-between items-center text-white border-b border-stone-700 shrink-0">
                <div>
                    <h2 className="text-2xl font-bold tracking-wider uppercase flex items-center gap-2">
                        {filterCountry ? (
                            <>
                                <span>{getFlagEmoji(filterCountry)}</span>
                                {filterCountry}
                            </>
                        ) : (
                            <><Globe size={22} /> My Passport</>
                        )}
                    </h2>
                    <p className="text-xs text-stone-400 mt-0.5">
                        {filterCountry
                            ? `${displayed.length} people from ${filterCountry}`
                            : `${realCount} real connection${realCount !== 1 ? 's' : ''} · ${people.filter(p => p.isDemo).length} demo`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {filterCountry && (
                        <button
                            onClick={() => { /* clear filter handled by parent */ onClose(); }}
                            className="text-xs text-stone-400 hover:text-white px-3 py-1 border border-stone-600 rounded-full"
                        >
                            Show All
                        </button>
                    )}
                    <button onClick={onClose} className="p-2 hover:bg-stone-800 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {displayed.length === 0 && (
                    <div className="text-center text-stone-400 py-16">
                        <p className="text-4xl mb-3">🌍</p>
                        <p className="font-medium">No connections yet</p>
                        <p className="text-sm mt-1">Tap a country on the map to start!</p>
                    </div>
                )}
                {displayed.map((person) => {
                    const isExpanded = expandedId === person.id;
                    const isConfirming = confirmDeleteId === person.id;

                    return (
                        <div
                            key={person.id}
                            className={`bg-white rounded-xl overflow-hidden shadow transition-all ${person.isDemo ? 'opacity-70' : ''}`}
                        >
                            {/* Card Header */}
                            <div className="flex items-center gap-3 p-3">
                                {/* Photo or flag */}
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 flex items-center justify-center text-2xl">
                                    {person.photo
                                        ? <img src={person.photo} alt={person.name || person.country} className="w-full h-full object-cover" />
                                        : getFlagEmoji(person.country)
                                    }
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-stone-800">{person.name || "Anonymous"}</span>
                                        {person.isDemo && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-stone-200 text-stone-500 rounded">DEMO</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-stone-500 font-medium">{person.city} · {getFlagEmoji(person.country)} {person.country}</p>
                                    {/* First souvenir preview */}
                                    {person.souvenirs[0] && (
                                        <p className="text-xs text-stone-400 truncate mt-0.5">
                                            {person.souvenirs[0].icon} "{person.souvenirs[0].answer}"
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1 shrink-0">
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : person.id)}
                                        className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 transition-colors"
                                    >
                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                    {!person.isDemo && (
                                        <button
                                            onClick={() => setConfirmDeleteId(person.id)}
                                            className="p-1.5 hover:bg-red-50 rounded-lg text-stone-300 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Expanded answers */}
                            {isExpanded && (
                                <div className="border-t border-stone-100 px-3 pb-3 pt-2 space-y-2 animate-in fade-in slide-in-from-top-2">
                                    {person.souvenirs.map((s, i) => (
                                        <div key={i} className={`p-2.5 rounded-lg text-sm ${s.color} bg-opacity-30`}>
                                            <p className="font-bold text-xs uppercase tracking-wide mb-1">{s.icon} {s.title}</p>
                                            <p className="text-stone-600 italic text-xs mb-1">"{s.question}"</p>
                                            <p className="text-stone-800">"{s.answer}"</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Delete confirmation */}
                            {isConfirming && (
                                <div className="border-t border-red-100 bg-red-50 px-3 py-2 flex items-center justify-between">
                                    <p className="text-xs text-red-700 font-medium">Remove this entry?</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setConfirmDeleteId(null)}
                                            className="text-xs px-2 py-1 text-stone-600 hover:bg-stone-100 rounded"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => { onDelete(person.id); setConfirmDeleteId(null); }}
                                            className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PeopleBook;
```

**Step 2: Commit**

```bash
git add src/components/PeopleBook.jsx
git commit -m "feat: add PeopleBook — person-centric passport gallery with expand/delete"
```

---

## Task 6: Update WorldMap.jsx — fix tooltip + hover preview

**Files:**
- Modify: `src/components/WorldMap.jsx`

**Step 1: Fix tooltip and add hover preview**

The only change needed in WorldMap.jsx:

1. Add `data-tooltip-id="my-tooltip"` to the `<Geography>` element (fixes the tooltip bug)
2. Accept `allCountryStats` prop and use it in the tooltip content to show person count + first person's name
3. Pass `onCountryRightClick` for context-menu style access to PeopleBook

Find this block in WorldMap.jsx (around line 258–284):

```jsx
// CHANGE: Geography onClick + hover handlers + add data-tooltip-id
<Geography
    geography={geo}
    data-tooltip-id="my-tooltip"        // ADD THIS LINE
    onClick={() => onCountryClick(name)}
    onMouseEnter={() => {
        // REPLACE the existing onMouseEnter content:
        const stats = allCountryStats?.[name];
        if (stats && stats.count > 0) {
            const names = stats.people.slice(0, 2).map(p => p.name || 'Anonymous').join(', ');
            const more = stats.count > 2 ? ` +${stats.count - 2} more` : '';
            setContent(`${name} · ${stats.count} ${stats.count === 1 ? 'person' : 'people'}: ${names}${more}`);
        } else {
            setContent(name);
        }
    }}
    onMouseLeave={() => setContent("")}
    // ... rest unchanged
```

Also update WorldMap to accept and forward `allCountryStats` and `onCountryRightClick`:

```jsx
// Line 16 — update signature:
const WorldMap = ({ onCountryClick, onCountryRightClick, countryStats = {}, allCountryStats = {} }) => {
```

Add right-click handler to the Geography element:
```jsx
onContextMenu={(e) => { e.preventDefault(); if (onCountryRightClick) onCountryRightClick(name); }}
```

**Step 2: Commit**

```bash
git add src/components/WorldMap.jsx
git commit -m "fix: add data-tooltip-id to fix hover tooltip, add allCountryStats preview"
```

---

## Task 7: Update RulesModal.jsx — add Try Demo CTA

**Files:**
- Modify: `src/components/RulesModal.jsx`

**Step 1: Add onStartDemo prop and button**

Update the component signature:
```jsx
const RulesModal = ({ isOpen, onClose, onStartDemo }) => {
```

Replace the existing bottom button block with two buttons:
```jsx
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
```

**Step 2: Commit**

```bash
git add src/components/RulesModal.jsx
git commit -m "feat: add Try Demo CTA to RulesModal"
```

---

## Task 8: Playwright verification (run by Claude after all tasks complete)

> **Note:** This task is executed by Claude using the Playwright MCP tool, not by Codex. After all 7 implementation tasks are committed, run `npm run dev` in the project directory, then ask Claude to verify the following using browser automation:

1. App loads → map shows colored countries from demo data (India, China, Brazil, Japan, Nigeria, South Korea, Mexico should be colored)
2. RulesModal auto-opens on first visit (clear localStorage first to simulate)
3. "Try Demo Walk-through" button in RulesModal triggers the journal with South Korea pre-filled
4. Clicking a country opens JournalModal with step 1 (city search)
5. Completing the 4-step flow and saving adds a new card to PeopleBook
6. PeopleBook card shows expand/collapse for souvenir answers
7. Delete button shows confirmation before removing an entry
8. Hovering over a country on the map shows a tooltip with person names
9. Clicking a colored country opens PeopleBook filtered to that country (right-click)

```bash
# Start dev server before Playwright checks
cd /Users/jeeminhan/Code/global-atlas
npm run dev
```
