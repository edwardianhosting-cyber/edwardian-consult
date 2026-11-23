'use client';

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
  'sin²θ + cos²θ = 1',
  'logₐx',
  'd/dx',
  '∂',
  '∝',
  'C = 2πr',
  'A = πr²',
];

export default function AnimatedPageBackground() {
  const items = [];
  for (let i = 0; i < 18; i++) {
    items.push({
      id: i,
      formula: formulas[i % formulas.length],
      top: 10 + (i * 5.5) % 90,
      left: 5 + (i * 7.3) % 90,
      size: 10 + (i % 14),
      delay: (i % 5) * 1.5,
      duration: 10 + (i % 12),
    });
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute text-primary-400/30 select-none font-mono"
          style={{
            top: `${item.top}%`,
            left: `${item.left}%`,
            fontSize: `${item.size}px`,
            animation: `floatPage ${item.duration}s ease-in-out ${item.delay}s infinite`,
          }}
          dangerouslySetInnerHTML={{ __html: item.formula }}
        />
      ))}
      <style>{`
        @keyframes floatPage {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-15px) rotate(3deg); opacity: 0.6; }
          100% { transform: translateY(15px) rotate(-3deg); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
