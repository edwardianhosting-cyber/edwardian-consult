const fs = require('fs');
const path = 'C:/Users/USER/Desktop/edwardian-consult-main/frontend/src/app/about/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove the fallbackImages definition
content = content.replace(
  "  const fallbackImages = [\n    { src: '/images/hero-bg-1.jpg', alt: 'Edwardian Educational Consult' },\n    { src: '/images/hero-bg-2.jpg', alt: 'A glimpse of Edwardian learning resources' },\n    { src: '/images/student-3.png', alt: 'Students learning together' },\n  ];\n\n",
  ""
);

// Replace fallback logic with direct assignment
content = content.replace(
  "  const excellenceImgs = excellenceImages.length > 0 ? excellenceImages : fallbackImages;\n",
  "  const excellenceImgs = excellenceImages;\n"
);
content = content.replace(
  "  const innovationImgs = innovationImages.length > 0 ? innovationImages : fallbackImages;\n",
  "  const innovationImgs = innovationImages;\n"
);
content = content.replace(
  "  const teamworkImgs = teamworkImages.length > 0 ? teamworkImages : fallbackImages;\n",
  "  const teamworkImgs = teamworkImages;\n"
);
content = content.replace(
  "  const historyImgs = historyImages.length > 0 ? historyImages : fallbackImages;\n",
  "  const historyImgs = historyImages;\n"
);

fs.writeFileSync(path, content);
console.log('Done');