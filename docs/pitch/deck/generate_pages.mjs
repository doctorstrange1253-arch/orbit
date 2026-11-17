import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { Script } from 'node:vm';

const deckDir = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(resolve(deckDir, 'deck-data.json'), 'utf8'));
const e = data.economics;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const money = value => `Rs ${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const rupees = value => `Rs ${Number(value).toLocaleString('en-IN')}`;
const pct = value => `${Math.round(value * 100)}%`;
const sourceNumbers = new Map(data.sources.map((source, index) => [source.id, index + 1]));
const sourceNames = { PRODUCT: 'Project source (2026); prototype only', FOUNDER: 'Founder report (2026); unvalidated', FORM: 'Organizer brief (2026)', RZP: 'Razorpay pricing (2026)', CF: 'Cloudflare Stream pricing (2026)', JORDAN: 'Jordan (2015); historical, non-India' };
const warnings = new Set();
assert.equal(data.slides.length, 14, 'The locked deck must contain exactly 14 slides.');
assert.equal(data.funding.length, 7, 'All seven funding rows must be retained.');
assert.ok(existsSync(resolve(deckDir, 'base.css')), 'base.css is required.');
for (const [index, slide] of data.slides.entries()) {
  assert.equal(slide.number, index + 1, 'Slide order must be 01 through 14.');
  assert.ok(slide.headline && Array.isArray(slide.body) && slide.notes, 'Locked slide content is incomplete.');
  for (const id of slide.sources) assert.ok(sourceNumbers.has(id), `Unknown source ${id}.`);
}
const storageBlocks = Math.ceil(e.stored_minutes / 1000);
const storage = storageBlocks * e.video_storage_usd_per_1000_minutes * e.fx_inr_usd / e.allocation_students;
function subscription(price, watch, ai, support) {
  const net = price / (1 + e.gst_scenario);
  const platform = net * e.platform_share;
  const gateway = price * e.gateway_rate * (1 + e.gateway_tax);
  const delivery = watch / 1000 * e.video_delivery_usd_per_1000_minutes * e.fx_inr_usd;
  const cost = gateway + delivery + storage + ai + support;
  return { price, net, platform, mentor: net * e.mentor_share, gateway, delivery, storage, ai, support, cost, cm: platform - cost };
}
const core = subscription(e.core_price, e.core_watch_minutes, e.core_ai, e.core_support);
const higher = subscription(e.higher_price, e.higher_watch_minutes, e.higher_ai, e.higher_support);
const session = { price: e.session_price, net: e.session_price / (1 + e.gst_scenario), platform: e.session_price / (1 + e.gst_scenario) * e.session_fee, gateway: e.session_price * e.gateway_rate * (1 + e.gateway_tax), rtc: e.session_rtc, support: e.session_support };
session.cost = session.gateway + session.rtc + session.support;
session.cm = session.platform - session.cost;
const weightedCM = core.cm * e.core_mix + higher.cm * (1 - e.core_mix);
const model = { core, higher, session, storageBlocks, storage, weightedCM, breakEven: weightedCM > 0 ? Math.ceil(e.fixed_monthly / weightedCM) : null, status: 'ESTIMATE scenario, not actual costs or a forecast' };
assert.ok(Object.values(core).every(Number.isFinite), 'Economics inputs must yield finite values.');
assert.ok(Math.abs(e.platform_share + e.mentor_share - 1) < 1e-9, 'Subscription split must sum to one.');

const css = `
:root{--fs-title:88px;--fs-body:48px;--fs-caption:32px}
html,body{width:1920px;height:1080px}body{font-size:48px}.slide{padding:76px 96px 90px;overflow:visible}
.kicker{font-size:32px;line-height:1.25;letter-spacing:0;text-transform:none}.slide h1.slide-title{font:400 88px/1.1 var(--font-serif);letter-spacing:-1.2px;max-width:1710px;margin:28px 0 0;text-wrap:pretty}
.slide-body{top:360px;bottom:195px;gap:48px;justify-content:stretch}.stage{width:100%;height:100%;min-height:0;min-width:0;display:grid;gap:24px}
p{font-size:48px;line-height:1.24;margin:0}h2,h3{font-family:var(--font-sans);font-size:48px;line-height:1.2;margin:0;font-weight:700}
.caption,.small,.tag,.note-strip,.aux{font-size:32px;line-height:1.25}.caption,.aux{color:var(--muted)}.fill{color:var(--warm)}.estimate{color:var(--warm)}.muted{color:var(--muted)}
.slide-footer{bottom:36px;padding-top:16px;align-items:start;font-size:32px;line-height:1.22}.footer-copy{max-width:1600px;display:grid;gap:7px}.cite-line{font-size:32px;line-height:1.22}.cite-line a{color:var(--muted);text-decoration:none}.page-no{font-size:32px;white-space:nowrap}
.band{background:var(--tint);padding:24px 28px}.line{border-top:2px solid var(--line);padding-top:24px}.native-table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:48px;line-height:1.15;font-variant-numeric:tabular-nums}
.native-table th,.native-table td{padding:12px 16px;text-align:left;border-bottom:2px solid var(--line);vertical-align:top}.native-table th{font-size:48px;font-weight:700;background:var(--tint)}.native-table .number{text-align:right;white-space:nowrap}.native-table .formula{display:block;font-size:32px;line-height:1.22;color:var(--muted);margin-top:8px}
.figure{margin:0;width:100%;height:100%;max-width:100%;max-height:100%;min-width:0;min-height:0;display:grid;grid-template-rows:minmax(0,1fr) auto;gap:16px}.figure figcaption{position:static;min-width:0;background:var(--paper);color:var(--ink);padding-top:8px}.image-slot{width:100%;height:100%;max-width:100%;max-height:100%;min-width:0;min-height:0;display:flex;align-items:center;justify-content:center;background:var(--tint);border:2px solid var(--line)}
.product-image{display:block;min-width:0;min-height:0;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;object-position:50% 50%}img{min-width:0;max-width:100%}.missing-screen{width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:24px;padding:48px;background:var(--tint);border:2px solid var(--line)}.missing-screen p{font-size:48px;line-height:1.15;color:var(--warm)}
.slide--cover{padding:76px 96px}.cover-stage{height:928px;display:grid;grid-template-columns:minmax(0,820px) minmax(0,1fr);gap:72px;align-items:center}.cover-copy{min-width:0;padding:0;display:grid;gap:30px}.cover-brand{font:700 48px/1.15 var(--font-sans);letter-spacing:0}.slide--cover h1.slide-title{font-size:96px;line-height:1.06;max-width:820px;margin:0}.cover-meta{display:grid;gap:16px;margin-top:16px}.cover-figure{height:640px}.cover-citation{font-size:32px;line-height:1.22;color:var(--muted)}
.problem-stage{grid-template-rows:auto 1fr auto}.problem-comparison{display:grid;grid-template-columns:1fr 1.05fr;gap:72px;align-items:center}.problem-side{display:grid;gap:24px}.problem-side:last-child{border-left:2px solid var(--line);padding-left:56px}.problem-friction{display:grid;gap:20px;font-size:48px}.problem-outcome{font:400 60px/1.12 var(--font-serif)}
.discovery-stage{grid-template-rows:1fr 1.08fr auto}.discovery-counts{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center}.proof-slot{border-bottom:2px solid var(--line);padding:30px 0}.proof-slot p{font-size:48px;max-width:700px}.quote-slot{background:var(--tint);padding:40px 48px;display:flex;align-items:center}.quote-slot p{font:400 60px/1.15 var(--font-serif)}
.loop-stage{grid-template-rows:1fr 60px auto}.process-loop{display:flex;gap:40px;align-items:center}.process-step{flex:1;min-width:0;position:relative;border-top:4px solid var(--primary);padding:30px 20px 26px 0;display:grid;gap:24px}.process-step:not(:last-child):after{content:'';position:absolute;right:-24px;top:102px;border-left:16px solid var(--primary);border-top:10px solid transparent;border-bottom:10px solid transparent}.process-number{font:400 72px/1 var(--font-serif);color:var(--ink)}.loop-return{margin:0 90px;border-bottom:2px solid var(--primary);border-left:2px solid var(--primary);border-right:2px solid var(--primary);position:relative}.loop-return:before{content:'';position:absolute;left:-11px;top:-10px;border-bottom:14px solid var(--primary);border-left:10px solid transparent;border-right:10px solid transparent}
.product-stage{grid-template-columns:minmax(0,420px) minmax(0,1fr);grid-template-rows:minmax(0,1fr);gap:64px}.product-stage .figure{height:525px;max-height:100%}.path-list{display:flex;flex-direction:column;justify-content:space-between;gap:22px}.path-item{padding:20px 0;border-top:2px solid var(--line)}.path-item p{font-size:48px}
.progress-stage{grid-template-columns:minmax(0,690px) minmax(0,1fr);grid-template-rows:minmax(0,1fr);gap:56px}.progress-stage .figure{height:525px;max-height:100%}.progress-copy{display:grid;grid-template-rows:1fr 1fr auto;gap:24px}.progress-status{display:grid;gap:20px;align-content:center}.progress-status p{font-size:48px}.unproven{padding:22px 24px;background:var(--tint)}
.market-stage{grid-template-rows:minmax(0,1fr) auto;gap:40px}.market-main{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.95fr) minmax(0,1fr);gap:56px;align-items:center}.market-population{display:grid;gap:28px}.market-equation{padding:12px 28px;border-left:2px solid var(--line);border-right:2px solid var(--line);display:grid;gap:16px}.market-equation p{font-size:48px}.market-target{display:grid;gap:18px}.target-number{display:block;font:700 120px/1 var(--font-sans);margin-bottom:26px;color:var(--ink)}
.economics-stage{grid-template-columns:680px minmax(0,1fr);gap:64px}.economics-left{display:grid;align-content:space-between;gap:24px}.split-figures{display:flex;gap:48px;padding-bottom:24px;border-bottom:2px solid var(--line)}.split-figure{font:700 76px/1 var(--font-sans)}.split-caption{display:block;font-size:32px;color:var(--muted);margin-top:12px}.session-figure{display:flex;align-items:center;gap:24px}.session-figure strong{font-size:68px;line-height:1}.economics-right{display:grid;grid-template-rows:auto minmax(0,1fr) auto;gap:8px}.economics-table td{padding:5px 14px}.cm-row{background:var(--tint);font-weight:700}.cm-row td{font-size:48px}.scenario-heading{font-size:32px;line-height:1.2;color:var(--warm)}
.timeline-stage{grid-template-rows:1fr auto}.timeline{display:grid;grid-template-columns:1fr 1fr 1fr;gap:56px;align-items:stretch}.phase{border-top:4px solid var(--primary);padding-top:30px;display:flex;flex-direction:column;justify-content:space-between;gap:28px}.phase-days{display:block;font:400 60px/1.1 var(--font-serif);margin-bottom:32px}.phase p{font-size:48px;line-height:1.24}.phase .aux{font-size:32px;line-height:1.25}.timeline-channels{font-size:32px;line-height:1.25;padding:20px 24px;background:var(--tint)}
.slide--team .slide-body{bottom:160px}.team-stage{grid-template-rows:minmax(0,1fr) auto;gap:16px;padding-bottom:32px}.team-table th{padding:12px 24px}.team-table td{padding:12px 24px;vertical-align:middle}.team-table th:first-child{width:32%}.team-table td p{font-size:48px}
.funding-stage{grid-template-columns:1100px minmax(0,1fr);grid-template-rows:1fr;gap:48px}.funding-chart{width:1100px;height:525px}.funding-ladder{display:flex;flex-direction:column;gap:24px;align-items:stretch;justify-content:space-between}.funding-ladder>div{min-width:0;border-top:2px solid var(--line);padding-top:16px}.funding-ladder p{font-size:48px;line-height:1.2}.funding-table-toggle{font:400 32px var(--font-sans);color:var(--muted);background:transparent;border:0;padding:0;text-decoration:underline;cursor:pointer}.funding-table-toggle:focus-visible{outline:3px solid var(--primary);outline-offset:5px}.funding-data{position:absolute;inset:0;background:var(--paper);z-index:2;overflow:auto;border:2px solid var(--line);padding:20px}.funding-data[hidden]{display:none}.funding-data .native-table{width:2200px}.funding-data .native-table th:first-child{width:430px}.funding-data .native-table th:nth-child(2){width:220px}.funding-data .native-table th:nth-child(3){width:160px}.funding-data .native-table td{font-size:48px}.funding-fallback{width:100%;height:525px;display:grid;gap:12px}.funding-fallback .native-table td,.funding-fallback .native-table th{padding:5px 16px;font-size:48px}
.model-stage{grid-template-rows:auto auto auto;align-content:start;gap:0}.model-intro{display:flex;flex-wrap:wrap;gap:8px 40px;margin-bottom:24px}.model-intro p{font-size:48px;line-height:1.18}.model-table th:first-child{width:31%}.model-table th:nth-child(2){width:23%}.model-table th:nth-child(3){width:23%}.model-table th:nth-child(4){width:23%}.model-table td,.model-table th{padding:10px 16px}.model-footer{font-size:32px;line-height:1.2;margin-top:40px}
.method-stage{grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);grid-template-rows:minmax(0,1fr);gap:72px}.method-left{min-width:0;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr);gap:16px}.method-table th:first-child{width:65%}.method-table th,.method-table td{padding:8px 16px}.evidence-ladder{min-width:0;min-height:0;display:flex;flex-direction:column;justify-content:space-between;gap:16px}.evidence-rung{border-top:2px solid var(--line);padding-top:16px;display:grid;gap:12px}.evidence-rung h2{font-size:48px}.evidence-rung .caption{font-size:32px}.method-fill{font-size:48px}
.risk-stage{grid-template-rows:minmax(0,1fr) auto;gap:16px}.risk-table th:first-child{width:65%}.risk-table th:nth-child(2){width:20%}.risk-table th:nth-child(3){width:15%}.risk-table th,.risk-table td{padding:8px 16px;vertical-align:middle}.risk-table td p{font-size:48px}.risk-table td:nth-child(2){font-size:48px;line-height:1.15}.risk-comparison{font-size:32px;line-height:1.2;padding:12px 24px;background:var(--tint)}
@media print{html,body{width:1920px;height:1080px}.slide{page-break-after:always;-webkit-print-color-adjust:exact;print-color-adjust:exact}.funding-table-toggle{display:none}}
.stage>*{min-width:0;min-height:0}.slide--product .slide-body,.slide--progress .slide-body{top:370px}.product-stage .figure,.progress-stage .figure{height:515px}.slide--method .slide-body,.slide--risks .slide-body{bottom:205px}.slide--model-detail .slide-body{top:280px;bottom:180px}.slide--economics .slide-body{bottom:170px}
`;

function bodyText(slide, index, cls = '') {
  return `<p class="${esc(cls)}" data-source-body="${index}">${esc(slide.body[index])}</p>`;
}
function citations(slide) {
  return slide.sources.map(id => {
    const source = data.sources.find(item => item.id === id);
    const label = `[${sourceNumbers.get(id)}] ${sourceNames[id] ?? source.source}`;
    return source.url ? `<a href="${esc(source.url)}" rel="noreferrer">${esc(label)}</a>` : `<span>${esc(label)}</span>`;
  }).join(' &nbsp; ');
}
function figure(slide, cls = '', label = 'Historical prototype capture; test data') {
  const target = slide.image && resolve(deckDir, slide.image);
  const inDeck = target && !relative(deckDir, target).split(sep).includes('..');
  let dimensions = null;
  if (target && inDeck && existsSync(target)) {
    const bytes = readFileSync(target);
    if (bytes.length > 24 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) dimensions = { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  if (!dimensions) {
    if (slide.image) warnings.add(`Missing or invalid image: ${target}`);
    const slot = slide.image?.includes('recorder') ? 'recorder screen' : 'learning-journey screen';
    return `<figure class="figure ${esc(cls)}"><div class="missing-screen" role="img" aria-label="Missing ${esc(slot)}"><p>[FILL: ${esc(slot)}]</p><span class="caption">Real product capture required. No simulated interface.</span></div><figcaption class="caption">${esc(slide.footnote)} ${citations(slide)}</figcaption></figure>`;
  }
  return `<figure class="figure ${esc(cls)}"><div class="image-slot"><img class="product-image" src="../${esc(slide.image)}" width="${dimensions.width}" height="${dimensions.height}" style="min-width:0;width:100%;height:100%;max-width:100%;max-height:100%" alt="${esc(label)}"></div><figcaption class="caption">${esc(label)}.</figcaption></figure>`;
}
const layouts = {};
layouts.cover = s => `<div class="cover-stage"><div class="cover-copy">${bodyText(s, 0, 'cover-brand')}<h1 class="slide-title">${esc(s.headline)}</h1>${bodyText(s, 1)}<div class="cover-meta">${bodyText(s, 2, 'fill')}${bodyText(s, 3)}</div></div>${figure(s, 'cover-figure')}</div><div class="cover-citation">${esc(s.footnote)} ${citations(s)}</div>`;
layouts.problem = s => `<div class="stage problem-stage">${bodyText(s, 0)}<div class="problem-comparison"><div class="problem-side"><h2 class="muted">Current friction</h2>${bodyText(s, 1, 'problem-friction')}</div><div class="problem-side"><h2 class="muted">Desired outcome</h2><p class="problem-outcome">One practical skill with mentor feedback.</p></div></div><div class="band">${bodyText(s, 2, 'fill')}</div></div>`;
layouts.discovery = s => `<div class="stage discovery-stage"><div class="discovery-counts"><div class="proof-slot">${bodyText(s, 0, 'fill')}</div><div class="proof-slot">${bodyText(s, 1, 'fill')}</div></div><div class="quote-slot">${bodyText(s, 2, 'fill')}</div><div class="aux">ESTIMATE sprint targets: 50–100 adult responses, 8–15 mentor conversations; not results. [FILL: campus, date, sample method]</div></div>`;
layouts.loop = s => `<div class="stage loop-stage"><div class="process-loop">${s.body.map((text, index) => `<div class="process-step"><div class="process-number">${index + 1}</div>${bodyText(s, index)}</div>`).join('')}</div><div class="loop-return" aria-hidden="true"></div><div class="aux">Catalogs, free video and individual mentoring are credible alternatives. Advanced ranked mentor waves remain next.</div></div>`;
layouts.product = s => `<div class="stage product-stage"><div class="path-list">${s.body.map((text, index) => `<div class="path-item">${bodyText(s, index)}</div>`).join('')}<div class="aux fill">[FILL: request and mentor-response screens]</div></div>${figure(s)}</div>`;
layouts.progress = s => `<div class="stage progress-stage"><div class="progress-copy"><div class="progress-status">${bodyText(s, 0)}</div><div class="progress-status line">${bodyText(s, 1)}</div><div class="unproven">${bodyText(s, 2)}</div></div>${figure(s, '', 'Historical recorder idle preview; not a live demo')}</div>`;
layouts.market = s => `<div class="stage market-stage"><div class="market-main"><div class="market-population">${bodyText(s, 0)}${bodyText(s, 1, 'fill')}</div><div class="market-equation"><h2>Serviceable demand</h2><p>Population<br>× reach<br>× demonstrated need</p></div><div class="market-target"><p data-source-body="2">${esc(s.body[2]).replace(/^100 /, '<span class="target-number">100</span> ')}</p><span class="caption estimate">ESTIMATE target, not a forecast or current users</span></div></div><div class="aux">Reach + need: ESTIMATE. Mentor ICP: qualified seniors/practitioners with teachable proof and time for feedback. Commitments [FILL].</div></div>`;
layouts.economics = s => `<div class="stage economics-stage"><div class="economics-left">${bodyText(s, 0)}${bodyText(s, 1)}${bodyText(s, 2)}</div><div class="economics-right"><div class="scenario-heading">ESTIMATE Core scenario, per learner/month</div><table class="native-table economics-table" aria-label="Illustrative Core contribution margin"><tbody><tr><td>After-GST base</td><td class="number">${money(core.net)}</td></tr><tr><td>Platform share</td><td class="number">${money(core.platform)}</td></tr><tr><td>Gateway</td><td class="number">−${money(core.gateway)}</td></tr><tr><td>Video + storage</td><td class="number">−${money(core.delivery + core.storage)}</td></tr><tr><td>AI + support</td><td class="number">−${money(core.ai + core.support)}</td></tr><tr class="cm-row"><td>Core CM</td><td class="number">${money(core.cm)}</td></tr></tbody></table><div class="caption">ESTIMATE: ${model.breakEven} paying learners at ${pct(e.core_mix)} Core / ${pct(1 - e.core_mix)} Premium mix; ${rupees(e.fixed_monthly)} fixed monthly cost. Actual bills [FILL].</div></div></div>`;
layouts.timeline = s => `<div class="stage timeline-stage"><div class="timeline"><div class="phase"><div>${bodyText(s, 0)}</div><div class="aux">Days 1–14: discovery + mentor commitments.<br>Days 15–30: 30 activated learners.</div><div class="aux estimate">ESTIMATE targets<br>Owner [FILL]</div></div><div class="phase">${bodyText(s, 1)}<div class="aux">One request-to-launch cycle; paid milestones only after checkout readiness.</div><div class="aux estimate">ESTIMATE targets<br>Owner [FILL]</div></div><div class="phase">${bodyText(s, 2)}<div class="aux">Measure cohort retention.</div><div class="aux estimate">ESTIMATE targets<br>Owner [FILL]</div></div></div><div class="timeline-channels">Proposed channels: clubs, campus ambassadors, TBI mentor introductions and outreach.</div></div>`;
layouts.team = s => `<div class="stage team-stage"><table class="native-table team-table" aria-label="Team responsibilities and missing proof"><thead><tr><th>Responsibility</th><th>Owner + proof</th></tr></thead><tbody><tr><td>Integrated product</td><td>${bodyText(s, 0, 'fill')}</td></tr><tr><td>Mentors + course quality</td><td>${bodyText(s, 1, 'fill')}</td></tr><tr><td>Discovery + activation</td><td>${bodyText(s, 2, 'fill')}</td></tr></tbody></table><div class="aux">Project source does not establish an individual contribution. No credentials or advisors inferred.</div></div>`;
function fundingDataTable() {
  const heads = ['Category', 'INR allocation', 'Month', 'Buys', 'Milestone', 'Status'];
  return `<table class="native-table" aria-label="All source funding data"><thead><tr>${heads.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${data.funding.map(row => `<tr><td>${esc(row.category)}</td><td class="number">${rupees(row.amount)}</td><td>${esc(row.month)}</td><td>${esc(row.buys)}</td><td>${esc(row.milestone)}</td><td>${esc(row.status)}</td></tr>`).join('')}</tbody></table>`;
}
layouts.funding = s => `<div class="stage funding-stage"><div id="funding-chart" class="funding-chart" role="img" aria-label="Seven proposed funding allocations, all in INR; ESTIMATE, quotes pending"></div><div class="funding-ladder">${s.body.map((text, index) => `<div>${bodyText(s, index)}</div>`).join('')}<span class="caption">ESTIMATE: designated 3-month pilot budget; actual runway [FILL].</span></div><div class="funding-data" id="funding-data" hidden>${fundingDataTable()}</div></div>`;
layouts['model-detail'] = s => `<div class="stage model-stage"><div class="model-intro">${s.body.map((text, index) => bodyText(s, index)).join('')}</div><table class="native-table model-table" aria-label="Unit economics scenarios"><thead><tr><th>Scenario</th><th>Platform basis</th><th>Variable costs</th><th>Illustrative CM</th></tr></thead><tbody><tr><td>Core ${rupees(core.price)}</td><td>${money(core.platform)}</td><td>${money(core.cost)}</td><td class="number">${money(core.cm)}</td></tr><tr><td>Premium ${rupees(higher.price)}</td><td>${money(higher.platform)}</td><td>${money(higher.cost)}</td><td class="number">${money(higher.cm)}</td></tr><tr><td>Session ${rupees(session.price)}</td><td>${money(session.platform)}</td><td>${money(session.cost)}</td><td class="number">${money(session.cm)}</td></tr></tbody></table><div class="model-footer estimate">ESTIMATE: ${model.breakEven} paying learners at ${pct(e.core_mix)} Core / ${pct(1 - e.core_mix)} Premium mix; ${rupees(e.fixed_monthly)} fixed monthly cost. Actual bills [FILL].</div></div>`;
layouts.method = s => `<div class="stage method-stage"><div class="method-left">${bodyText(s, 0)}<table class="native-table method-table" aria-label="Primary discovery methodology fields"><thead><tr><th>Method field</th><th>Evidence</th></tr></thead><tbody><tr><td>n + population</td><td class="fill">[FILL]</td></tr><tr><td>How + sample</td><td class="fill">[FILL]</td></tr><tr><td>Campus + date</td><td class="fill">[FILL]</td></tr><tr><td>Quality + consent</td><td class="fill">[FILL]</td></tr></tbody></table></div><div class="evidence-ladder">${bodyText(s, 1)}${bodyText(s, 2, 'fill method-fill')}<div class="caption">Jordan (2015): historical non-India, course-level sample; not our results or causal proof.</div></div></div>`;
layouts.risks = s => `<div class="stage risk-stage"><table class="native-table risk-table" aria-label="Risks and release conditions"><thead><tr><th>Risk + test</th><th>Condition</th><th>Owner</th></tr></thead><tbody><tr><td>${bodyText(s, 0)}</td><td>Pilot proof</td><td class="fill">[FILL]</td></tr><tr><td>${bodyText(s, 1)}</td><td>Courses</td><td class="fill">[FILL]</td></tr><tr><td>${bodyText(s, 2)}</td><td>Commerce</td><td class="fill">[FILL]</td></tr><tr><td>${bodyText(s, 3)}</td><td>Review</td><td class="fill">[FILL]</td></tr></tbody></table><div class="risk-comparison">Release conditions: reviewed courses, recurring checkout/payout, paid-room prerequisites, AI correctness, privacy and refund authority. No validated moat, blanket compliance or learning-outcome claim.</div></div>`;

function fundingChartScript() {
  return `
const rows = payload.funding.map((row, index) => ({...row, originalIndex:index})).sort((a,b) => b.amount-a.amount || a.originalIndex-b.originalIndex);
const target = document.getElementById('funding-chart');
const color = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
if (window.echarts) {
  const chart = echarts.init(target, null, {renderer:'svg',width:1100,height:525});
  window.__charts = [chart];
  chart.setOption({animation:false,backgroundColor:color('--paper'),textStyle:{fontFamily:'Arial',fontSize:48,color:color('--ink')},aria:{enabled:true,decal:{show:false}},grid:{left:540,right:290,top:6,bottom:12,containLabel:false},tooltip:{trigger:'axis',axisPointer:{type:'shadow'},backgroundColor:color('--paper'),borderColor:color('--line'),textStyle:{fontFamily:'Arial',fontSize:32,color:color('--ink')},formatter:params => { const row=rows[params[0].dataIndex]; return row.category+'<br>Rs '+row.amount.toLocaleString('en-IN')+'<br>'+row.status; }},xAxis:{type:'value',min:0,max:Math.max(...rows.map(r=>r.amount)),show:false,axisLabel:{hideOverlap:true}},yAxis:{type:'category',inverse:true,data:rows.map(r=>r.category),axisTick:{show:false},axisLine:{show:false},axisLabel:{fontFamily:'Arial',fontSize:48,color:color('--ink'),margin:20,interval:0,hideOverlap:false}},series:[{name:'ESTIMATE allocation (INR)',type:'bar',barWidth:24,data:rows.map(r=>r.amount),itemStyle:{color:color('--primary'),borderRadius:[0,4,4,0]},label:{show:true,position:'right',distance:20,fontFamily:'Arial',fontSize:48,color:color('--ink'),formatter:p=>'Rs '+Number(p.value).toLocaleString('en-IN')},labelLayout:{hideOverlap:false},emphasis:{disabled:true}}]});
  window.__chartReady = true;
} else {
  window.__chartReady = false;
  window.__assetWarnings.push('Missing offline ECharts vendor; funding table shown instead.');
  target.innerHTML = '<div class="funding-fallback"><span class="caption fill">[FILL: offline ECharts vendor]; all allocation values retained</span><table class="native-table"><thead><tr><th>ESTIMATE use</th><th>INR</th></tr></thead><tbody>'+rows.map(row=>'<tr><td>'+row.category+'</td><td class="number">Rs '+row.amount.toLocaleString('en-IN')+'</td></tr>').join('')+'</tbody></table></div>';
}
const toggle = document.getElementById('funding-table-toggle');
const table = document.getElementById('funding-data');
toggle.addEventListener('click', () => { table.hidden=!table.hidden; toggle.setAttribute('aria-expanded',String(!table.hidden)); toggle.textContent=table.hidden?'View all seven source rows':'Close source table'; });
`;
}
function runtime(slide) {
  const payload = { slide, economics: e, computed: model, funding: data.funding, funding_ladder: data.funding_ladder, sources: data.sources, warnings: [...warnings] };
  return `<script type="application/json" id="deck-slide-data">${json(payload)}</script>${slide.layout === 'funding' ? '<script src="../assets/vendor/echarts.min.js"></script>' : ''}<script>
window.__ready=false;
window.__assetWarnings=[];
const payload=JSON.parse(document.getElementById('deck-slide-data').textContent);
window.__slideData=payload.slide;
window.__economics=payload.computed;
window.__fundingData=payload.funding;
(async()=>{
  await document.fonts.ready;
  await Promise.all(Array.from(document.images, image => new Promise(resolve => {
    const finish=async()=>{if(image.naturalWidth){try{await image.decode();}catch{}}else{window.__assetWarnings.push('Image failed: '+image.getAttribute('src'));}resolve();};
    if(image.complete)finish();else{image.addEventListener('load',finish,{once:true});image.addEventListener('error',finish,{once:true});}
  })));
  ${slide.layout === 'funding' ? fundingChartScript() : ''}
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  window.__ready=true;
})().catch(error=>{window.__renderError=String(error);console.error(error);});
</script>`;
}
function footer(slide) {
  const extra = slide.layout === 'funding' ? '<div class="cite-line estimate">ESTIMATE allocations; quotes [FILL]. <button type="button" class="funding-table-toggle" id="funding-table-toggle" aria-controls="funding-data" aria-expanded="false">View all seven source rows</button></div>' : '';
  return `<footer class="slide-footer"><div class="footer-copy">${extra}<div>${esc(slide.footnote)}</div><div class="cite-line">${citations(slide)}</div></div><span class="page-no">${String(slide.number).padStart(2,'0')} / 14</span></footer>`;
}
function page(slide) {
  assert.ok(layouts[slide.layout], `No layout for ${slide.layout}.`);
  const cover = slide.layout === 'cover';
  const contents = layouts[slide.layout](slide);
  const tokenStyles = Object.entries(data.palette).map(([key,value]) => { assert.match(value,/^#[0-9a-f]{6}$/i);return `--${key}:${value}`; }).join(';');
  const root = cover ? `<main class="slide slide--cover" aria-label="${esc(slide.topic)}">${contents}</main>` : `<main class="slide slide--${esc(slide.layout)}" aria-label="${esc(slide.topic)}"><div class="kicker">${esc(slide.topic)}</div><h1 class="slide-title">${esc(slide.headline)}</h1><section class="slide-body" aria-label="${esc(slide.topic)} details">${contents}</section>${footer(slide)}</main>`;
  const html = `<!doctype html>\n<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=1920,initial-scale=1"><title>${esc(slide.number)} — ${esc(slide.headline)}</title><link rel="stylesheet" href="../base.css"><style>:root{${tokenStyles};--font-serif:${esc(data.fonts.headline)},serif;--font-sans:${esc(data.fonts.body)},sans-serif}${css}</style></head><body>${root}${runtime(slide)}</body></html>\n`;
  assert.ok(html.includes(esc(slide.headline)), 'Headline must come directly from deck-data.json.');
  assert.equal((html.match(/data-source-body=/g) || []).length, slide.body.length, 'Every source body item must be visible exactly once.');
  for (const text of slide.body) {
    const plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    assert.ok(plain.includes(esc(text).replace(/\s+/g,' ')), `Source body item was not retained: ${text}`);
  }
  for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new Script(match[1], {filename:`slide_${slide.number}_runtime.js`});
  return html;
}
const outputDir = resolve(deckDir,'slides');
mkdirSync(outputDir,{recursive:true});
for (const slide of data.slides) {
  const path=resolve(outputDir,`slide_${String(slide.number).padStart(2,'0')}.html`);
  writeFileSync(path,page(slide),'utf8');
}
const vendor=resolve(deckDir,'assets/vendor/echarts.min.js');
if(!existsSync(vendor))warnings.add(`Offline ECharts vendor pending: ${vendor}`);
const bodyExceptions=data.slides.filter(s=>s.number<=11&&s.body.join(' ').split(/\s+/).length>25).map(s=>s.number);
console.log(`Generated 14 HTML slides from ${resolve(deckDir,'deck-data.json')}`);
console.log(`Illustrative Core CM: ${money(core.cm)}; session CM: ${money(session.cm)}; whole-block storage allocation: ${money(storage)}. ESTIMATE, not actual costs.`);
console.log(`Necessary body-copy word-limit exceptions: ${bodyExceptions.length?bodyExceptions.map(n=>String(n).padStart(2,'0')).join(', '):'none'}; tables, labels and visible evidence caveats add words.`);
for(const warning of warnings)console.warn(warning);
