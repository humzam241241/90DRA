import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const brainParts = [
  {
    id: "prefrontal_cortex",
    name: "Prefrontal Cortex",
    shortName: "PFC",
    description: "Decision making & willpower",
    color: "#3B82F6",
    position: { x: 50, y: 15 },
    size: 28
  },
  {
    id: "amygdala",
    name: "Amygdala",
    shortName: "AMG",
    description: "Fear & emotional control",
    color: "#EF4444",
    position: { x: 35, y: 50 },
    size: 18
  },
  {
    id: "hippocampus",
    name: "Hippocampus",
    shortName: "HIP",
    description: "Memory & learning",
    color: "#22C55E",
    position: { x: 65, y: 55 },
    size: 20
  },
  {
    id: "basal_ganglia",
    name: "Basal Ganglia",
    shortName: "BG",
    description: "Habits & routines",
    color: "#F59E0B",
    position: { x: 50, y: 45 },
    size: 22
  },
  {
    id: "nucleus_accumbens",
    name: "Nucleus Accumbens",
    shortName: "NA",
    description: "Reward & motivation",
    color: "#A855F7",
    position: { x: 50, y: 60 },
    size: 16
  },
  {
    id: "hypothalamus",
    name: "Hypothalamus",
    shortName: "HYP",
    description: "Hunger & sleep",
    color: "#EC4899",
    position: { x: 50, y: 72 },
    size: 14
  },
  {
    id: "cerebellum",
    name: "Cerebellum",
    shortName: "CER",
    description: "Coordination & balance",
    color: "#6366F1",
    position: { x: 75, y: 75 },
    size: 24
  }
];

export default function InteractiveBrain({ selectedPart, onSelectPart, completedLessons = {}, totalLessons = {} }) {
  const [hoveredPart, setHoveredPart] = useState(null);

  const getPartProgress = (partId) => {
    const completed = completedLessons[partId] || 0;
    const total = totalLessons[partId] || 1;
    return Math.round((completed / total) * 100);
  };

  const isPartActive = (partId) => getPartProgress(partId) > 0;
  const isPartComplete = (partId) => getPartProgress(partId) === 100;

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      {/* Brain Background Shape */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Brain outline */}
        <ellipse
          cx="50"
          cy="50"
          rx="42"
          ry="45"
          fill="url(#brainGlow)"
          stroke="rgba(139, 92, 246, 0.2)"
          strokeWidth="0.5"
        />
        
        {/* Neural network lines */}
        {brainParts.map((part, i) => 
          brainParts.slice(i + 1).map((otherPart, j) => (
            <motion.line
              key={`${part.id}-${otherPart.id}`}
              x1={part.position.x}
              y1={part.position.y}
              x2={otherPart.position.x}
              y2={otherPart.position.y}
              stroke={isPartActive(part.id) && isPartActive(otherPart.id) ? "rgba(139, 92, 246, 0.4)" : "rgba(139, 92, 246, 0.1)"}
              strokeWidth="0.3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: (i + j) * 0.1 }}
            />
          ))
        )}
      </svg>

      {/* Brain Part Nodes */}
      {brainParts.map((part) => {
        const progress = getPartProgress(part.id);
        const isActive = isPartActive(part.id);
        const isComplete = isPartComplete(part.id);
        const isSelected = selectedPart === part.id;
        const isHovered = hoveredPart === part.id;

        return (
          <motion.button
            key={part.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 focus:outline-none"
            style={{
              left: `${part.position.x}%`,
              top: `${part.position.y}%`,
            }}
            onClick={() => onSelectPart(part.id)}
            onMouseEnter={() => setHoveredPart(part.id)}
            onMouseLeave={() => setHoveredPart(null)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${part.color}40 0%, transparent 70%)`,
                width: `${part.size * 2}px`,
                height: `${part.size * 2}px`,
                marginLeft: `-${part.size / 2}px`,
                marginTop: `-${part.size / 2}px`,
              }}
              animate={{
                scale: isSelected ? [1, 1.3, 1] : isHovered ? 1.2 : 1,
                opacity: isActive ? 1 : 0.3,
              }}
              transition={{
                scale: isSelected ? { repeat: Infinity, duration: 2 } : { duration: 0.3 },
              }}
            />
            
            {/* Progress ring */}
            <svg
              width={part.size}
              height={part.size}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: '50%', top: '50%' }}
            >
              <circle
                cx={part.size / 2}
                cy={part.size / 2}
                r={(part.size / 2) - 2}
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
              />
              <motion.circle
                cx={part.size / 2}
                cy={part.size / 2}
                r={(part.size / 2) - 2}
                fill="none"
                stroke={part.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * ((part.size / 2) - 2)}`}
                initial={{ strokeDashoffset: 2 * Math.PI * ((part.size / 2) - 2) }}
                animate={{ 
                  strokeDashoffset: 2 * Math.PI * ((part.size / 2) - 2) * (1 - progress / 100)
                }}
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
              />
            </svg>
            
            {/* Center node */}
            <motion.div
              className="relative rounded-full flex items-center justify-center shadow-lg"
              style={{
                width: `${part.size}px`,
                height: `${part.size}px`,
                background: isComplete 
                  ? `linear-gradient(135deg, ${part.color}, ${part.color}dd)`
                  : isActive 
                    ? `linear-gradient(135deg, ${part.color}90, ${part.color}60)`
                    : 'rgba(100, 100, 120, 0.3)',
                border: `2px solid ${isSelected ? 'white' : isActive ? part.color : 'rgba(255,255,255,0.2)'}`,
              }}
              animate={{
                boxShadow: isSelected 
                  ? `0 0 20px ${part.color}80, 0 0 40px ${part.color}40`
                  : isActive 
                    ? `0 0 10px ${part.color}40`
                    : 'none'
              }}
            >
              <span className="text-white font-bold" style={{ fontSize: part.size * 0.35 }}>
                {progress > 0 ? `${progress}%` : ''}
              </span>
            </motion.div>
          </motion.button>
        );
      })}

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredPart && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-1/2 bottom-0 transform -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm rounded-xl px-4 py-3 text-center z-10"
          >
            <p className="text-white font-semibold text-sm">
              {brainParts.find(p => p.id === hoveredPart)?.name}
            </p>
            <p className="text-slate-400 text-xs mt-1">
              {brainParts.find(p => p.id === hoveredPart)?.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}