const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const out = path.join(__dirname, '..', 'src', 'app', 'globals.css');
const files = [
  'temp_css1.css',
  'temp_css2.css',
  'temp_css3.css',
  'temp_contact_css.css',
  'temp_catalog_css.css',
  'temp_product_css.css',
];

const utilities = `
.min-h-screen { min-height: 100vh; }
.mx-auto { margin-left: auto; margin-right: auto; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-6 { margin-top: 1.5rem; }
.py-20 { padding-top: 5rem; padding-bottom: 5rem; }
.list-disc { list-style: disc; }
.pl-5 { padding-left: 1.25rem; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.group { position: relative; }
@media (min-width: 768px) {
  .md\\:mx-0 { margin-left: 0; margin-right: 0; }
}
`;

let css = '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");\n';
for (const file of files) {
  const p = path.join(root, file);
  if (fs.existsSync(p)) {
    css += '\n/* ' + file + ' */\n' + fs.readFileSync(p, 'utf8') + '\n';
  }
}
css += utilities;
fs.writeFileSync(out, css);
console.log('globals.css written');
