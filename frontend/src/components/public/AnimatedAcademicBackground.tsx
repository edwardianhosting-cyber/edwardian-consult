'use client';

import {
  GraduationCap,
  BookOpen,
  Calculator,
  Atom,
  FlaskConical,
  Award,
  Compass,
  Palette,
  Brush,
  Pencil,
  Music,
  Scissors,
  Camera,
  PenTool,
  Lightbulb,
  Globe,
  Microscope,
  Beaker,
  BookMarked,
  Shapes,
} from 'lucide-react';

interface AnimatedAcademicBackgroundProps {
  className?: string;
  fixed?: boolean;
}

const expressions = [
  'E = mc²',
  'PV = nRT',
  'a² + b² = c²',
  '∫ f(x) dx',
  'SO₄²⁻',
  'F = ma',
  'dy/dx',
  'ΔE = q + w',
  'pH = -log[H⁺]',
  'λ = h/p',
  'V = IR',
  'KE = ½mv²',
];

const academicIcons = [
  { Icon: GraduationCap, label: 'graduation' },
  { Icon: BookOpen, label: 'book' },
  { Icon: Calculator, label: 'calculator' },
  { Icon: Atom, label: 'atom' },
  { Icon: FlaskConical, label: 'flask' },
  { Icon: Award, label: 'award' },
  { Icon: Compass, label: 'compass' },
  { Icon: BookMarked, label: 'bookmarked' },
  { Icon: Microscope, label: 'microscope' },
  { Icon: Beaker, label: 'beaker' },
  { Icon: Globe, label: 'globe' },
  { Icon: Lightbulb, label: 'lightbulb' },
];

const artIcons = [
  { Icon: Palette, label: 'palette' },
  { Icon: Brush, label: 'brush' },
  { Icon: Pencil, label: 'pencil' },
  { Icon: Music, label: 'music' },
  { Icon: Scissors, label: 'scissors' },
  { Icon: Camera, label: 'camera' },
  { Icon: PenTool, label: 'pen' },
  { Icon: Shapes, label: 'shapes' },
];

export default function AnimatedAcademicBackground({ className, fixed = false }: AnimatedAcademicBackgroundProps) {
  // Build a combined list of floating elements
  const floatingItems: { type: 'text' | 'icon'; content: string | any; top: number; left: number; size: number; delay: number; duration: number; rotation: number }[] = [];

  // Add science/math expressions (text)
  expressions.forEach((expr, i) => {
    floatingItems.push({
      type: 'text',
      content: expr,
      top: (i * 7.3 + 5) % 90,
      left: (i * 11.7 + 3) % 92,
      size: 10 + (i % 6),
      delay: (i % 6) * 2,
      duration: 20 + (i % 12),
      rotation: (i % 5) * 8 - 16,
    });
  });

  // Add academic icons
  academicIcons.forEach((item, i) => {
    floatingItems.push({
      type: 'icon',
      content: item.Icon,
      top: (i * 9.1 + 15) % 85,
      left: (i * 13.3 + 8) % 88,
      size: 14 + (i % 8),
      delay: (i % 7) * 2.5,
      duration: 22 + (i % 14),
      rotation: (i % 7) * 12 - 24,
    });
  });

  // Add art class icons
  artIcons.forEach((item, i) => {
    floatingItems.push({
      type: 'icon',
      content: item.Icon,
      top: (i * 11.5 + 25) % 80,
      left: (i * 15.7 + 12) % 85,
      size: 12 + (i % 6),
      delay: (i % 5) * 3,
      duration: 24 + (i % 10),
      rotation: (i % 6) * 15 - 30,
    });
  });

  return (
    <div
      className={`pointer-events-none select-none ${fixed ? 'fixed' : 'absolute'} inset-0 z-0 overflow-hidden ${className || ''}`}
      aria-hidden="true"
    >
      {/* Faint curved/dashed SVG orbit paths */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <path
          d="M5,50 Q25,10 50,50 T95,50"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.3"
          strokeDasharray="2,3"
          className="text-slate-400"
        />
        <path
          d="M10,30 Q40,80 90,20"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.3"
          strokeDasharray="3,4"
          className="text-slate-300"
        />
        <path
          d="M0,70 Q30,20 60,60 T100,40"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.3"
          strokeDasharray="4,5"
          className="text-slate-300"
        />
        <circle cx="20" cy="20" r="12" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2,3" className="text-slate-400" />
        <circle cx="80" cy="70" r="15" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="3,4" className="text-slate-300" />
        <ellipse cx="50" cy="50" rx="35" ry="20" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2,3" className="text-slate-400" />
      </svg>

      {/* Floating expressions and icons */}
      {floatingItems.map((item, idx) => (
        <div
          key={idx}
          className="absolute"
          style={{
            top: `${item.top}%`,
            left: `${item.left}%`,
            fontSize: `${item.size}px`,
            animation: `academicFloat ${item.duration}s ease-in-out ${item.delay}s infinite alternate`,
            transform: `rotate(${item.rotation}deg)`,
            willChange: 'transform',
          }}
        >
          {item.type === 'text' ? (
            <span className="text-slate-400/40 font-mono whitespace-nowrap font-semibold">
              {item.content as string}
            </span>
          ) : (
            <item.content
              className="text-slate-400/40"
              style={{ width: `${item.size * 1.2}px`, height: `${item.size * 1.2}px` }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
