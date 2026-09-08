const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
async function build() {
  const dist = path.join(root, 'dist');
  await fs.rm(dist, {recursive: true, force: true});
  await fs.mkdir(dist, {recursive: true});
  await fs.cp(path.join(root, 'assets'), path.join(dist, 'assets'), {recursive: true});
  const partners = JSON.parse(await fs.readFile(path.join(root, 'data/partners.json'), 'utf8'));
  async function copyPage(relative) {
    let html = await fs.readFile(path.join(root, relative), 'utf8');
    const lang = relative.startsWith('fr/') ? 'fr' : relative.startsWith('zh/') ? 'zh' : 'en';
    const title = {en:'Related Links',fr:'Liens utiles',zh:'相关链接'}[lang];
    const sidebar = `<aside class="partner-sidebar" aria-label="${title}"><h2>${title}</h2><ul>${partners.map(p => `<li><a href="${p.url}"><img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async"></a></li>`).join('')}</ul></aside>`;
    if (html.includes('<main') && !relative.includes('thank-you')) {
      html = html.replace(/(<main\b[^>]*>)/, '$1<div class="restored-layout"><div class="restored-primary">');
      html = html.replace('</main>', `</div>${sidebar}</div></main>`);
    }
    html = html.replace('</head>', '<link rel="stylesheet" href="/assets/css/restoration.css"></head>');
    const destination = path.join(dist, relative);
    await fs.mkdir(path.dirname(destination), {recursive: true});
    await fs.writeFile(destination, html);
  }
  async function pages(dir) {
    for (const e of await fs.readdir(path.join(root, dir), {withFileTypes:true})) {
      const rel = path.join(dir, e.name);
      if (e.isDirectory()) await pages(rel);
      else if (e.name.endsWith('.html')) await copyPage(rel);
    }
  }
  await copyPage('index.html');
  for (const lang of ['en','fr','zh']) await pages(lang);
  let error = await fs.readFile(path.join(root, '404.html'), 'utf8');
  await fs.writeFile(path.join(dist, '404.html'), error.replaceAll('/innoledge/', '/').replace(/[ \t]+$/gm, ''));
  await fs.writeFile(path.join(dist, 'robots.txt'), 'User-agent: *\nAllow: /\n');
  console.log('Built cleaned site with partner sidebar in dist/');
}
if (require.main === module) build().catch(e => { console.error(e); process.exitCode = 1; });
module.exports = {build};
