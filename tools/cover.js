// Обкладинка статті 1200×630 для шарингу: node tools/cover.js <slug> "<title>" "<number>" "<date_uk>"
const { chromium } = require('playwright');
const [slug, title, number, date] = process.argv.slice(2);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const photo = 'data:image/jpeg;base64,' + require('fs').readFileSync('/home/user/portfolio/assets/img/portrait-480.jpg').toString('base64');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1200, height: 630 } })).newPage();
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600&display=swap" rel="stylesheet">
  <style>html,body{margin:0}body{width:1200px;height:630px;background:#07090D;color:#F2F4F7;font-family:"Onest",system-ui,sans-serif;position:relative;overflow:hidden}
  .sky{position:absolute;inset:-20%;filter:blur(70px)}.sky i{position:absolute;border-radius:50%}
  .sky i:nth-child(1){width:700px;height:700px;right:-220px;top:-340px;background:radial-gradient(closest-side,rgba(79,124,255,.42),transparent 70%)}
  .sky i:nth-child(2){width:500px;height:500px;left:-160px;bottom:-220px;background:radial-gradient(closest-side,rgba(143,176,255,.16),transparent 70%)}
  .grid{position:absolute;left:0;right:0;bottom:0;height:40%;perspective:700px;perspective-origin:50% 0;-webkit-mask-image:linear-gradient(180deg,transparent,#000 45%,#000 80%,transparent);opacity:.5}
  .plane{position:absolute;left:-50%;right:-50%;top:0;height:200%;transform-origin:50% 0;transform:rotateX(68deg);background-image:linear-gradient(rgba(143,176,255,.28) 1px,transparent 1px),linear-gradient(90deg,rgba(143,176,255,.22) 1px,transparent 1px);background-size:100% 64px,64px 100%}
  .wrap{position:absolute;inset:0;padding:64px 72px;display:grid;align-content:space-between}
  .top{font-size:20px;font-weight:500;color:#8FB0FF;letter-spacing:.08em;text-transform:uppercase;display:flex;align-items:center;gap:12px}.top i{width:10px;height:10px;border-radius:50%;background:#4F7CFF}
  h1{font-weight:500;font-size:64px;line-height:1.02;letter-spacing:-.035em;margin:0;max-width:980px}
  .by{display:flex;align-items:center;gap:16px;font-size:22px;color:#A9B1BE}.by img{width:52px;height:52px;border-radius:50%;object-fit:cover;border:1px solid #2C3441}.by b{color:#F2F4F7;font-weight:600}
  </style></head><body><div class="sky"><i></i><i></i></div><div class="grid"><div class="plane"></div></div>
  <div class="wrap"><div class="top"><i></i>Сигнал · №${esc(number)} · ${esc(date)}</div><h1>${esc(title)}</h1>
  <div class="by"><img src="${photo}"><div><b>Олександр Бенца</b> · alexbentsa.com/signal</div></div></div></body></html>`);
  await p.waitForTimeout(900);
  await p.screenshot({ path: `/home/user/portfolio/signal/img/${slug}.png` });
  await b.close();
})();
