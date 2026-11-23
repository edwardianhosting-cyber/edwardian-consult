'use client';

import { useEffect, useState } from 'react';

const formulas = [
  'E = mc²',
  'a² + b² = c²',
  '√x',
  '∑',
  'π',
  '∫',
  'Δ',
  '∞',
  'x² + y² = r²',
  'F = ma',
  'v = u + at',
  'PV = nRT',
  'E = hf',
  'C = 2πr',
  'A = πr²',
  'sin²θ + cos²θ = 1',
  'logₐx',
  'd/dx',
  '∂',
  '∝',
];

export default function AnimatedFormulasBackground() {
  const [items, setItems] = useState<{ id: number; formula: string; top: number; left: number; size: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    const generateItems = () => {
      const newItems = [];
      for (let i = 0; i < 24; i++) {
        newItems.push({
          id: i,
          formula: formulas[Math.floor(Math.random() * formulas.length)],
          top: Math.random() * 100,
          left: Math.random() * 100,
          size: 12 + Math.random() * 18,
          delay: Math.random() * 5,
          duration: 8 + Math.random() * 12,
        });
      }
      setItems(newItems);
    };
    generateItems();
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute text-primary-600/20 select-none"
          style={{
            top: `${item.top}%`,
            left: `${item.left}%`,
            fontSize: `${item.size}px`,
            animation: `float ${item.duration}s ease-in-out ${item.delay}s infinite`,
            opacity: 0,
          }}
          dangerouslySetInnerHTML={{ __html: item.formula }}
        />
      ))}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0; }
          20% { opacity: 0.4; }
          50% { transform: translateY(-20px) rotate(5deg); opacity: 0.6; }
          80% { opacity: 0.4; }
          100% { transform: translateY(20px) rotate(-5deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
