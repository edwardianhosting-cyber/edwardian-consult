const fs = require('fs');
const path = 'C:/Users/USER/Desktop/edwardian-consult-main/frontend/src/app/about/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const startIdx = content.indexOf('  let storyImages:');
const endIdx = content.indexOf('  return (');
const oldBlock = content.substring(startIdx, endIdx);

const newBlock = `  let excellenceImages = [];
  let innovationImages = [];
  let teamworkImages = [];
  let historyImages = [];

  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

  function readImages(folder, urlPrefix) {
    try {
      const dir = join(process.cwd(), 'public', 'images', folder);
      const files = readdirSync(dir);
      return files
        .filter((file) => imageExtensions.some((ext) => file.toLowerCase().endsWith(ext)))
        .map((file) => ({
          src: urlPrefix + file,
          alt: file.replace(/\\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        }));
    } catch (e) {
      return [];
    }
  }

  excellenceImages = readImages('excellence', '/images/excellence/');
  innovationImages = readImages('innovation', '/images/innovation/');
  teamworkImages = readImages('teamwork', '/images/teamwork/');
  historyImages = readImages('history', '/images/history/');

`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync(path, content);
console.log('Done');
"