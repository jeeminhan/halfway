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
