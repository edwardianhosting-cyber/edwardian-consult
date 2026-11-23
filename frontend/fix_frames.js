const fs = require('fs');
const path = 'C:/Users/USER/Desktop/edwardian-consult-main/frontend/src/app/about/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace all frame wrappers (border-4) with history-style frames (border-8)
// Pattern for rotate-2 frames
content = content.replace(
  /<div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-2xl transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 hover:scale-\[1\.02\] cursor-pointer group">\n\s*<div className="absolute -inset-3 rotate-2 rounded-3xl bg-accent-400\/20 shadow-xl group-hover:rotate-0 transition-transform duration-500" \/>\n\s*<div className="relative overflow-hidden rounded-2xl h-\[280px\] sm:h-\[320px\]">/g,
  '<div className="relative md:ml-4">\n                    <div className="absolute -inset-3 rotate-2 rounded-3xl bg-accent-400/30 shadow-xl" />\n                    <div className="relative -rotate-1 overflow-hidden rounded-2xl border-8 border-white bg-white shadow-2xl transition-transform duration-300 hover:rotate-0 h-[280px] sm:h-[320px]">'
);

// Pattern for -rotate-2 frames
content = content.replace(
  /<div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-2xl transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 hover:scale-\[1\.02\] cursor-pointer group order-2 md:order-1">\n\s*<div className="absolute -inset-3 -rotate-2 rounded-3xl bg-primary-400\/20 shadow-xl group-hover:rotate-0 transition-transform duration-500" \/>\n\s*<div className="relative overflow-hidden rounded-2xl h-\[280px\] sm:h-\[320px\]">/g,
  '<div className="relative md:ml-4 order-2 md:order-1">\n                    <div className="absolute -inset-3 -rotate-2 rounded-3xl bg-accent-400/30 shadow-xl" />\n                    <div className="relative -rotate-1 overflow-hidden rounded-2xl border-8 border-white bg-white shadow-2xl transition-transform duration-300 hover:rotate-0 h-[280px] sm:h-[320px]">'
);

fs.writeFileSync(path, content);
console.log('Done');