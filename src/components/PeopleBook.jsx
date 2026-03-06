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
