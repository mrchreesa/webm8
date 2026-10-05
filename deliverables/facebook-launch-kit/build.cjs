const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const sharp = require('sharp');
const root = path.resolve(__dirname, '../..');
const out = __dirname;
const source = path.join(out, 'editable-source');
fs.mkdirSync(source, { recursive: true });
const mascot = `data:image/png;base64,${fs.readFileSync(path.join(root,'public/mascot.png')).toString('base64')}`;
const font = `data:font/woff2;base64,${fs.readFileSync(path.join(root,'.next/static/media/22a5144ee8d83bca-s.p.woff2')).toString('base64')}`;
const C = {navy:'#0e2f56',deep:'#071a33',cream:'#f8f5f0',lime:'#d4ff35',orange:'#f4681f',muted:'#9db4cd'};
const base = `@font-face{font-family:Geist;src:url('${font}');font-weight:100 900}*{box-sizing:border-box}html,body{margin:0}body{font-family:Geist,Arial,sans-serif;color:${C.cream};background:${C.navy}}.art{position:relative;overflow:hidden}.wordmark{display:flex;align-items:center;gap:.12em;font-size:52px;font-weight:900;letter-spacing:-.065em;line-height:1}.wordmark span{display:inline-block;padding:.22em .27em;background:${C.lime};color:${C.deep};border-radius:.19em;font-size:.72em;letter-spacing:-.04em}.mascot{object-fit:contain}.eyebrow{text-transform:uppercase;letter-spacing:.16em;font-size:19px;font-weight:600}.muted{color:${C.muted}}h1,h2,p{margin:0}h1,h2{font-weight:750;letter-spacing:-.045em;line-height:1.04}.ring{position:absolute;border:1.5px solid #9db4cd22;border-radius:50%;pointer-events:none}.rule{height:5px;width:64px;border-radius:8px;background:${C.orange}}.footer{position:absolute;bottom:62px;left:72px;right:72px;display:flex;align-items:center;justify-content:space-between;font-size:22px}.arrow{font-size:38px}.button{display:inline-flex;align-items:center;gap:35px;background:#c8500f;color:white;border-radius:14px;padding:22px 30px;font-size:27px;font-weight:650}.check{display:flex;align-items:center;justify-content:center;flex:none;width:46px;height:46px;background:${C.lime};color:${C.deep};border-radius:50%;font-size:25px;font-weight:700}.brandhead{position:absolute;top:62px;left:72px;right:72px;display:flex;align-items:center;justify-content:space-between}.brandhead .mascot{width:88px;height:88px}.brandlock{display:flex;gap:8px;align-items:center}`;
const logo = () => `<div class="wordmark">Web<span>M8</span></div>`;
const octo = (style='') => `<img class="mascot" src="${mascot}" style="${style}" alt="WebM8 blue octopus mascot">`;
const header = (dark=true) => `<div class="brandhead"><div class="brandlock">${octo()}${logo()}</div><span class="eyebrow" style="color:${dark?C.muted:'#5b6b7e'}">Built for local.</span></div>`;
const rings = () => `<i class="ring" style="width:1100px;height:1100px;right:-450px;top:-300px"></i><i class="ring" style="width:870px;height:870px;right:-335px;top:-185px"></i>`;
const footer = (label='webm8agency.com') => `<div class="footer"><span>${label}</span><span class="arrow">↗</span></div>`;
const jobs = [];
function add(name,w,h,body,css='') {
  const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} — WebM8</title><style>${base}${css}</style><body><main class="art" style="width:${w}px;height:${h}px">${body}</main></body></html>`;
  fs.writeFileSync(path.join(source,`${name}.html`),html);
  jobs.push({name,w,h});
}
add('01-profile-cream',1080,1080,octo('position:absolute;width:1000px;height:1000px;left:40px;top:20px'),`body{background:${C.cream}}`);
add('01-profile-navy-alternative',1080,1080,octo('position:absolute;width:1000px;height:1000px;left:40px;top:20px'));
for(const [name,h] of [['02-cover',924],['02-cover-wide-alternative',624]]) {
 const y=(h-440)/2;
 add(name,1640,h,`${rings()}<div style="position:absolute;left:0;top:0;width:14px;height:100%;background:${C.lime}"></div><div style="position:absolute;left:270px;top:${y+36}px;width:340px;height:340px;border-radius:50%;background:${C.cream}">${octo('position:absolute;inset:0;width:340px;height:340px')}</div><section style="position:absolute;left:660px;top:${y}px">${logo()}<h1 style="font-size:76px;margin-top:34px">More calls.<br>More bookings.</h1><svg width="456" height="16" viewBox="0 0 456 16" style="display:block;margin-top:3px"><path d="M3 11 Q230 1 453 10" fill="none" stroke="${C.orange}" stroke-width="6" stroke-linecap="round"/></svg><p style="font-size:29px;margin-top:20px;color:${C.muted}">Websites for local businesses.</p><p style="font-size:25px;margin-top:30px">webm8agency.com</p></section>`);
}
add('03-post-welcome',1080,1080,`${rings()}${header()}<div style="position:absolute;left:72px;top:247px"><div class="eyebrow muted">Your next customer starts here.</div><h1 style="font-size:91px;margin-top:31px">Local business.<br>Big first<br>impression.</h1><div class="rule" style="margin-top:37px"></div><p style="font-size:30px;line-height:1.45;margin-top:28px;color:${C.muted}">Websites built to turn<br>interest into enquiries.</p></div>${octo('position:absolute;width:420px;height:420px;right:16px;bottom:114px')}${footer()}`);
add('04-post-services',1080,1080,`${header(false)}<section style="position:absolute;left:72px;right:72px;top:248px"><h1 style="font-size:78px">Your website.<br>Handled.</h1><div class="rule" style="margin-top:30px"></div><div style="margin-top:40px;display:grid;gap:0">${[['01','Professional design','Clear, easy to use, built for phones.'],['02','Easy ways to get in touch','Simple forms and tap-to-call buttons.'],['03','Hosting & ongoing care','Support to keep your website working.']].map(([n,t,d])=>`<div style="display:flex;gap:28px;align-items:center;padding:27px 0;border-bottom:1px solid #ddd6ca"><span style="font-size:22px;color:#5b6b7e">${n}</span><div><h2 style="font-size:34px;letter-spacing:-.025em">${t}</h2><p style="font-size:24px;color:#5b6b7e;margin-top:9px">${d}</p></div></div>`).join('')}</div></section>${footer()}`,`body{background:${C.cream};color:${C.navy}}`);
add('05-post-free-review',1080,1080,`${rings()}${header()}<section style="position:absolute;left:72px;right:72px;top:246px"><div class="eyebrow" style="color:${C.lime}">A fresh pair of eyes.</div><h1 style="font-size:87px;margin-top:28px">Is your website<br>making it easy<br>to choose you?</h1><div style="margin-top:46px;display:grid;gap:18px">${['Mobile experience','Page speed','Clear ways to contact you'].map(t=>`<div style="display:flex;align-items:center;gap:18px;font-size:29px"><span class="check">✓</span>${t}</div>`).join('')}</div><div class="button" style="margin-top:44px">Get a free website review <span>↗</span></div></section>${footer('webm8agency.com/audit')}`);
add('06-story-free-review',1080,1920,`${rings()}<div style="position:absolute;left:90px;right:90px;top:270px;display:flex;justify-content:space-between;align-items:center">${logo()}<div class="eyebrow muted">Websites for local businesses</div></div><section style="position:absolute;left:90px;right:90px;top:465px"><div class="eyebrow" style="color:${C.lime}">Let’s take a look.</div><h1 style="font-size:108px;margin-top:40px">Your website<br>could work<br>harder.</h1><div class="rule" style="margin-top:43px"></div><p style="font-size:36px;line-height:1.4;color:${C.muted};margin-top:38px">Get clear ideas to help more<br>visitors call, book, or get in touch.</p></section>${octo('position:absolute;width:450px;height:450px;left:315px;top:1010px')}<div style="position:absolute;left:90px;right:90px;top:1495px;text-align:center"><div class="button" style="font-size:34px">Get a free website review <span>↗</span></div><p style="font-size:27px;margin-top:26px">webm8agency.com/audit</p></div>`);

async function main(){
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const page=await browser.newPage({deviceScaleFactor:1});
 const report=[];
 for (const job of jobs){
  await page.setViewportSize({width:job.w,height:job.h});
  await page.goto(pathToFileURL(path.join(source,`${job.name}.html`)).href);
  await page.evaluate(async()=>{await document.fonts.load('750 32px Geist');await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const check=await page.evaluate(()=>({font:document.fonts.check('750 32px Geist'),overflow:document.documentElement.scrollWidth>innerWidth,images:[...document.images].every(i=>i.naturalWidth>0)}));
  if(!check.font||check.overflow||!check.images)throw Error(`${job.name}: ${JSON.stringify(check)}`);
  await page.screenshot({path:path.join(out,`${job.name}.png`)});
  const meta=await sharp(path.join(out,`${job.name}.png`)).metadata();
  report.push({file:`${job.name}.png`,width:meta.width,height:meta.height,...check});
 }
 await browser.close();
 const circle=Buffer.from('<svg width="1080" height="1080"><circle cx="540" cy="540" r="540" fill="white"/></svg>');
 const circular=await sharp(path.join(out,'01-profile-cream.png')).composite([{input:circle,blend:'dest-in'}]).png().toBuffer();
 await sharp(circular).resize(320,320).png().toFile(path.join(out,'profile-circle-preview.png'));
 await sharp(path.join(out,'02-cover.png')).extract({left:0,top:120,width:1640,height:683}).resize(984,410).png().toFile(path.join(out,'cover-mobile-crop-preview.png'));
 const thumbs=await Promise.all(jobs.map(j=>sharp(path.join(out,`${j.name}.png`)).resize(480,480,{fit:'contain',background:C.cream}).png().toBuffer()));
 await sharp({create:{width:1920,height:960,channels:3,background:C.cream}}).composite(thumbs.map((input,i)=>({input,left:(i%4)*480,top:Math.floor(i/4)*480}))).png().toFile(path.join(out,'package-preview.png'));
 fs.writeFileSync(path.join(out,'export-checks.json'),JSON.stringify(report,null,2));
 const cards=jobs.map(j=>`<article><a href="${j.name}.png" download><img src="${j.name}.png" alt="${j.name}"></a><h2>${j.name.replace(/^\d+-/,'').replaceAll('-',' ')}</h2><p>${j.w} × ${j.h} px · PNG</p><a href="${j.name}.png" download>Download image ↓</a></article>`).join('');
 fs.writeFileSync(path.join(out,'OPEN-ME.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WebM8 · Facebook launch kit</title><style>body{margin:0;padding:50px 6%;font:17px/1.6 system-ui;background:#f8f5f0;color:#0e2f56}h1{font-size:44px;letter-spacing:-2px;line-height:1.1}a{color:#0e2f56;font-weight:650}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:28px;margin-top:36px}article{background:white;border:1px solid #ddd6ca;border-radius:18px;padding:20px}article img{display:block;width:100%;height:260px;object-fit:contain;background:#efeae1;border-radius:10px}h2{font-size:23px;text-transform:capitalize;margin-bottom:0}article p{margin:4px 0 18px}header{max-width:800px}section{margin-top:44px}code{background:#efeae1;padding:3px 6px}</style><header><p>WEBM8 / SOCIAL LAUNCH KIT</p><h1>Ready for your first impression.</h1><p>Your website’s original octopus, Geist typography, navy and warm cream palette, orange accents, and lime M8 badge.</p><p>Start with <b>01-profile-cream.png</b> and <b>02-cover.png</b>. Check Facebook’s crop preview before saving. A wide cover alternative is included if your Page uses a shallower frame.</p><a href="PAGE-COPY.txt">Open copy-ready page details and captions →</a> &nbsp; <a href="START-HERE.txt">Read the setup guide →</a></header><main>${cards}</main><section><h2>Crop previews</h2><p>Illustrations of a circular profile crop and a centered 2.4:1 cover crop; actual Facebook layouts may vary.</p><img src="profile-circle-preview.png" width="160" alt="Circle crop preview"><img src="cover-mobile-crop-preview.png" style="display:block;width:min(100%,820px);margin-top:24px" alt="Centered mobile cover crop preview"></section></html>`);
 console.log(JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(e);process.exit(1)});
