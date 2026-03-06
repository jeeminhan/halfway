import React, { useState, useEffect, useMemo } from "react";
import SouvenirDie from "./SouvenirDie";
import { Camera, X, MapPin, Search, User } from "lucide-react";
import { Country, City } from 'country-state-city';
import { compressImage } from "../utils/imageUtils";

const MIN_ROLLS = 2;
const MAX_ROLLS = 3;
const SPIRITUAL_OPTIONS = [
    "Buddhist",
    "Muslim",
    "Hindu",
    "Christian",
    "Confucian/Folk Religion",
    "Secular/None",
    "Other"
];

const JournalModal = ({ isOpen, countryName, isDemoMode, onClose, onSave }) => {
    const [step, setStep] = useState(1);
    const [city, setCity] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [personName, setPersonName] = useState("");
    const [spiritualBackground, setSpiritualBackground] = useState(null);
    const [rolls, setRolls] = useState([]); // [{ souvenir, answer, deepened }]
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [pendingSouvenir, setPendingSouvenir] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isRolling, setIsRolling] = useState(false);
    const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
    const [isQuestionVisible, setIsQuestionVisible] = useState(false);
    const [deepeningIndex, setDeepeningIndex] = useState(null);
    const [pendingDeepened, setPendingDeepened] = useState({});
    const [pendingDeepenedAnswers, setPendingDeepenedAnswers] = useState({});

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

    // Demo mode: pre-fill Seoul, start at Name step
    useEffect(() => {
        if (isDemoMode && isOpen) {
            setCity("Seoul");
            setSearchTerm("Seoul");
            setStep(2);
        }
    }, [isDemoMode, isOpen]);

    // Demo mode: auto-roll after arriving at roll step
    useEffect(() => {
        if (isDemoMode && step === 4 && rolls.length === 0) {
            setTimeout(() => setIsRolling(true), 800);
        }
    }, [isDemoMode, step, rolls.length]);

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setCity("");
            setSearchTerm("");
            setPersonName("");
            setSpiritualBackground(null);
            setRolls([]);
            setCurrentAnswer("");
            setPendingSouvenir(null);
            setPhotoPreview(null);
            setIsRolling(false);
            setIsGeneratingQuestion(false);
            setIsQuestionVisible(false);
            setDeepeningIndex(null);
            setPendingDeepened({});
            setPendingDeepenedAnswers({});
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const usedIds = rolls.map(r => r.souvenir.id);

    const requestQuestion = async (payload, logMessage) => {
        const timeoutMs = 3000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch("/api/generate-question", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("generation_failed");

            const data = await response.json();
            const aiQuestion = typeof data?.question === "string" ? data.question.trim() : "";
            return aiQuestion || null;
        } catch (err) {
            console.error(logMessage, err);
            return null;
        } finally {
            clearTimeout(timeoutId);
        }
    };

    const generateQuestion = async (souvenir, rollNumber) => requestQuestion({
        country: countryName,
        city,
        spiritualBackground: spiritualBackground || "Unknown",
        souvenirTopic: souvenir.id,
        rollNumber
    }, "AI question generation failed, using fallback.");

    const handleRollComplete = async (result) => {
        setPendingSouvenir(result);
        setCurrentAnswer("");
        setIsRolling(false);
        setIsGeneratingQuestion(true);
        setIsQuestionVisible(false);

        const rollNumber = rolls.length + 1;
        const aiQuestion = await generateQuestion(result, rollNumber);
        const resolvedQuestion = aiQuestion || result.question;

        setPendingSouvenir({ ...result, question: resolvedQuestion, isAI: !!aiQuestion });
        setIsGeneratingQuestion(false);
        setTimeout(() => setIsQuestionVisible(true), 30);

        // Demo mode: pre-fill answer
        if (isDemoMode) {
            setTimeout(() => {
                setCurrentAnswer("Tteokbokki from a pojangmacha stall on a rainy evening — it's spicy, warm, and tastes like home.");
            }, 600);
        }
    };

    const handleConfirmAnswer = () => {
        if (!currentAnswer.trim() || !pendingSouvenir) return;
        const newRolls = [...rolls, { souvenir: pendingSouvenir, answer: currentAnswer, deepened: null }];
        setRolls(newRolls);
        setPendingSouvenir(null);
        setCurrentAnswer("");
    };

    const handleDeepen = async (rollIndex) => {
        if (deepeningIndex !== null) return;
        const roll = rolls[rollIndex];
        if (!roll) return;

        setDeepeningIndex(rollIndex);
        const aiQuestion = await requestQuestion({
            mode: "deepen",
            country: countryName,
            city,
            spiritualBackground: spiritualBackground || "Unknown",
            originalQuestion: roll.souvenir.question,
            studentAnswer: roll.answer
        }, "AI deepen generation failed.");
        setDeepeningIndex(null);

        if (!aiQuestion) return;
        setPendingDeepened(prev => ({ ...prev, [rollIndex]: aiQuestion }));
        setPendingDeepenedAnswers(prev => ({ ...prev, [rollIndex]: "" }));
    };

    const handleDeepenedAnswerChange = (rollIndex, value) => {
        setPendingDeepenedAnswers(prev => ({ ...prev, [rollIndex]: value }));
    };

    const handleSaveDeepened = (rollIndex) => {
        const question = pendingDeepened[rollIndex];
        const answer = (pendingDeepenedAnswers[rollIndex] || "").trim();
        if (!question || !answer) return;

        setRolls(prev => prev.map((roll, idx) => (
            idx === rollIndex ? { ...roll, deepened: { question, answer } } : roll
        )));
        setPendingDeepened(prev => {
            const next = { ...prev };
            delete next[rollIndex];
            return next;
        });
        setPendingDeepenedAnswers(prev => {
            const next = { ...prev };
            delete next[rollIndex];
            return next;
        });
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
            spiritualBackground: spiritualBackground || null,
            souvenirs: rolls.map(r => ({
                id: r.souvenir.id,
                title: r.souvenir.title,
                icon: r.souvenir.icon,
                question: r.souvenir.question,
                answer: r.answer,
                color: r.souvenir.color,
                deepened: r.deepened || null
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
                    {[1,2,3,4,5].map(s => (
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

                    {/* Step 3: Spiritual Roots */}
                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div>
                                <h3 className="text-lg font-bold text-stone-800">Spiritual Roots 🌱</h3>
                                <p className="text-stone-600 mt-1">What faith tradition shaped how you grew up?</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {SPIRITUAL_OPTIONS.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => setSpiritualBackground(option)}
                                        className={`text-left text-sm border rounded-lg p-3 transition-colors ${spiritualBackground === option
                                            ? "border-stone-800 bg-stone-800 text-white"
                                            : "border-stone-300 hover:bg-stone-50 text-stone-700"
                                        }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setSpiritualBackground(null); setStep(4); }}
                                    className="flex-1 border border-stone-300 text-stone-600 py-3 rounded-lg font-medium hover:bg-stone-50 transition-colors"
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={() => setStep(4)}
                                    className="flex-1 bg-stone-800 text-white py-3 rounded-lg font-bold hover:bg-stone-900 transition-colors"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Souvenir Rolls */}
                    {step === 4 && (
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
                                    <div className="mt-3">
                                        {roll.deepened ? (
                                            <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 space-y-2">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">Deepened</p>
                                                <p className="text-sm font-medium text-violet-900">"{roll.deepened.question}"</p>
                                                <p className="text-sm text-violet-800">"{roll.deepened.answer}"</p>
                                            </div>
                                        ) : pendingDeepened[i] ? (
                                            <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 space-y-2">
                                                <p className="text-sm font-medium text-violet-900">"{pendingDeepened[i]}"</p>
                                                <textarea
                                                    value={pendingDeepenedAnswers[i] || ""}
                                                    onChange={(e) => handleDeepenedAnswerChange(i, e.target.value)}
                                                    placeholder="Type their follow-up answer..."
                                                    className="w-full p-2 border border-violet-200 bg-white rounded-lg h-20 focus:ring-2 focus:ring-violet-300 outline-none resize-none text-sm"
                                                />
                                                <button
                                                    disabled={!(pendingDeepenedAnswers[i] || "").trim()}
                                                    onClick={() => handleSaveDeepened(i)}
                                                    className="bg-violet-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold disabled:opacity-50 hover:bg-violet-700 transition-colors"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        ) : deepeningIndex === i ? (
                                            <div className="h-9 w-32 rounded-md bg-violet-100 animate-pulse" />
                                        ) : (
                                            <button
                                                onClick={() => handleDeepen(i)}
                                                className="text-sm font-semibold text-violet-700 hover:text-violet-800 transition-colors"
                                            >
                                                ✨ Deepen →
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Pending answer */}
                            {pendingSouvenir && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                    <div className={`p-4 rounded-xl border-2 ${pendingSouvenir.color}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{pendingSouvenir.icon}</span>
                                                <span className="font-bold uppercase tracking-wider text-xs">{pendingSouvenir.title}</span>
                                            </div>
                                            {isGeneratingQuestion
                                                ? <span className="text-[10px] font-bold text-stone-400 animate-pulse">✨ generating...</span>
                                                : pendingSouvenir.isAI
                                                    ? <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">✨ AI</span>
                                                    : <span className="text-[10px] text-stone-300">fallback</span>
                                            }
                                        </div>
                                        {isGeneratingQuestion ? (
                                            <div className="space-y-2 animate-pulse">
                                                <div className="h-3 bg-stone-200 rounded w-5/6" />
                                                <div className="h-3 bg-stone-200 rounded w-4/6" />
                                                <div className="h-3 bg-stone-200 rounded w-3/4" />
                                            </div>
                                        ) : (
                                            <p
                                                className={`text-base font-medium text-stone-800 transition-opacity duration-500 ${isQuestionVisible ? "opacity-100" : "opacity-0"}`}
                                            >
                                                "{pendingSouvenir.question}"
                                            </p>
                                        )}
                                    </div>
                                    {!isGeneratingQuestion && (
                                        <>
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
                                        </>
                                    )}
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
                                        onClick={() => setStep(5)}
                                        className="flex-1 bg-yellow-400 text-stone-900 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors shadow"
                                    >
                                        Continue →
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 5: Photo + Save */}
                    {step === 5 && (
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
