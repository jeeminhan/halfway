
import React, { useState, useEffect, useRef, useCallback } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import { geoCentroid, geoArea } from "d3-geo";
import { Plus, Minus } from "lucide-react";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Large countries that show labels at low zoom (Top 7 by area)
const majorCountries = [
    "United States of America", "Russia", "Canada", "China", "Brazil",
    "Australia", "India"
];

const WorldMap = ({ onCountryClick, onCountryRightClick, countryStats = {}, allCountryStats = {} }) => {
    const [content, setContent] = useState("");

    // Initial state: Center of world (0,0), scale depends on device
    const [viewState, setViewState] = useState(() => {
        const isMobileInit = typeof window !== 'undefined' && window.innerWidth < 768;
        return {
            rotateX: 0,   // Horizontal (Endless Scroll)
            centerY: 0,   // Vertical (Stable Scroll)
            scale: isMobileInit ? 140 : 160
        };
    });

    // Track dimensions to verify map sizing
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const containerRef = useRef(null);

    // Interaction Refs
    const isDragging = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });
    const lastPinchDist = useRef(null);

    // --- EFFECT: Resize Observer ---
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ width, height });
            }
        });
        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, []);

    // --- INTERACTION LOGIC (Custom) ---

    // 1. Zoom Logic (Wheel / Pinch / Buttons)
    const handleZoom = useCallback((delta, isMultiplier = true) => {
        setViewState(current => {
            let newScale;
            if (isMultiplier) {
                newScale = current.scale * delta;
            } else {
                newScale = current.scale + delta;
            }

            // Clamp Zoom: Min 100 (Zoom 1x), Max 4000 (Zoom ~30x)
            newScale = Math.max(100, Math.min(4000, newScale));
            return { ...current, scale: newScale };
        });
    }, []);

    // 2. Pan Logic (Drag) -> Updates RotateX (horizontal) and CenterY (vertical)
    const handlePan = useCallback((dx, dy) => {
        setViewState(current => {
            // Sensitivity adjusts with scale: Zoomed in = slower pan
            const sensitivity = 75 / current.scale;

            return {
                ...current,
                rotateX: current.rotateX + (dx * sensitivity),
                centerY: Math.max(-80, Math.min(80, current.centerY + (dy * sensitivity)))
            };
        });
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // -- HANDLERS --

        const onTouchStart = (e) => {
            if (e.touches.length === 2) {
                // Pinch Start
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                lastPinchDist.current = Math.sqrt(dx * dx + dy * dy);
                e.preventDefault();
            } else if (e.touches.length === 1) {
                // Pan Start
                isDragging.current = true;
                lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        };

        const onTouchMove = (e) => {
            // Prevent default scroll behavior
            if (e.cancelable) e.preventDefault();

            if (e.touches.length === 2 && lastPinchDist.current) {
                // Pinch Move
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const factor = dist / lastPinchDist.current;
                handleZoom(factor, true); // Zoom by multiplier
                lastPinchDist.current = dist;

            } else if (e.touches.length === 1 && isDragging.current) {
                // Pan Move
                const dx = e.touches[0].clientX - lastPos.current.x;
                const dy = e.touches[0].clientY - lastPos.current.y;
                lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                handlePan(dx, dy);
            }
        };

        const onTouchEnd = () => {
            isDragging.current = false;
            lastPinchDist.current = null;
        };

        const onMouseDown = (e) => {
            isDragging.current = true;
            lastPos.current = { x: e.clientX, y: e.clientY };
            container.style.cursor = 'grabbing';
        };

        const onMouseMove = (e) => {
            if (!isDragging.current) return;
            const dx = e.clientX - lastPos.current.x;
            const dy = e.clientY - lastPos.current.y;
            lastPos.current = { x: e.clientX, y: e.clientY };
            handlePan(dx, dy);
        };

        const onMouseUp = () => {
            isDragging.current = false;
            if (container) container.style.cursor = 'grab';
        };

        const onWheel = (e) => {
            // Standardize wheel direction
            e.preventDefault();
            const delta = -e.deltaY;
            // Use a small multiplier for smooth wheel zoom
            const multiplier = delta > 0 ? 1.05 : 0.95;
            handleZoom(multiplier, true);
        };

        // Initialize Cursor
        container.style.cursor = 'grab';

        // Add Listeners (Passive: false due to preventDefault)
        // Note: Using 'wheel' non-passive is vital for controlling zoom without scrolling page
        container.addEventListener('touchstart', onTouchStart, { passive: false });
        container.addEventListener('touchmove', onTouchMove, { passive: false });
        container.addEventListener('touchend', onTouchEnd);
        container.addEventListener('wheel', onWheel, { passive: false });

        container.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        return () => {
            container.removeEventListener('touchstart', onTouchStart);
            container.removeEventListener('touchmove', onTouchMove);
            container.removeEventListener('touchend', onTouchEnd);
            container.removeEventListener('wheel', onWheel);
            container.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [handleZoom, handlePan]);


    // --- RENDERING HELPERS ---

    const colors = {
        unvisited: "#D6D3D1",
        bronze: "#B45309",
        silver: "#BCC6CC",
        gold: "#EAB308",
    };

    // Derived Zoom Level for labels (Scale 160 ~ Zoom 1)
    const zoomLevel = viewState.scale / 160;

    const getLabelOpacity = (name, geo) => {
        try {
            if (!name) return 0;
            if (majorCountries.includes(name)) return zoomLevel < 2 ? 0.6 : 0.8;
            if (!geo) return 0;

            const area = geoArea(geo); // Steradians
            if (isNaN(area)) return 0;

            // Updated Thresholds (Compatible with new zoomLevel calculation)
            if (area > 0.05) return zoomLevel > 2 ? 0.8 : 0;   // Very Large
            if (area > 0.005) return zoomLevel > 3 ? 0.8 : 0;  // Medium-Large
            if (area > 0.001) return zoomLevel > 4 ? 0.9 : 0;  // Medium-Small
            if (area > 0.0002) return zoomLevel > 5 ? 0.9 : 0; // Small

            return zoomLevel > 6 ? 1 : 0;
        } catch (e) { return 0; }
    };

    // Dynamic font size based on zoom (Flatter curve = much larger text at high zoom)
    const getFontSize = () => Math.max(1.5, 24 / Math.pow(zoomLevel, 0.3));


    return (
        <div
            ref={containerRef}
            className="w-full h-full bg-stone-100 relative overflow-hidden"
            style={{ touchAction: 'none' }} // Critical for browser gestures
        >
            <ComposableMap
                width={dimensions.width}
                height={dimensions.height}
                projection="geoMercator"
                projectionConfig={{
                    rotate: [viewState.rotateX, 0, 0],
                    center: [0, viewState.centerY],
                    scale: viewState.scale
                }}
            >
                {/* No ZoomableGroup needed anymore! */}
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map((geo) => {
                            const name = geo.properties.name;
                            const stats = countryStats[name];
                            const regionCount = typeof stats?.count === "number" ? stats.count : stats?.regions?.size || 0;

                            // Fill Color
                            let fillColor = colors.unvisited;
                            if (regionCount >= 3) fillColor = colors.gold;
                            else if (regionCount === 2) fillColor = colors.silver;
                            else if (regionCount === 1) fillColor = colors.bronze;

                            // Label
                            const opacity = getLabelOpacity(name, geo);
                            const centroid = geoCentroid(geo);

                            return (
                                <React.Fragment key={geo.rsmKey}>
                                    <Geography
                                        geography={geo}
                                        data-tooltip-id="my-tooltip"
                                        onClick={() => onCountryClick(name)}
                                        onContextMenu={(e) => { e.preventDefault(); if (onCountryRightClick) onCountryRightClick(name); }}
                                        onMouseEnter={() => {
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
                                        style={{
                                            default: {
                                                fill: fillColor,
                                                fillOpacity: 1,
                                                stroke: "#A8A29E",
                                                strokeWidth: 0.5 / zoomLevel,
                                                outline: "none"
                                            },
                                            hover: {
                                                fill: regionCount > 0 ? fillColor : "#A8A29E",
                                                fillOpacity: 1,
                                                stroke: "#78716C",
                                                strokeWidth: 1.5 / zoomLevel,
                                                outline: "none",
                                                cursor: "pointer"
                                            },
                                            pressed: {
                                                fill: "#78716C",
                                                outline: "none"
                                            }
                                        }}
                                    />
                                    {opacity > 0 && (
                                        <Marker coordinates={centroid}>
                                            <text
                                                textAnchor="middle"
                                                y={2}
                                                style={{
                                                    fontFamily: "sans-serif",
                                                    fontSize: getFontSize(),
                                                    fill: "#44403C",
                                                    opacity: opacity,
                                                    pointerEvents: "none",
                                                    textShadow: "0px 0px 2px rgba(255,255,255,0.8)",
                                                    fontWeight: 600,
                                                    transition: "opacity 0.2s"
                                                }}
                                            >
                                                {name}
                                            </text>
                                        </Marker>
                                    )}
                                </React.Fragment>
                            );
                        })
                    }
                </Geographies>
            </ComposableMap>

            <Tooltip id="my-tooltip" content={content} />

            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                    onClick={() => handleZoom(1.5, true)}
                    className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow flex items-center justify-center text-stone-600 hover:bg-white active:scale-95"
                >
                    <Plus size={20} />
                </button>
                <button
                    onClick={() => handleZoom(0.66, true)}
                    className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow flex items-center justify-center text-stone-600 hover:bg-white active:scale-95"
                >
                    <Minus size={20} />
                </button>
            </div>

            {/* Legend / Info */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
                <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-stone-500 shadow-sm">
                    {dimensions.width < 768 ? "Pinch to zoom • Drag to pan" : "Scroll to zoom • Drag to pan"}
                </div>
                <div className="bg-white/80 backdrop-blur px-2 py-1 rounded-full text-xs font-medium text-stone-400 shadow-sm">
                    {zoomLevel.toFixed(1)}x
                </div>
            </div>
        </div>
    );
};

export default WorldMap;
