// Nolan Life scenes. Each SCENES[name] = { init(el, st), frame(p, t, el, st) }; app.js calls frame with the
// pinned-scene progress p (0→1) and time t (s) while the scene is on screen, or once at data-rest without motion.
// Everything here is drawn in code: no stills, no posters.
window.SCENES = {};
const S = window.SCENES;
const TAU = Math.PI * 2;
const c01 = (v) => Math.min(1, Math.max(0, v));
const seg = (p, a, b) => c01((p - a) / (b - a));
const smooth = (t) => t * t * (3 - 2 * t);
const mix = (a, b, k) => a + (b - a) * k;
const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const SVGNS = 'http://www.w3.org/2000/svg';
// Size a canvas to its box; returns true when the backing store changed.
function fit(cv, mul = 1, useDpr = true) {
  const w = Math.max(1, Math.round(cv.clientWidth * (useDpr ? Math.min(2, devicePixelRatio || 1) : 1) * mul));
  const h = Math.max(1, Math.round(cv.clientHeight * (useDpr ? Math.min(2, devicePixelRatio || 1) : 1) * mul));
  if (cv.width === w && cv.height === h) return false;
  cv.width = w; cv.height = h;
  return true;
}
const setText = (el, v) => { if (el && el.textContent !== v) el.textContent = v; };

// ---------- static builds that need data-fx before app.js collects layers ----------
// Tenet: the Sator square. Every letter flies to its mirror through the centre; the square comes out unchanged.
(() => {
  const sq = document.getElementById('sq');
  if (!sq) return;
  const W = ['SATOR', 'AREPO', 'TENET', 'OPERA', 'ROTAS'];
  W.forEach((w, r) => {
    const row = document.createElement('i');
    row.className = 'sq-row';
    row.style.gridRow = String(r + 1);
    row.dataset.fx = `o 0 .9 ${.62 + r * .04} ${.645 + r * .04}`;
    sq.append(row);
  });
  W.forEach((w, r) => [...w].forEach((ch, c) => {
    const s = document.createElement('span');
    s.className = `sq-cell${r === 2 && c === 2 ? ' mid' : ''}`;
    s.style.setProperty('--r', r + 1);
    s.style.setProperty('--c', c + 1);
    s.setAttribute('aria-hidden', 'true');
    s.textContent = ch;
    const a = .12 + (r * 5 + c) * .005;
    s.dataset.fx = `x 0% ${(4 - 2 * c) * 100}% ${a} ${a + .32} io | y 0% ${(4 - 2 * r) * 100}% ${a} ${a + .32} io | r 0deg 360deg ${a} ${a + .32} io`;
    sq.append(s);
  }));
})();

// The Prestige: the field of top hats Tesla's machine leaves behind.
(() => {
  const hf = document.getElementById('hatfield');
  if (!hf) return;
  const rnd = rng(42);
  let n = 0;
  for (let r = 0; r < 6; r++) {
    const cols = 12 - r;
    const w = 3.2 + r * 1.7;
    for (let c = 0; c < cols; c++) {
      const h = document.createElementNS(SVGNS, 'svg');
      h.setAttribute('viewBox', '0 0 100 80');
      h.setAttribute('class', 'hat');
      h.setAttribute('aria-hidden', 'true');
      h.innerHTML = '<use href="#hat"/>';
      h.style.setProperty('--w', w.toFixed(2));
      h.style.setProperty('--x', ((c + .5) / cols * 100 - w / 2 + (rnd() - .5) * 3).toFixed(2));
      h.style.setProperty('--y', (40 + r * 8.6).toFixed(2));
      const a = .64 + n++ * .0052;
      h.dataset.fx = `o 0 1 ${a.toFixed(4)} ${(a + .02).toFixed(4)} | s .2 1 ${a.toFixed(4)} ${(a + .035).toFixed(4)} out`;
      hf.append(h);
    }
  }
})();

// Memento: a drawing on every rewind card, matched by its caption. Dark ink and light marks over the card's colour.
(() => {
  const K = 'fill="rgba(10,10,12,.55)"', L = 'fill="rgba(255,255,255,.78)"', S = 'fill="none" stroke="rgba(10,10,12,.55)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"', SL = 'fill="none" stroke="rgba(255,255,255,.8)" stroke-width="4" stroke-linecap="round"';
  const hand = 'font-family="Caveat, cursive" font-size="22" fill="#1c2a6b"';
  const pol = (x, y, w, inner) => `<g transform="translate(${x} ${y}) rotate(-6)"><rect width="${w}" height="${w * 1.18}" fill="#fbfaf6"/><g transform="translate(${w * .07} ${w * .07})">${inner}</g></g>`;
  const ART = {
    'he shoots a man': `<path ${K} d="M40 120 h70 l8 -8 h22 v14 h-60 l-6 26 h-18 l6 -26 h-22z"/><path ${L} d="M150 112 l24 -12 -10 14 28 -2 -26 10 18 14 -26 -8z"/><path ${K} d="M232 70 a12 12 0 1 1 0.1 0zM226 86 l-14 44 14 4 6 -20 10 22 12 -6 -14 -30 6 -10z"/>`,
    'a Polaroid fades': pol(105, 34, 80, '<rect width="68" height="68" fill="#d8d0c0"/><path d="M8 54 q14 -10 30 -2 t28 -4 v20 h-58z" fill="rgba(60,40,30,.25)"/>') + `<path ${K} d="M70 150 q20 -30 48 -24 l70 -2 q12 2 8 12 l-40 8 q30 4 34 14 l-90 6 q-24 0 -30 -14z"/>`,
    'a note on the back': `<g transform="translate(70 30) rotate(4)"><rect width="150" height="140" fill="#fbfaf6"/><text x="16" y="44" ${hand}>Don't believe</text><text x="16" y="72" ${hand}>his lies.</text></g>`,
    'a motel room': `<rect x="0" y="0" width="300" height="200" fill="rgba(10,10,12,.15)"/><path ${K} d="M40 120 h180 v40 h-180z M40 104 h50 v16 h-50z"/><path ${K} d="M236 160 v-60 M222 100 h28 l-6 -24 h-16z"/><path ${L} d="M228 80 h16 l4 18 h-24z" opacity=".6"/><path fill="rgba(255,255,255,.35)" d="M120 30 h120 v56 h-120z"/><path stroke="rgba(10,10,12,.35)" stroke-width="3" d="M120 40 h120 M120 52 h120 M120 64 h120 M120 76 h120"/>`,
    'a tattoo': `<path fill="rgba(222,180,150,.9)" d="M-10 150 q60 -60 180 -70 q90 -6 140 10 v70 q-80 -14 -170 0 q-90 16 -150 40z"/><text x="70" y="128" transform="rotate(-8 150 120)" font-family="IBM Plex Mono, monospace" font-size="12" fill="rgba(20,20,30,.85)">FACT 6. CAR LICENSE NUMBER</text><text x="94" y="152" transform="rotate(-8 150 120)" font-family="IBM Plex Mono, monospace" font-size="22" font-weight="700" fill="rgba(20,20,30,.9)">SG13 7IU</text>`,
    'a phone call': `<path ${K} d="M80 150 q-20 -60 20 -100 l26 22 q-20 24 -8 52 l-26 24z M190 150 q20 -60 -20 -100 l-26 22 q20 24 8 52 l26 24z"/><path ${K} d="M104 64 q31 -20 62 0 l-10 14 q-21 -12 -42 0z"/><path ${SL} d="M226 70 q14 30 0 60 M246 56 q24 44 0 88"/>`,
    'he wakes': `<path ${K} d="M30 150 h240 v26 h-240z M30 120 h60 v30 h-60z"/><path fill="rgba(10,10,12,.4)" d="M90 140 q60 -26 170 -6 v16 h-170z"/><path ${L} d="M52 104 a20 14 0 1 1 0.1 0z" opacity=".9"/><path ${S} d="M200 60 q40 -30 70 0 q-30 30 -70 0z"/><circle cx="235" cy="60" r="9" fill="rgba(10,10,12,.7)"/>`,
    'who is Natalie?': pol(100, 22, 100, '<rect width="86" height="86" fill="#c9b49a"/><path d="M43 18 c-22 0 -28 20 -24 40 l-8 28 h64 l-8 -28 c4 -20 -2 -40 -24 -40z" fill="#2a2420"/><ellipse cx="43" cy="44" rx="13" ry="16" fill="#e6c8ac"/>') + `<text x="122" y="168" ${hand} transform="rotate(-6 150 160)">Natalie</text>`,
    'the phone': `<path ${K} d="M70 160 q0 -50 40 -64 h80 q40 14 40 64z"/><circle cx="150" cy="128" r="22" fill="rgba(255,255,255,.55)"/><circle cx="150" cy="128" r="8" fill="rgba(10,10,12,.55)"/><path ${K} d="M80 80 q70 -40 140 0 l-14 16 q-56 -26 -112 0z"/><path ${SL} d="M40 60 l14 10 M30 90 h18 M260 60 l-14 10 M270 90 h-18"/>`,
    'Sammy Jankis': `<path ${K} d="M50 50 h120 l14 14 v100 h-134z"/><text x="62" y="92" font-family="IBM Plex Mono, monospace" font-size="15" fill="rgba(255,255,255,.85)">CLAIM</text><text x="62" y="112" font-family="IBM Plex Mono, monospace" font-size="11" fill="rgba(255,255,255,.7)">JANKIS, S.</text><path stroke="rgba(255,255,255,.8)" stroke-width="5" d="M62 130 h80"/><path ${K} d="M200 150 l50 -70 14 10 -50 70z M254 86 l14 -20 6 4 -14 20z M196 154 l-12 14"/>`,
    'the system': `<rect x="30" y="24" width="240" height="152" fill="rgba(140,110,80,.35)"/><g ${L}><rect x="48" y="40" width="44" height="52"/><rect x="128" y="48" width="44" height="52"/><rect x="206" y="38" width="44" height="52"/><rect x="80" y="110" width="60" height="40"/><rect x="176" y="112" width="60" height="44"/></g><path stroke="rgba(170,30,30,.8)" stroke-width="3" fill="none" d="M70 66 L150 74 L228 64 M150 74 L110 130 L206 134"/><g fill="rgba(170,30,30,.9)"><circle cx="70" cy="44" r="4"/><circle cx="150" cy="52" r="4"/><circle cx="228" cy="42" r="4"/></g>`,
    'notes': `<g transform="rotate(-8 150 100)"><rect x="60" y="40" width="90" height="90" fill="rgba(255,255,255,.75)"/><path stroke="rgba(10,10,12,.5)" stroke-width="3" d="M72 66 h60 M72 82 h50 M72 98 h64"/></g><g transform="rotate(10 200 110)"><rect x="150" y="70" width="90" height="90" fill="rgba(255,255,255,.6)"/><path stroke="rgba(10,10,12,.5)" stroke-width="3" d="M162 98 h60 M162 114 h40"/></g><path ${K} d="M40 170 l130 -120 10 8 -126 124 -18 4z"/>`,
    'the call': `<path ${K} d="M60 150 q-6 -60 40 -80 l20 20 q-26 16 -20 50z"/><path ${S} d="M100 160 c30 0 20 -20 40 -20 s10 20 30 20 s10 -20 30 -20 s10 20 30 20 s10 -20 30 -20"/><path ${K} d="M190 60 h70 v30 h-70z"/>`,
    'a meeting': `<path ${K} d="M0 170 h300 v30 h-300z"/><path ${K} d="M96 60 a14 14 0 1 1 0.1 0zM80 78 h32 l8 70 h-12 l-6 36 h-12 l-2 -36 h-4 l-2 36 h-12 l-6 -36 h-12z"/><path ${K} d="M204 56 a15 15 0 1 1 0.1 0zM186 76 h36 l8 72 h-12 l-6 36 h-12 l-2 -36 h-4 l-2 36 h-12 l-6 -36 h-12z"/><path ${L} d="M196 76 l8 14 8 -14z" opacity=".7"/>`,
    'the last one': pol(96, 22, 108, '<defs><linearGradient id="dev" x1="0" x2="1"><stop offset="0" stop-color="#8c8a86"/><stop offset=".5" stop-color="#b9a68a"/><stop offset="1" stop-color="#c46a40"/></linearGradient></defs><rect width="94" height="94" fill="url(#dev)"/><path d="M14 80 q20 -18 40 -10 t30 -6 v30 h-70z" fill="rgba(30,20,16,.5)"/>'),
  };
  document.querySelectorAll('.rewind .card').forEach((card) => {
    const art = ART[card.querySelector('small')?.textContent.trim()];
    if (art) card.insertAdjacentHTML('afterbegin', `<svg class="card-art" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${art}</svg>`);
  });
})();

// ---------- cover: Academy leader countdown 8 → 2 ----------
S.leader = {
  init(el, st) { st.n = el.querySelector('.ld-n'); st.sw = el.querySelector('.ld-sweep'); },
  frame(p, t, el, st) {
    const f = seg(p, .58, .8) * 6, n = Math.max(2, 8 - Math.floor(f));
    if (st.num !== undefined && n !== st.num && Math.abs(p - st.pp) < .05) window.Sound.beep();
    st.num = n; st.pp = p;
    setText(st.n, String(n));
    st.sw.style.setProperty('--sweep', `${((f % 1) * 360).toFixed(1)}deg`);
  },
};

// ---------- Insomnia: the sun dips toward the horizon and never crosses it ----------
S.sun = {
  init(el, st) {
    Object.assign(st, { disc: el.querySelector('.sun-disc'), time: el.querySelector('#sun-time'), note: el.querySelector('#sun-note'), awake: el.querySelector('#sun-awake'), glare: el.querySelector('.sun-glare') });
  },
  frame(p, t, el, st) {
    const k = c01(p);
    const hours = 18 + k * 12;
    const alt = .55 + .4 * Math.cos(((hours - 12) / 24) * TAU); // lowest at midnight, still above the horizon
    const x = 70 + k * 860;
    const y = 480 - alt * 300;
    st.disc.setAttribute('cx', x.toFixed(1));
    st.disc.setAttribute('cy', y.toFixed(1));
    const hh = Math.floor(hours) % 24;
    const mm = Math.floor((hours % 1) * 60);
    setText(st.time, `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
    setText(st.note, hours < 21 ? 'Evening' : hours < 23 ? 'Night, in theory' : hours < 25 ? 'Midnight · still daylight' : hours < 27 ? 'Small hours · still daylight' : 'Morning, again');
    setText(st.awake, String(36 + Math.floor(k * 12)));
    st.glare.style.setProperty('--sx', `${(x / 10).toFixed(1)}%`);
    st.glare.style.setProperty('--sy', `${((y / 560) * 100).toFixed(1)}%`);
  },
};

// ---------- Batman Begins: the swarm ----------
function drawBat(ctx, x, y, s, flap) {
  const h = s * .42;
  const f = flap * h;
  ctx.beginPath();
  ctx.moveTo(x, y - h * .25);
  ctx.quadraticCurveTo(x - s * .35, y - h * .3 - f, x - s, y - f * 1.1);
  ctx.lineTo(x - s * .78, y + h * .1 - f * .4);
  ctx.lineTo(x - s * .55, y - f * .15);
  ctx.lineTo(x - s * .32, y + h * .22);
  ctx.lineTo(x - s * .12, y + h * .05);
  ctx.lineTo(x, y + h * .35);
  ctx.lineTo(x + s * .12, y + h * .05);
  ctx.lineTo(x + s * .32, y + h * .22);
  ctx.lineTo(x + s * .55, y - f * .15);
  ctx.lineTo(x + s * .78, y + h * .1 - f * .4);
  ctx.lineTo(x + s, y - f * 1.1);
  ctx.quadraticCurveTo(x + s * .35, y - h * .3 - f, x, y - h * .25);
  ctx.fill();
}
S.bats = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.ctx = st.cv.getContext('2d');
    const r = rng(7);
    st.b = Array.from({ length: 260 }, () => ({ d: r() * .32, sp: .7 + r() * .8, ph: r() * TAU, amp: .08 + r() * .3, x0: .5 + (r() - .5) * .2, s: .5 + r() * 1.2, fl: 9 + r() * 7, side: r() < .5 ? -1 : 1 }));
  },
  frame(p, t, el, st) {
    fit(st.cv);
    const { ctx } = st;
    const W = st.cv.width, H = st.cv.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#040302';
    const unit = Math.max(W, H) / 1400;
    for (const b of st.b) {
      const s = (p - .04 - b.d) * 2.1 * b.sp;
      if (s <= 0 || s > 1.7) continue;
      const y = H * (1.1 - s * .9) + Math.sin(t * 1.7 + b.ph) * 10 * unit;
      const x = W * (b.x0 + Math.sin(s * 3.2 + b.ph) * b.amp * .7 + b.side * s * s * .38) + Math.cos(t * 2.1 + b.ph) * 14 * unit;
      drawBat(ctx, x, y, (14 + 24 * b.s) * unit * (.6 + s * 1.1), Math.sin(t * b.fl + b.ph));
    }
  },
};

// ---------- The Prestige: Tesla's coils ----------
function bolt(ctx, x1, y1, x2, y2, d, r) {
  if (d <= 0) { ctx.lineTo(x2, y2); return; }
  const mx = (x1 + x2) / 2 + (r() - .5) * Math.hypot(x2 - x1, y2 - y1) * .35;
  const my = (y1 + y2) / 2 + (r() - .5) * Math.hypot(x2 - x1, y2 - y1) * .35;
  bolt(ctx, x1, y1, mx, my, d - 1, r);
  bolt(ctx, mx, my, x2, y2, d - 1, r);
}
S.tesla = {
  init(el, st) { st.cv = el.querySelector('canvas'); st.ctx = st.cv.getContext('2d'); st.r = rng(3); },
  frame(p, t, el, st) {
    fit(st.cv);
    const { ctx } = st;
    const W = st.cv.width, H = st.cv.height;
    ctx.clearRect(0, 0, W, H);
    const u = Math.min(W, H) / 900;
    const coils = [[W * .14, H * .5], [W * .86, H * .5]];
    coils.forEach(([x, y]) => {
      ctx.fillStyle = '#1b2420';
      ctx.fillRect(x - 26 * u, y, 52 * u, H - y);
      ctx.fillStyle = '#7a5a2a';
      for (let k = 0; k < 18; k++) ctx.fillRect(x - 28 * u, y + 30 * u + k * 9 * u, 56 * u, 3 * u);
      ctx.fillStyle = '#2a332e';
      ctx.beginPath(); ctx.ellipse(x, y, 62 * u, 20 * u, 0, 0, TAU); ctx.fill();
    });
    const on = seg(p, .3, .35) * (1 - seg(p, .6, .64)) + .25 * seg(p, .2, .3) * (1 - seg(p, .3, .32));
    if (on <= 0 || st.r() > .85) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    const target = [W * .5, H * .5];
    for (let i = 0; i < 4; i++) {
      const [x, y] = coils[i % 2];
      ctx.strokeStyle = `rgba(190,228,255,${(.5 + .5 * st.r()) * on})`;
      ctx.shadowColor = '#9fd4ff';
      ctx.shadowBlur = 24 * u;
      ctx.lineWidth = (1 + st.r() * 2.4) * u;
      ctx.beginPath();
      ctx.moveTo(x, y);
      const tx = i < 2 ? target[0] : x + (st.r() - .5) * 500 * u;
      const ty = i < 2 ? target[1] : y - st.r() * 300 * u;
      bolt(ctx, x, y, tx, ty, 7, st.r);
      ctx.stroke();
    }
    ctx.restore();
  },
};

// ---------- The Dark Knight: a night skyline for the IMAX frame ----------
S.skyline = {
  init(el, st) { st.cv = el.querySelector('canvas'); st.ctx = st.cv.getContext('2d'); },
  frame(p, t, el, st) {
    if (!fit(st.cv, 1)) return;
    const { ctx } = st;
    const W = st.cv.width, H = st.cv.height;
    const r = rng(11);
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#060a10'); sky.addColorStop(.6, '#142030'); sky.addColorStop(1, '#2a3646');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    [['#0b1118', .35, .82, 26], ['#05080c', .18, .62, 18]].forEach(([col, minH, maxH, n]) => {
      let x = -W * .02;
      while (x < W) {
        const bw = W / n * (.5 + r());
        const bh = H * mix(minH, maxH, r() ** 1.6);
        ctx.fillStyle = col;
        ctx.fillRect(x, H - bh, bw - 2, bh);
        if (r() < .3) ctx.fillRect(x + bw * .45, H - bh - H * .05, 3, H * .05);
        for (let wy = H - bh + 10; wy < H - 6; wy += 9) for (let wx = x + 5; wx < x + bw - 8; wx += 8) {
          if (r() < .16) { ctx.fillStyle = `rgba(232,205,140,${.25 + r() * .6})`; ctx.fillRect(wx, wy, 3, 4); }
        }
        x += bw;
      }
    });
  },
};

// ---------- Inception: an aerial Paris texture for the folding street ----------
S.fold = {
  init(el) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 512;
    const ctx = cv.getContext('2d');
    const r = rng(5);
    ctx.fillStyle = '#6b6862'; ctx.fillRect(0, 0, 512, 512);
    const xs = [0], ys = [0];
    while (xs[xs.length - 1] < 512) xs.push(xs[xs.length - 1] + 54 + r() * 60);
    while (ys[ys.length - 1] < 512) ys.push(ys[ys.length - 1] + 46 + r() * 52);
    for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < ys.length - 1; j++) {
      const x = xs[i] + 6, y = ys[j] + 6, w = xs[i + 1] - xs[i] - 12, h = ys[j + 1] - ys[j] - 12;
      ctx.fillStyle = r() < .08 ? '#56634f' : '#cfc4ad';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#8e959b';
      ctx.fillRect(x + 4, y + 4, w - 8, h * .22);
      ctx.fillRect(x + 4, y + h * .7, w - 8, h * .22);
      ctx.fillStyle = '#a7a08f';
      ctx.fillRect(x + w * .3, y + h * .36, w * .4, h * .26);
      ctx.fillStyle = 'rgba(70,90,60,.55)';
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(xs[i] + r() * (xs[i + 1] - xs[i]), ys[j] + 2, 3 + r() * 2, 0, TAU); ctx.fill(); }
    }
    el.querySelector('.fold-world').style.setProperty('--city', `url(${cv.toDataURL('image/jpeg', .85)})`);
  },
  frame() {},
};

// ---------- Inception: dream levels, each twenty times slower ----------
const LV_STOPS = [[0, 0], [.06, 0], [.2, 1], [.26, 1], [.4, 2], [.46, 2], [.6, 3], [.66, 3], [.78, 4], [.86, 4], [.95, 0], [1, 0]];
const span = (h) => {
  if (h < 48) return `${Math.floor(h)} h ${String(Math.floor((h % 1) * 60)).padStart(2, '0')} min`;
  const d = h / 24;
  if (d < 60) return `${Math.floor(d)} days`;
  if (d < 730) return `${(d / 30.44).toFixed(1)} months`;
  return `${(d / 365.25).toFixed(1)} years`;
};
S.levels = {
  init(el, st) { st.root = el.querySelector('.lv-root'); st.clocks = [...el.querySelectorAll('[data-clock]')]; st.note = el.querySelector('#lv-note'); },
  frame(p, t, el, st) {
    let L = 0;
    for (let i = 1; i < LV_STOPS.length; i++) {
      const [a, la] = LV_STOPS[i - 1], [b, lb] = LV_STOPS[i];
      if (p <= b) { L = la + (lb - la) * smooth(seg(p, a, b)); break; }
    }
    st.root.style.transform = `scale(${Math.pow(1 / .42, L).toFixed(4)})`;
    const hours = 10 * seg(p, 0, .86);
    st.clocks.forEach((c) => setText(c, span(hours * 20 ** +c.dataset.clock)));
    setText(st.note, p > .86 ? 'The kick. Everyone wakes at once.' : L > 3.5 ? 'Limbo. Raw, infinite subconscious.' : `Level ${Math.round(L)} · ×${20 ** Math.round(L)} slower than reality`);
  },
};

// ---------- Inception: the top keeps spinning, and starts to wobble ----------
S.top = {
  init(el, st) { st.w = el.querySelector('.top-wrap'); },
  frame(p, t, el, st) {
    const wob = 1.2 + 13 * seg(p, .25, .9) ** 2;
    st.w.style.transform = `rotate(${(Math.sin(t * 6.5) * wob).toFixed(2)}deg)`;
  },
};

// ---------- The Dark Knight Rises: the stadium. The field falls away behind the kick returner ----------
// Yards: x across the field (±26.5), z down it (0 near end line, 120 far), y up. A collapse front sweeps from the far
// end towards the camera; each five-yard strip drops once the front passes its middle.
S.stadium = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.ctx = st.cv.getContext('2d');
    const r = rng(2012);
    st.crowd = Array.from({ length: 1400 }, () => [r(), r(), r()]);
  },
  frame(p, t, el, st) {
    fit(st.cv);
    const { ctx } = st, W = st.cv.width, H = st.cv.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#07080a'; ctx.fillRect(0, 0, W, H);
    if (st.prev !== undefined && st.prev < .44 && p >= .44 && p - st.prev < .05) window.Sound.rumble();
    st.prev = p;
    const vis = smooth(seg(p, .27, .42));
    if (vis <= 0) return;
    ctx.globalAlpha = vis;
    const camZ = -18, camH = 24, hy = H * .16, F = Math.min(W * 1.05, H * 1.3);
    const P = (x, y, z) => { const d = Math.max(.5, z - camZ); return [W / 2 + x * F / d, hy + (camH - y) * F / d]; };
    const quad = (a, b, c, d, col) => { ctx.beginPath(); [a, b, c, d].forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); };
    // floodlights
    [[-.2, 0], [1.2, 0]].forEach(([fx]) => { const g = ctx.createRadialGradient(W * fx, H * .02, 0, W * fx, H * .02, W * .6); g.addColorStop(0, 'rgba(230,236,255,.35)'); g.addColorStop(1, 'rgba(230,236,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); });
    // stands, packed
    [[-1], [1]].forEach(([sgn]) => {
      quad(P(sgn * 30, 0, -10), P(sgn * 30, 0, 130), P(sgn * 74, 40, 130), P(sgn * 74, 40, -10), '#15161b');
      st.crowd.forEach(([a, b, c]) => {
        const [x, y] = P(sgn * (30 + b * 44), b * 40, -10 + a * 140);
        if (x < -4 || x > W + 4) return;
        ctx.fillStyle = c < .35 ? '#e6c45a' : c < .6 ? '#d9d4c8' : c < .8 ? '#2b2c33' : '#8a2c2a';
        const sz = Math.max(1, F / (-10 + a * 140 - camZ) * .55);
        ctx.fillRect(x, y - sz, sz, sz);
      });
    });
    quad(P(-30, 0, 130), P(30, 0, 130), P(74, 40, 130), P(-74, 40, 130), '#121318');
    // the collapse front and the strips
    const zc = mix(124, 6, smooth(seg(p, .44, .9)));
    const hole = Math.min(120, Math.max(zc, 0));
    if (hole < 120) quad(P(-26.5, 0, hole), P(26.5, 0, hole), P(26.5, 0, 120), P(-26.5, 0, 120), '#030304');
    for (let i = 23; i >= 0; i--) {
      const z0 = i * 5, z1 = z0 + 5, zm = z0 + 2.5;
      const age = Math.max(0, (zc < zm ? zm - zc : 0) / 14);
      const drop = 26 * age * age, tilt = age * 6 * (i % 2 ? 1 : -1);
      if (drop > 40) continue;
      const shade = Math.max(0, 1 - age * .8);
      const end = i < 2 || i > 21;
      const base = end ? [26, 64, 36] : i % 2 ? [46, 110, 48] : [52, 122, 54];
      const col = `rgb(${base.map((v) => (v * shade) | 0).join(',')})`;
      quad(P(-26.5, -drop - tilt, z0), P(26.5, -drop + tilt, z0), P(26.5, -drop + tilt, z1), P(-26.5, -drop - tilt, z1), col);
      if (!end && age < 1) { ctx.strokeStyle = `rgba(240,240,236,${(.85 * shade).toFixed(3)})`; ctx.lineWidth = Math.max(1, F / (z0 - camZ) * .12); ctx.beginPath(); ctx.moveTo(...P(-26.5, -drop - tilt, z0)); ctx.lineTo(...P(26.5, -drop + tilt, z0)); ctx.stroke(); }
      if (!end && i % 2 === 0 && age < .5) {
        const yd = i * 5 - 10, num = String(yd > 50 ? 100 - yd : yd);
        if (yd > 0 && yd < 100) { const [nx, ny] = P(-19, -drop, z0), fs = Math.max(6, F / (z0 - camZ) * 2.2); ctx.fillStyle = `rgba(240,240,236,${(.8 * shade).toFixed(3)})`; ctx.font = `700 ${fs}px Archivo, sans-serif`; ctx.textAlign = 'center'; ctx.fillText(num, nx, ny); ctx.fillText(num, P(19, -drop, z0)[0], ny); }
      }
    }
    // dust off the edge
    if (zc < 122 && zc > 4) {
      for (let k = 0; k < 26; k++) {
        const ph = (k / 26 + t * .4) % 1, x = -26 + (k * 37 % 53), [dx, dy] = P(x, ph * 6, zc + 1 + ph * 3), R = (1.5 + ph * 4) * F / (zc - camZ + 3);
        ctx.fillStyle = `rgba(160,150,140,${(.28 * (1 - ph)).toFixed(3)})`; ctx.beginPath(); ctx.arc(dx, dy, R, 0, TAU); ctx.fill();
      }
    }
    // the kick returner, just ahead of the edge
    const zr = Math.max(4, Math.min(112, zc - 8)), xr = 5 + Math.sin(p * 9) * 3;
    const [rx, ry] = P(xr, 0, zr), s = F / (zr - camZ), run = Math.sin(t * 12);
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#d9d4c8'; ctx.lineWidth = s * .28;
    ctx.beginPath(); ctx.moveTo(rx, ry - s * 1); ctx.lineTo(rx + run * s * .35, ry); ctx.moveTo(rx, ry - s * 1); ctx.lineTo(rx - run * s * .35, ry); ctx.stroke();
    ctx.fillStyle = '#e6c45a'; ctx.fillRect(rx - s * .3, ry - s * 1.7, s * .6, s * .75);
    ctx.fillStyle = '#e6c45a'; ctx.beginPath(); ctx.arc(rx, ry - s * 1.95, s * .24, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#e6c45a'; ctx.lineWidth = s * .2; ctx.beginPath(); ctx.moveTo(rx - s * .3, ry - s * 1.55); ctx.lineTo(rx - s * .55 - run * s * .2, ry - s * 1.1); ctx.moveTo(rx + s * .3, ry - s * 1.55); ctx.lineTo(rx + s * .5, ry - s * 1.3); ctx.stroke();
    ctx.fillStyle = '#7a4a2a'; ctx.beginPath(); ctx.ellipse(rx + s * .55, ry - s * 1.32, s * .22, s * .13, -.4, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
  },
};

// ---------- Interstellar: Gargantua, ray-traced per pixel ----------
const GARG_FS = `precision highp float;
uniform vec2 R; uniform float T; uniform float D; uniform float E;
float hash(vec3 p){ p = fract(p * .3183099 + .1); p *= 17.; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  float a = hash(vec3(i, 1.)), b = hash(vec3(i + vec2(1., 0.), 1.)), c = hash(vec3(i + vec2(0., 1.), 1.)), d = hash(vec3(i + vec2(1., 1.), 1.));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y); }
vec3 stars(vec3 d){ vec3 q = d * 160.; vec3 id = floor(q); float h = hash(id); float s = step(.99, h) * (.4 + .6 * fract(h * 91.7)) * smoothstep(.45, .05, length(fract(q) - .5));
  return vec3(s) * vec3(1., .95, .85) + vec3(.012, .014, .022); }
void main(){
  vec2 uv = (gl_FragCoord.xy - .5 * R) / R.y;
  vec3 ro = vec3(0., sin(E) * D, -cos(E) * D);
  vec3 fw = normalize(-ro);
  vec3 rt = normalize(cross(vec3(0., 1., 0.), fw));
  vec3 up = cross(fw, rt);
  vec3 vel = normalize(fw * 1.45 + uv.x * rt + uv.y * up);
  vec3 pos = ro;
  vec3 hv = cross(pos, vel); float h2 = dot(hv, hv);
  vec3 col = vec3(0.); float a = 0.; bool hole = false;
  for (int i = 0; i < 260; i++) {
    float r2 = dot(pos, pos);
    if (r2 < 1.) { hole = true; break; }
    if (r2 > 2500.) break;
    float r = sqrt(r2);
    float dt = clamp(.06 * r, .02, 1.2);
    vec3 np = pos + vel * dt;
    vel += -1.5 * h2 * pos / (r2 * r2 * r) * dt;
    if (pos.y * np.y < 0.) {
      vec3 ip = mix(pos, np, pos.y / (pos.y - np.y));
      float rr = length(ip.xz);
      if (rr > 2.6 && rr < 13.) {
        float w = T * 1.8 / pow(rr, 1.5);
        vec2 q = mat2(cos(w), -sin(w), sin(w), cos(w)) * ip.xz;
        float n = .5 + .5 * sin(rr * 9. + noise(q * 1.3) * 5. + noise(q * 4.) * 1.5);
        float edge = smoothstep(2.6, 3.4, rr) * (1. - smoothstep(7., 13., rr));
        float heat = 1. - smoothstep(2.6, 10., rr);
        vec3 c = mix(vec3(1., .42, .1), vec3(1., .93, .78), heat) * (.5 + 2.2 * heat);
        float da = edge * (.3 + .7 * n);
        col += (1. - a) * c * da * 1.5;
        a += (1. - a) * da * .85;
      }
    }
    pos = np;
  }
  if (!hole) col += (1. - a) * stars(normalize(vel));
  col = 1. - exp(-col * 1.3);
  gl_FragColor = vec4(pow(col, vec3(.9)), 1.);
}`;
S.gargantua = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.planet = el.querySelector('#dl-planet');
    st.earth = el.querySelector('#dl-earth');
    const gl = st.cv.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: true });
    if (!gl) return;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
    const vs = sh(gl.VERTEX_SHADER, 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }');
    const fs = sh(gl.FRAGMENT_SHADER, GARG_FS);
    if (!vs || !fs) return;
    const pr = gl.createProgram();
    gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    st.gl = gl;
    st.u = Object.fromEntries(['R', 'T', 'D', 'E'].map((n) => [n, gl.getUniformLocation(pr, n)]));
    el.querySelector('.stage').classList.add('gl');
  },
  frame(p, t, el, st) {
    const k = seg(p, .5, .84);
    const sec = k * 3600;
    setText(st.planet, `${Math.floor(sec / 3600)}:${String(Math.floor(sec / 60) % 60).padStart(2, '0')}:${String(Math.floor(sec) % 60).padStart(2, '0')}`);
    const days = k * 7 * 365.25;
    const yy = Math.floor(days / 365.25);
    setText(st.earth, `${yy} year${yy === 1 ? '' : 's'} ${Math.floor(days % 365.25)} days`);
    if (!st.gl) return;
    const { gl, u } = st;
    fit(st.cv, innerWidth < 700 ? .5 : .62, false);
    gl.viewport(0, 0, st.cv.width, st.cv.height);
    const dist = p < .84 ? mix(30, 7.2, smooth(seg(p, 0, .84))) : mix(7.2, .6, seg(p, .84, .95) ** 2);
    gl.uniform2f(u.R, st.cv.width, st.cv.height);
    gl.uniform1f(u.T, t);
    gl.uniform1f(u.D, dist);
    gl.uniform1f(u.E, .07 + .05 * c01(p));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  },
};

// ---------- Interstellar: the tesseract, a corridor of bookshelves that never ends ----------
S.tesseract = {
  init(el, st) { st.cv = el.querySelector('canvas'); st.ctx = st.cv.getContext('2d'); st.marks = [...el.querySelectorAll('.mz i')]; },
  frame(p, t, el, st) {
    fit(st.cv);
    const { ctx } = st;
    const W = st.cv.width, H = st.cv.height;
    ctx.fillStyle = '#050403'; ctx.fillRect(0, 0, W, H);
    const cx = W / 2 + Math.sin(p * 3) * W * .04, cy = H * .56;
    const travel = (p * 8 + t * .08) % 1;
    const F = Math.min(W, H) * .9;
    ctx.lineWidth = Math.max(1.5, W / 900);
    for (let k = 22; k >= 1; k--) {
      const z = k - travel;
      if (z <= .15) continue;
      const s = F / z;
      const a = Math.min(1, 2.4 / z);
      ctx.strokeStyle = `rgba(240,180,93,${a.toFixed(3)})`;
      ctx.strokeRect(cx - s, cy - s * .62, s * 2, s * 1.24);
      ctx.strokeStyle = `rgba(240,180,93,${(a * .45).toFixed(3)})`;
      ctx.beginPath();
      for (let i = 1; i < 6; i++) { const yy = cy - s * .62 + (s * 1.24 * i) / 6; ctx.moveTo(cx - s, yy); ctx.lineTo(cx + s, yy); }
      for (let i = 1; i < 8; i++) { const xx = cx - s + (s * 2 * i) / 8; ctx.moveTo(xx, cy - s * .62); ctx.lineTo(xx, cy + s * .62); }
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(240,180,93,.08)';
    ctx.beginPath();
    for (let i = 0; i < 40; i++) { const ang = (i / 40) * TAU; ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * W, cy + Math.sin(ang) * W); }
    ctx.stroke();
    const lit = Math.floor(seg(p, .08, .55) * (st.marks.length + .99));
    st.marks.forEach((m, i) => m.classList.toggle('on', i < lit));
  },
};

// ---------- Dunkirk: one tracking shot, from the air down to the sea and in to the Mole ----------
// World in metres: x runs from England towards France, y is height above the sea, z is distance from the camera.
// Scroll moves the camera and every event; real time only moves the water, propellers, smoke and fire.
// keyv([[p, a, b…], …], p) interpolates the values between keyframes.
const keyv = (K, p, ease) => {
  let i = 1;
  while (i < K.length - 1 && p > K[i][0]) i++;
  const A = K[i - 1], B = K[i];
  let k = c01((p - A[0]) / (B[0] - A[0]));
  if (ease) k = smooth(k);
  return A.slice(1).map((v, j) => mix(v, B[j + 1], k));
};
// Smooth paths through keyframes (uniform Catmull-Rom), for planes that must not stop at each key.
const spline = (K, p) => {
  const n = K.length;
  if (p <= K[0][0]) return K[0].slice(1);
  if (p >= K[n - 1][0]) return K[n - 1].slice(1);
  let i = 0;
  while (p > K[i + 1][0]) i++;
  const u = (p - K[i][0]) / (K[i + 1][0] - K[i][0]);
  const A = K[Math.max(0, i - 1)], B = K[i], Cc = K[i + 1], D = K[Math.min(n - 1, i + 2)];
  return B.slice(1).map((_, j) => { const p0 = A[j + 1], p1 = B[j + 1], p2 = Cc[j + 1], p3 = D[j + 1]; return .5 * (2 * p1 + (p2 - p0) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (3 * p1 - p0 - 3 * p2 + p3) * u * u * u); });
};
// The camera's speed is keyed, not its position, so it never jumps: fast in the air, slow at the wreck, stops at the Mole.
const DK_V = [[0, 6000], [.2, 6000], [.27, 300], [.38, 300], [.44, 2400], [.58, 2400], [.7, 0], [.88, 0], [.915, 690], [.95, 0], [1, 0]];
const DK_N = 2000;
const DK_X = new Float32Array(DK_N + 1);
for (let i = 1; i <= DK_N; i++) DK_X[i] = DK_X[i - 1] + keyv(DK_V, (i - .5) / DK_N)[0] / DK_N;
const camXAt = (p) => { const f = c01(p) * DK_N, i = Math.min(DK_N - 1, Math.floor(f)); return mix(DK_X[i], DK_X[i + 1], f - i); };
const XC = camXAt(.7) + 14; // the French coast: the beach starts just right of the camera once it stops
const DK_Y = [[0, 70], [.16, 70], [.31, 3.2], [.62, 3.2], [.72, 5.5], [1, 5.5]];
const DK_H = [[0, .52], [.16, .52], [.31, .44], [1, .44]];
const wav = (x, z, t) => .42 * Math.sin(x * .06 + z * .17 + t * .9) + .24 * Math.sin(x * .17 - z * .31 + t * 1.6 + 2) * Math.exp(-z / 300) + .1 * Math.sin(x * .41 + z * .53 - t * 2.3) * Math.exp(-z / 120);
const landH = () => .15; // a flat beach
const mixc = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];
const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const poly = (ctx, pts) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); };
function sprite(stops) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return c;
}
// Side profiles, nose or bow towards +x, y up. Planes in metres; boats in units of their length.
const SPIT = [[4.55, .12], [4.2, .42], [2.6, .55], [1.25, .6], [.95, .62], [.55, 1.02], [-.35, 1.06], [-.8, .72], [-3.7, .36], [-3.95, .42], [-4.15, 1.45], [-4.4, 1.62], [-4.7, 1.5], [-4.82, 1], [-4.75, .18], [-4.6, .02], [-3.4, -.12], [-1.2, -.3], [.2, -.42], [1.5, -.38], [3.2, -.22], [4.3, -.12]];
const SPIT_C = [[.95, .64], [.55, 1], [-.3, 1.03], [-.7, .7]];
const STUKA = [[5.6, .25], [5.3, .7], [3.2, .82], [2.9, .86], [2.5, 1.32], [-.6, 1.36], [-1.2, .9], [-4.9, .55], [-5.1, .6], [-5.3, 2.05], [-5.95, 2.1], [-6.05, 1.7], [-5.95, .35], [-5.7, .05], [-2.5, -.35], [1, -.62], [3.6, -.55], [5, -.25]];
const STUKA_C = [[2.85, .88], [2.45, 1.28], [-.5, 1.32], [-1, .92]];
const STUKA_LEG = [[1.1, -.55], [2.3, -.55], [2.25, -1.4], [1.95, -2], [1.55, -2], [1.25, -1.5]];
const BOATS = {
  yacht: { parts: [[[[-.5, .07], [.36, .085], [.5, .11], [.43, -.01], [.33, -.045], [-.44, -.045], [-.5, .02]], [214, 208, 192]], [[[-.2, .07], [-.2, .17], [.14, .17], [.2, .13], [.2, .07]], [188, 178, 156]], [[[-.5, -.012], [.45, -.012], [.44, .008], [-.5, .008]], [96, 44, 34]]], mast: [.05, .17, .05, .42] },
  fisher: { parts: [[[[-.5, .09], [.42, .11], [.5, .16], [.4, -.02], [.3, -.06], [-.42, -.06], [-.5, .03]], [44, 52, 58]], [[[-.36, .1], [-.36, .24], [-.16, .24], [-.16, .1]], [150, 140, 120]], [[[-.44, .15], [-.44, .42], [-.27, .15]], [124, 92, 70]]], mast: [.18, .11, .18, .55] },
  barge: { parts: [[[[-.5, .05], [.47, .06], [.5, .075], [.46, -.02], [-.48, -.02]], [40, 36, 34]], [[[.02, .08], [.02, .55], [-.32, .62], [-.38, .1]], [142, 64, 38]], [[[.04, .57], [.04, .75], [-.12, .6]], [150, 74, 44]], [[[.06, .5], [.42, .08], [.06, .08]], [156, 80, 48]]], mast: [.03, .06, .03, .78] },
  steamer: { parts: [[[[-.5, .05], [.45, .06], [.5, .08], [.46, -.03], [-.47, -.03]], [28, 28, 30]], [[[-.3, .05], [-.3, .1], [.3, .1], [.3, .05]], [208, 202, 188]], [[[-.04, .1], [-.02, .24], [.06, .24], [.05, .1]], [176, 146, 92]], [[[-.022, .2], [-.02, .24], [.06, .24], [.058, .2]], [26, 26, 28]]], wheel: [0, .05, .075] },
  destroyer: { parts: [[[[-.5, .03], [-.2, .032], [.12, .04], [.14, .058], [.5, .066], [.47, .02], [.44, -.02], [-.46, -.024], [-.5, 0]], [96, 104, 108]], [[[.16, .058], [.16, .1], [.2, .1], [.2, .125], [.25, .125], [.27, .1], [.29, .058]], [108, 116, 120]], [[[.03, .045], [.015, .13], [.05, .13], [.065, .045]], [84, 90, 94]], [[[-.095, .042], [-.11, .12], [-.075, .12], [-.06, .042]], [84, 90, 94]], [[[.33, .062], [.33, .08], [.38, .08], [.39, .066]], [80, 86, 90]], [[[-.33, .032], [-.33, .05], [-.38, .05], [-.39, .036]], [80, 86, 90]]], mast: [.14, .125, .13, .24] },
};
const DK_SKY = { top: [[112, 126, 132], [40, 42, 66]], hor: [[200, 204, 198], [226, 146, 104]], sea: [[34, 48, 52], [24, 24, 36]], sand: [[176, 164, 136], [70, 52, 50]], cloud: [[238, 240, 238], [236, 172, 150]] };

S.crossing = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.ctx = st.cv.getContext('2d');
    st.clk = [...el.querySelectorAll('[data-t]')];
    st.bars = [...el.querySelectorAll('.dk-bar i')];
    st.n = el.querySelector('#dk-n');
    st.prev = 0;
    st.puff = sprite([[0, 'rgba(255,255,255,.9)'], [.55, 'rgba(255,255,255,.35)'], [1, 'rgba(255,255,255,0)']]);
    st.soot = sprite([[0, 'rgba(22,20,20,.85)'], [.6, 'rgba(30,28,28,.35)'], [1, 'rgba(30,28,28,0)']]);
    st.fire = sprite([[0, 'rgba(255,236,170,1)'], [.35, 'rgba(255,150,40,.8)'], [1, 'rgba(200,40,10,0)']]);
    const r = rng(1940);
    st.clouds = Array.from({ length: 80 }, () => {
      const R = 18 + r() * 46;
      return { x: -400 + r() * 2800, y: 25 + r() * 140, z: 120 * (12 ** r()), R, puffs: Array.from({ length: 4 }, () => [(r() - .5) * 2 * R, (r() - .5) * .5 * R, R * (.5 + r() * .5)]) };
    });
    const kinds = ['yacht', 'yacht', 'yacht', 'fisher', 'fisher', 'fisher', 'barge', 'barge', 'steamer', 'destroyer'];
    const LEN = { yacht: [10, 18], fisher: [12, 20], barge: [26, 30], steamer: [55, 70], destroyer: [95, 110] };
    const ZR = { yacht: [150, 700], fisher: [150, 760], barge: [200, 820], steamer: [320, 1000], destroyer: [420, 1100] };
    st.boats = Array.from({ length: 100 }, (_, i) => {
      const near = i < 8;
      const kind = near ? (i % 2 ? 'fisher' : 'yacht') : kinds[Math.floor(r() * kinds.length)];
      const z = near ? 48 + r() * 70 : ZR[kind][0] * ((ZR[kind][1] / ZR[kind][0]) ** r());
      const a = near ? .3 + i * .035 : .3 + r() * .3;
      const L = mix(...LEN[kind], r());
      const cxA = camXAt(a);
      const sx = near ? 760 + L * .6 * 945 / z : (r() - .45) * 1500; // px from centre on a 1440 × 945 reference screen
      return { kind, z, a, L, near, cap: XC - 8 - r() * z * .55, x0: cxA + sx * z / 945 - .82 * cxA, ph: r() * 9 };
    });
    // Beach queues: five lines of men from the dunes towards the water
    st.queues = [5, 14, 25, 39, 56].map((dx) => {
      const n = 170;
      return { x: XC + dx, n, z: Array.from({ length: n }, (_, i) => 62 + i * 1.3 + r() * .5), dx: Array.from({ length: n }, () => (r() - .5) * .7), k: Array.from({ length: n }, () => .92 + r() * .14) };
    });
    const xd = camXAt(.295) + 21;
    st.xd = xd;
    // Planes: position keys [p, x relative to coast or camera, y]
    st.stuka1 = [[.68, XC - 30, 100], [.735, XC - 62, 22], [.765, XC - 100, 13], [.8, XC - 190, 55]];
    st.stuka2 = [[.77, XC + 10, 100], [.83, XC - 30, 44], [.855, XC - 55, 18], [.87, XC - 66, 0]];
    st.spit = [[.775, XC - 86, 18], [.83, XC - 42, 15], [.9, XC - 6, 6], [.95, XC + 10, 1.65], [1, XC + 13, 1.65]];
  },
  frame(p, t, el, st) {
    fit(st.cv, devicePixelRatio > 1.4 ? .75 : 1);
    const { ctx } = st;
    const W = st.cv.width, H = st.cv.height;
    const cx = camXAt(p);
    const cy = keyv(DK_Y, p, true)[0];
    const hy = keyv(DK_H, p, true)[0] * H;
    const F = Math.min(H * 1.05, W * .95);
    const dusk = smooth(seg(p, .84, .97));
    const C = {};
    for (const k in DK_SKY) C[k] = mixc(DK_SKY[k][0], DK_SKY[k][1], dusk);
    const fogOf = (z) => 1 - Math.exp(-z / 1100);
    const col = (c, z, a = 1) => rgba(mixc(c, C.hor, fogOf(z)), a);
    const P = (x, y, z) => [W / 2 + (x - cx) * F / z, hy + (cy - y) * F / z];
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const sky = ctx.createLinearGradient(0, 0, 0, hy);
    sky.addColorStop(0, rgba(C.top)); sky.addColorStop(1, rgba(C.hor));
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    if (dusk > 0) {
      const g = ctx.createRadialGradient(W * .1, hy, 0, W * .1, hy, W * .6);
      g.addColorStop(0, `rgba(255,190,120,${.6 * dusk})`); g.addColorStop(1, 'rgba(255,190,120,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, hy + 2);
    }
    const items = [];
    const add = (z, d) => { if (z > .5) items.push([z, d]); };

    // the sea and the beach, one depth band at a time
    const z0 = Math.max(1, .8 * cy * F / Math.max(40, H - hy));
    const step = Math.max(4, W / 260);
    const zn = Math.max(.3, .5 * cy * F / Math.max(40, H - hy)); // a depth just below the bottom of the screen
    add(6000, () => { // the beach: everything right of the coastline
      const [ax, ay] = P(XC, .15, 6000), [bx, by] = P(XC, .15, zn);
      if (Math.min(ax, bx) > W) return;
      const g = ctx.createLinearGradient(0, hy, 0, H);
      g.addColorStop(0, rgba(mixc(C.sand, C.hor, .78))); g.addColorStop(.22, rgba(mixc(C.sand, C.hor, .3))); g.addColorStop(1, rgba(mixc(C.sand, [20, 18, 18], .22)));
      const R = Math.max(W * 3, bx + 10);
      ctx.fillStyle = g; poly(ctx, [[ax, ay], [bx, by], [R, by], [R, ay]]); ctx.fill();
      const [wx1, wy1] = P(XC + 5, .15, 6000), [wx2, wy2] = P(XC + 5, .15, zn);
      ctx.fillStyle = rgba(mixc(C.sand, C.sea, .45), .55); poly(ctx, [[ax, ay], [bx, by], [wx2, wy2], [wx1, wy1]]); ctx.fill();
      ctx.strokeStyle = rgba(mixc(C.sand, [40, 36, 30], .35), .5); ctx.lineWidth = Math.max(1, W / 1200);
      [2.5, 7, 15].forEach((d) => { const [x1, y1] = P(XC + d, .15, 6000), [x2, y2] = P(XC + d, .15, zn); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); });
    });
    let bi = 0;
    for (let z = z0; z < 5000; z *= 1.17, bi++) {
      const zz = z, odd = bi % 2;
      add(zz, () => {
        const s = F / zz, f = fogOf(zz);
        const xcS = W / 2 + (XC - cx) * s;
        if (xcS > 0) {
          const xe = Math.min(W, xcS);
          ctx.beginPath(); ctx.moveTo(0, H);
          const top = [];
          for (let sx = 0; ; sx += step) {
            const X = Math.min(sx, xe);
            const y = hy + (cy - wav(cx + (X - W / 2) / s, zz, t)) * s;
            top.push(X, y); ctx.lineTo(X, y);
            if (X >= xe) break;
          }
          if (xe < W) { const [nx, ny] = P(XC, 0, zn); ctx.lineTo(nx, ny); ctx.lineTo(0, ny); } else ctx.lineTo(W, H);
          ctx.closePath();
          ctx.fillStyle = rgba(mixc(mixc(C.sea, [70, 86, 88], odd ? .07 : 0), C.hor, f)); ctx.fill();
          ctx.beginPath(); for (let i = 0; i < top.length; i += 2) (i ? ctx.lineTo(top[i], top[i + 1]) : ctx.moveTo(top[i], top[i + 1]));
          ctx.strokeStyle = `rgba(236,240,238,${(.16 * (1 - f)).toFixed(3)})`; ctx.lineWidth = Math.max(1, s * .05); ctx.stroke();
          if (xcS < W) { // surf where the sea meets the sand
            ctx.strokeStyle = `rgba(245,245,240,${(.6 * (1 - f)).toFixed(3)})`; ctx.lineWidth = Math.max(1, s * .12);
            ctx.beginPath(); ctx.moveTo(Math.max(0, xcS - 5 * s), top[top.length - 1]); ctx.lineTo(xcS, top[top.length - 1]); ctx.stroke();
          }
        }
      });
    }

    // England: the white cliffs, behind the camera's start
    add(1600, () => {
      const [ex, ey] = P(-200, 0, 1600), s = F / 1600;
      if (ex < 0) return;
      const top = [[ex, ey - 4 * s], [ex - 18 * s, ey - 70 * s], [ex - 60 * s, ey - 84 * s], [ex - 140 * s, ey - 92 * s], [ex - 260 * s, ey - 80 * s], [ex - 420 * s, ey - 96 * s], [ex - 700 * s, ey - 88 * s], [-10, ey - 90 * s]];
      const g = ctx.createLinearGradient(0, ey - 96 * s, 0, ey);
      g.addColorStop(0, col([244, 242, 232], 500)); g.addColorStop(1, col([160, 160, 150], 500));
      ctx.fillStyle = g; poly(ctx, [[-10, ey], ...top]); ctx.fill();
      ctx.fillStyle = col([92, 108, 74], 500);
      poly(ctx, [...top.slice(1), [-10, ey - 98 * s], [ex - 30 * s, ey - 80 * s]]); ctx.fill();
    });
    // Dunkirk on the horizon: the town, the belfry, the burning oil
    add(1700, () => {
      const s = F / 1700;
      const [tx, ty] = P(XC + 40, 2, 1700);
      if (tx > W) return;
      ctx.fillStyle = col([52, 50, 50], 1700);
      ctx.beginPath(); ctx.moveTo(tx, ty);
      const r = rng(59);
      for (let x = 0; tx + x * s < W + 40; x += 14) { const h = 8 + r() * 16 + (x > 300 && x < 314 ? 50 : 0); ctx.lineTo(tx + x * s, ty - h * s); ctx.lineTo(tx + (x + 14) * s, ty - h * s); }
      ctx.lineTo(W + 40, ty); ctx.closePath(); ctx.fill();
    });
    [[XC + 120, 1500], [XC + 420, 1600], [XC + 760, 1450], [XC + 1100, 1650]].forEach(([x, z], j) => add(z, () => {
      const s = F / z;
      const [bx, by] = P(x, 4, z);
      if (bx < -400 * s || bx > W + 300 * s) return;
      for (let k = 0; k < 44; k++) {
        const ph = (k / 44 + t * .015 + j * .17) % 1;
        const h = ph * 560, R = (14 + ph * 90) * s;
        ctx.globalAlpha = .42 * (1 - fogOf(z) * .6) * (1 - ph * .6);
        ctx.drawImage(st.soot, bx - (h * .5 + ph * ph * 160) * s - R, by - h * s - R, R * 2, R * 2);
      }
      ctx.globalAlpha = 1;
    }));

    // clouds
    st.clouds.forEach((c) => add(c.z, () => {
      const s = F / c.z;
      const [x, y] = P(c.x, c.y, c.z);
      if (x < -c.R * 3 * s || x > W + c.R * 3 * s || y < -c.R * s * 2 || y > H + c.R * s) return;
      ctx.globalAlpha = .5 * (1 - fogOf(c.z) * .55);
      c.puffs.forEach(([dx, dy, R]) => ctx.drawImage(st.puff, x + dx * s - R * s * 1.6, y - dy * s - R * s, R * s * 3.2, R * s * 2));
      ctx.globalAlpha = 1;
    }));

    // the little ships: they keep pace just behind the camera, then gather off the beach
    let shown = 0;
    const drift = 40 * seg(p, .7, .9);
    st.boats.forEach((b) => {
      if (p < b.a) return;
      shown++;
      const x = Math.min(b.cap, b.x0 + .82 * cx + drift);
      add(b.z, () => boat(b.kind, x, b.z, b.L, b.near ? 1 : Math.min(1, (p - b.a) / .04), b.ph));
    });
    if (p > .5) add(116, () => boat('destroyer', XC - 95, 116, 100, seg(p, .55, .62), 0));
    // Moonstone keeps pace with the camera, then turns for home with soldiers aboard
    const home = seg(p, .74, .9);
    const moonX = cx + 3 - 70 * home ** 1.4;
    if (p > .27) add(22, () => boat('yacht', moonX, 22, 15, seg(p, .27, .3), 4, Math.cos(Math.PI * seg(p, .72, .76)), p > .74, true));
    function boat(kind, x, z, L, alpha, ph, dir = 1, troops = false, hero = false) {
      const s = F / z, sx = W / 2 + (x - cx) * s;
      if (sx + L * s * .6 < 0 || sx - L * s * .6 > W || alpha <= 0) return;
      const bob = wav(x, z, t) * .8;
      const sy = hy + (cy - bob) * s;
      const roll = Math.atan((wav(x + 3, z, t) - wav(x - 3, z, t)) / 6) * .6 + Math.sin(t * .7 + ph) * .01;
      const f = fogOf(z), spec = BOATS[kind];
      ctx.save(); ctx.globalAlpha = alpha;
      ctx.translate(sx, sy); ctx.rotate(-roll); ctx.scale(L * s * dir, -L * s);
      spec.parts.forEach(([pts, c]) => { ctx.fillStyle = rgba(mixc(c, C.hor, f)); poly(ctx, pts); ctx.fill(); });
      ctx.strokeStyle = rgba(mixc([40, 40, 40], C.hor, f)); ctx.lineWidth = 1.5 / (L * s * Math.max(.2, Math.abs(dir)));
      if (spec.mast) { const [a, b, c, d] = spec.mast; ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); }
      if (hero) {
        ctx.fillStyle = rgba(mixc([46, 52, 58], C.hor, f));
        [-.15, -.08, -.01, .06].forEach((wx) => ctx.fillRect(wx, .115, .045, .03));
        ctx.fillRect(-.497, .07, .008, .13);
        ctx.fillStyle = rgba(mixc([176, 42, 38], C.hor, f)); ctx.fillRect(-.552, .155 + Math.sin(t * 3) * .002, .056, .04);
        if (!troops) {
          ctx.fillStyle = rgba(mixc([40, 40, 44], C.hor, f));
          [[-.41, .1], [-.34, .1], [-.28, .08]].forEach(([px, h]) => { ctx.fillRect(px - .012, .07, .024, h - .02); ctx.beginPath(); ctx.arc(px, .07 + h - .008, .011, 0, TAU); ctx.fill(); });
        }
      }
      if (troops) { ctx.fillStyle = rgba(mixc([70, 66, 50], C.hor, f)); for (let i = 0; i < 9; i++) ctx.fillRect(-.42 + i * .07, .07, .028, .11); }
      if (spec.wheel) { ctx.fillStyle = rgba(mixc([28, 28, 30], C.hor, f)); ctx.beginPath(); ctx.arc(spec.wheel[0], spec.wheel[1], spec.wheel[2], 0, Math.PI); ctx.fill(); }
      ctx.strokeStyle = `rgba(240,242,240,${(.45 * (1 - f)).toFixed(3)})`; ctx.lineWidth = 2 / (L * s);
      ctx.beginPath(); ctx.moveTo(-.5, 0); ctx.quadraticCurveTo(-.8, .01, -1.1, 0); ctx.moveTo(.48, .01); ctx.lineTo(.56, -.005); ctx.stroke();
      ctx.restore();
    }

    // The Mole: a long wooden walkway on piles, packed two abreast; Bolton stays on at the end
    if (p > .52) add(92, () => {
      const z = 92, s = F / z, f = fogOf(z);
      const x0 = Math.max(XC - 160, cx - W / 2 / s - 4), x1 = Math.min(XC + 4, cx + W / 2 / s + 4);
      if (x1 <= x0) return;
      ctx.fillStyle = rgba(mixc([48, 42, 36], C.hor, f));
      for (let x = Math.ceil(x0 / 4) * 4; x < x1; x += 4) { const [px, py] = P(x, -1, z); ctx.fillRect(px - .25 * s, py - 7 * s, .5 * s, 7 * s); }
      const [ax, ay] = P(x0, 6, z), [bx2] = P(x1, 6, z);
      ctx.fillStyle = rgba(mixc([58, 50, 42], C.hor, f)); ctx.fillRect(ax, ay, bx2 - ax, .9 * s);
      const gone = seg(p, .86, .95);
      ctx.fillStyle = rgba(mixc([84, 78, 58], C.hor, f), 1 - gone);
      const hsh = (i) => { const v = Math.sin(i * 127.1) * 43758.5453; return v - Math.floor(v); };
      for (let i = Math.ceil(x0 / .8); i * .8 < Math.min(x1, XC - 3); i++) {
        [0, 1].forEach((o) => {
          const j = i * 2 + o;
          if (hsh(j + 3) < .1) return;
          const [px, py] = P(i * .8 + o * .4 + (hsh(j) - .5) * .35, 6, z + o * 1.5);
          soldier(px, py, s, .9 + hsh(j + 7) * .18);
        });
      }
      ctx.fillStyle = rgba(mixc([30, 32, 44], C.hor, f));
      const [qx, qy] = P(XC - 34, 6, z - .6); soldier(qx, qy, s * 1.04);
    });
    function soldier(sx, sy, s, k = 1) {
      s *= k;
      if (s < 7) { ctx.fillRect(sx - .24 * s, sy - 1.7 * s, .48 * s, 1.7 * s); return; }
      ctx.fillRect(sx - .2 * s, sy - .86 * s, .15 * s, .86 * s);
      ctx.fillRect(sx + .05 * s, sy - .86 * s, .15 * s, .86 * s);
      ctx.fillRect(sx - .26 * s, sy - 1.5 * s, .52 * s, .7 * s);
      ctx.fillRect(sx - .36 * s, sy - 1.46 * s, .14 * s, .5 * s);
      ctx.fillRect(sx - .1 * s, sy - 1.64 * s, .2 * s, .16 * s);
      ctx.beginPath(); ctx.ellipse(sx, sy - 1.68 * s, .3 * s, .07 * s, 0, 0, TAU); ctx.ellipse(sx, sy - 1.72 * s, .17 * s, .1 * s, 0, Math.PI, TAU); ctx.fill();
    }
    if (p > .55) {
      const gone = seg(p, .84, .92);
      if (gone < 1) st.queues.forEach((q) => {
        for (let c0 = 0; c0 < q.n; c0 += 20) add(q.z[c0], () => {
          for (let i = Math.min(q.n, c0 + 20) - 1; i >= c0; i--) {
            const z = q.z[i], s = F / z;
            ctx.fillStyle = rgba(mixc([80, 74, 56], C.hor, fogOf(z)), 1 - gone);
            const [px, py] = P(q.x + q.dx[i], .15, z);
            if (px > -5 && px < W + 5) soldier(px, py, s, q.k[i]);
          }
        });
      });
    }

    // Planes. Each is a function of p, so a smoke trail is just the same plane at earlier p.
    function plane(kind, x, y, z, ang, roll, prop, gear = false) {
      const s = F / z;
      const [sx, sy] = P(x, y, z);
      if (sx < -14 * s || sx > W + 14 * s || sy < -14 * s || sy > H + 14 * s) return;
      const f = fogOf(z);
      let a = ang;
      const flip = Math.cos(a) < 0;
      ctx.save(); ctx.translate(sx, sy);
      if (flip) { ctx.scale(-1, 1); a = Math.PI - a; }
      ctx.rotate(-a); ctx.scale(s, -s);
      const body = kind === 'stuka' ? STUKA : SPIT, canopy = kind === 'stuka' ? STUKA_C : SPIT_C;
      const dark = rgba(mixc(kind === 'stuka' ? [58, 64, 52] : [64, 66, 50], C.hor, f));
      const span = (kind === 'stuka' ? 6.9 : 5.6) * Math.abs(Math.sin(roll)) + .1;
      ctx.fillStyle = dark;
      ctx.beginPath(); ctx.ellipse(kind === 'stuka' ? .8 : .3, kind === 'stuka' ? -.45 : -.22, 1.3, span, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(kind === 'stuka' ? -5 : -4.2, .3, .65, (kind === 'stuka' ? 2 : 1.6) * Math.abs(Math.sin(roll)) + .06, 0, 0, TAU); ctx.fill();
      poly(ctx, body); ctx.fill();
      if (kind === 'stuka') { poly(ctx, STUKA_LEG); ctx.fill(); }
      ctx.fillStyle = rgba(mixc([150, 166, 172], C.hor, f)); poly(ctx, canopy); ctx.fill();
      if (s > 9) {
        if (kind === 'stuka') {
          ctx.fillStyle = rgba(mixc([235, 235, 230], C.hor, f)); ctx.fillRect(-3, -.05, .9, .7); ctx.fillRect(-2.85, -.2, .6, 1);
          ctx.fillStyle = rgba(mixc([16, 16, 16], C.hor, f)); ctx.fillRect(-2.95, .11, .8, .38); ctx.fillRect(-2.75, -.1, .4, .8);
        } else {
          [[.38, [214, 182, 60]], [.32, [40, 56, 110]], [.2, [232, 232, 226]], [.1, [176, 40, 36]]].forEach(([rr, c]) => { ctx.fillStyle = rgba(mixc(c, C.hor, f)); ctx.beginPath(); ctx.arc(-2.1, .15, rr, 0, TAU); ctx.fill(); });
        }
      }
      if (gear) { ctx.strokeStyle = dark; ctx.lineWidth = .16; ctx.beginPath(); ctx.moveTo(.7, -.3); ctx.lineTo(.85, -1.25); ctx.stroke(); ctx.fillStyle = rgba(mixc([24, 24, 24], C.hor, f)); ctx.beginPath(); ctx.arc(.85, -1.3, .3, 0, TAU); ctx.fill(); }
      const nx = kind === 'stuka' ? 5.65 : 4.6;
      ctx.strokeStyle = dark; ctx.lineWidth = .14;
      if (prop) { ctx.fillStyle = `rgba(30,30,30,${(.22 * (1 - f)).toFixed(3)})`; ctx.beginPath(); ctx.ellipse(nx + .05, .15, .1, 1.6, 0, 0, TAU); ctx.fill(); }
      else { ctx.beginPath(); [.4, 2.49, 4.58].forEach((b) => { ctx.moveTo(nx + .05, .15); ctx.lineTo(nx + .08, .15 + Math.sin(b) * 1.6); }); ctx.stroke(); }
      ctx.restore();
    }
    const trail = (fn, from, z, n = 90, dp = .0005) => add(z + .05, () => {
      for (let k = n; k >= 1; k--) {
        const q = p - k * dp;
        if (q < from) continue;
        const [x, y] = fn(q), s = F / z;
        const [sx, sy] = P(x + Math.sin(k * 1.7) * .3, y, z), R = (2.2 + k * .1) * s;
        ctx.globalAlpha = .22 * (1 - k / (n + 1)) * (1 - fogOf(z) * .6);
        ctx.drawImage(st.soot, sx - R, sy - R, R * 2, R * 2);
      }
      ctx.globalAlpha = 1;
    });
    const heading = (fn, q) => { const [x1, y1] = fn(q - .001), [x2, y2] = fn(q + .001); return Math.atan2(y2 - y1, x2 - x1); };
    const tracer = (from, to, a) => add(1, () => {
      ctx.strokeStyle = `rgba(255,224,140,${a})`; ctx.lineWidth = Math.max(1.5, W / 900); ctx.setLineDash([W / 60, W / 40]); ctx.lineDashOffset = -t * 2400;
      ctx.beginPath(); ctx.moveTo(...from); ctx.lineTo(...to); ctx.stroke(); ctx.setLineDash([]);
    });
    if (p < .34) {
      // Fortis formation. Farrier holds height and climbs away as the camera follows Collins down.
      const fA = (q) => [camXAt(q) + 5 + 900 * seg(q, .2, .32) ** 2, 67.8 + 30 * seg(q, .24, .34) ** 2];
      const fC = (q) => [camXAt(q) + 22 - 2000 * Math.max(0, q - .08) ** 2, keyv(DK_Y, q, true)[0] + 4.5 - 6300 * Math.max(0, q - .08) ** 2];
      const fB = (q) => (q < .295 ? [camXAt(q) - 9 + 30 * seg(q, .17, .295), mix(71.4, 0, seg(q, .17, .295) ** 1.25)] : [st.xd, 0]);
      const bob = (k) => Math.sin(t * 1.2 + k) * .35;
      add(58, () => plane('spit', fC(p)[0], fC(p)[1] + bob(2), 58, heading(fC, p), p < .08 ? .2 + Math.sin(t * .8) * .06 : (p - .08) * 40, true));
      if (p > .08) trail(fC, .08, 58);
      if (p < .295) add(38, () => plane('spit', fB(p)[0], fB(p)[1] + (p < .16 ? bob(1) : 0), 38, p < .17 ? .02 : Math.max(-.35, heading(fB, p)), .15 + Math.sin(t * .6 + 1) * .05 + seg(p, .2, .29) * .5, true));
      if (p > .16 && p < .295) trail(fB, .16, 38, 40);
      add(27, () => plane('spit', fA(p)[0], fA(p)[1] + bob(0), 27, heading(fA, p), .22 + Math.sin(t * .7) * .07, true));
      if (p > .074 && p < .086) tracer([W * 1.05, H * .05], P(...fC(p), 58), .9);
      if (p > .155 && p < .168) tracer([W * 1.05, H * .1], P(...fB(p), 38), .9);
    }
    if (p > .29 && p < .45) add(38.1, () => { // Collins's Spitfire, nose down in the water
      const sink = seg(p, .33, .43), s = F / 38;
      const [sx, sy] = P(st.xd, -sink * 3, 38);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, P(st.xd, wav(st.xd, 38, t), 38)[1]); ctx.clip();
      ctx.translate(sx, sy); ctx.rotate(.5); ctx.scale(s, -s); ctx.fillStyle = col([64, 66, 50], 38); poly(ctx, SPIT); ctx.fill();
      ctx.restore();
    });
    const splashes = [[st.xd, 38, .292, 9], [XC - 84, 108, .737, 30], [XC - 58, 112, .745, 34], [XC - 104, 100, .752, 28], [XC - 66, 124, .87, 24]];
    splashes.forEach(([x, z, p0, size]) => {
      const u = (p - p0) / .045;
      if (u <= 0 || u >= 1) return;
      add(z - .1, () => {
        const s = F / z, [sx, sy] = P(x, 0, z);
        const h = size * Math.sin(Math.min(1, u * 1.5) * Math.PI / 2) * (1 - .4 * seg(u, .5, 1));
        ctx.globalAlpha = 1 - smooth(seg(u, .4, 1));
        const w0 = size * .22 * s * (1 + u), w1 = size * .12 * s * (1 + u * 1.6);
        const g = ctx.createLinearGradient(0, sy - h * s, 0, sy);
        g.addColorStop(0, 'rgba(248,248,246,.95)'); g.addColorStop(1, rgba(mixc([150, 164, 166], C.hor, fogOf(z) * .5), .95));
        ctx.fillStyle = g;
        poly(ctx, [[sx - w0, sy], [sx - w1 * 1.3, sy - h * s * .7], [sx - w1 * .6, sy - h * s], [sx + w1 * .4, sy - h * s * .96], [sx + w1 * 1.2, sy - h * s * .72], [sx + w0, sy]]); ctx.fill();
        ctx.fillStyle = 'rgba(120,132,136,.45)';
        poly(ctx, [[sx + w0 * .1, sy], [sx + w1 * .2, sy - h * s * .9], [sx + w1 * 1.2, sy - h * s * .72], [sx + w0, sy]]); ctx.fill();
        for (let k = 0; k < 12; k++) {
          const R = (.18 + k / 12 * .32) * size * (1 + u) * s * .5;
          ctx.drawImage(st.puff, sx + Math.sin(k * 2.3) * R * .4 - R, sy - (k / 11) * h * s - R, R * 2, R * 2);
        }
        ctx.globalAlpha = 1;
      });
    });
    if (p > .66) {
      const s1 = (q) => spline(st.stuka1, q), s2 = (q) => spline(st.stuka2, q), sp = (q) => spline(st.spit, q);
      if (p > .68 && p < .8) add(120, () => plane('stuka', ...s1(p), 120, heading(s1, p), .1, true));
      if (p > .725 && p < .737) add(119, () => { // the bomb
        const [rx, ry] = s1(.725), k = seg(p, .725, .737), [bx, by] = P(mix(rx, XC - 84, k), ry * (1 - k * k), mix(120, 108, k));
        ctx.fillStyle = '#222'; ctx.beginPath(); ctx.ellipse(bx, by, F / 120 * .25, F / 120 * .6, 0, 0, TAU); ctx.fill();
      });
      if (p > .77 && p < .871) {
        add(124, () => plane('stuka', ...s2(p), 124, heading(s2, p), p > .83 ? (p - .83) * 30 : .1, true));
        if (p > .83) trail(s2, .83, 124);
      }
      if (p > .775) {
        const ang = p > .95 ? .18 : heading(sp, Math.min(p, .949));
        add(50, () => plane('spit', ...sp(p), 50, ang, .08, false, p > .9));
        if (p > .815 && p < .835) tracer(P(...sp(p), 50), P(...s2(p), 124), .5 + .5 * Math.sin(t * 60));
      }
      if (p > .95) { // Farrier burns his Spitfire on the beach
        const burn = seg(p, .955, .99), [fx, fy] = P(sp(p)[0] - 1, sp(p)[1] - .2, 50), s = F / 50;
        add(49.9, () => {
          ctx.globalCompositeOperation = 'lighter';
          const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, 36 * s);
          g.addColorStop(0, `rgba(255,140,50,${.45 * burn})`); g.addColorStop(1, 'rgba(255,140,50,0)');
          ctx.fillStyle = g; ctx.fillRect(fx - 36 * s, fy - 36 * s, 72 * s, 72 * s);
          for (let i = 0; i < 46; i++) {
            const ph = (i / 46 + t * .9) % 1, R = ((1 - ph) * 2 + .5) * s * burn;
            ctx.globalAlpha = (1 - ph) * burn;
            ctx.drawImage(st.fire, fx + (Math.sin(i * 12.9 + t * 3) * .6 + (i % 9 - 4) * .8) * s - R, fy - ph * 6.5 * s - R, R * 2, R * 2);
          }
          ctx.globalCompositeOperation = 'source-over';
          for (let i = 0; i < 16; i++) {
            const ph = (i / 16 + t * .12) % 1, R = (2 + ph * 9) * s;
            ctx.globalAlpha = .6 * (1 - ph) * burn;
            ctx.drawImage(st.soot, fx - ph * 14 * s - R, fy - (4 + ph * 40) * s - R, R * 2, R * 2);
          }
          ctx.globalAlpha = 1;
        });
      }
    }

    items.sort((m, n) => n[0] - m[0]);
    items.forEach((it) => it[1]());

    // three clocks, one scroll
    const k = seg(p, .02, .95), end = k >= 1;
    st.bars.forEach((b) => { b.style.width = `${(k * 100).toFixed(1)}%`; });
    setText(st.clk[0], end ? 'Day 7 · they meet' : `Day ${Math.min(7, 1 + Math.floor(k * 7))} of 7`);
    setText(st.clk[1], end ? 'Hour 24 · they meet' : `Hour ${Math.floor(k * 24)} of 24`);
    setText(st.clk[2], end ? 'Minute 60 · they meet' : `Minute ${Math.floor(k * 60)} of 60`);
    const n = Math.round(850 * smooth(seg(p, .36, .58)));
    setText(st.n, n >= 850 ? 'about 850' : n.toLocaleString('en'));
    const fwd = p - st.prev < .05; // a real scroll forward, not a jump in from the menu or from below
    if (fwd && st.prev < .69 && p >= .69) window.Sound.siren();
    if (fwd && st.prev < .78 && p >= .78) window.Sound.siren();
    st.prev = p;
  },
};

// ---------- Tenet: the temporal pincer, as a palindrome ----------
// One bullet through one pane, simulated once in init and stored frame by frame (scroll can jump, so nothing
// is integrated live). Scroll plays it backwards up to the turnstile, blue, then forwards after it, red; the
// 180° door turn in the markup mirrors the second half, so frame(p) is the mirror of frame(1 − p).
const PC_T = 2.4, PC_HIT = .14, PC_FR = 180;
// sim time from distance to the turnstile: hold still through the turn, slow motion on the bullet and the break
const PC_TAU = [[0, 0], [.12, 0], [.26, PC_HIT], [.44, PC_HIT + .34], [1, PC_T]];
function clipRect(pts, x0, y0, x1, y1) {
  const edge = (pp, inside, cut) => {
    const out = [];
    pp.forEach((b, i) => { const a = pp[(i + pp.length - 1) % pp.length], ia = inside(a), ib = inside(b); if (ib) { if (!ia) out.push(cut(a, b)); out.push(b); } else if (ia) out.push(cut(a, b)); });
    return out;
  };
  const atX = (x) => (a, b) => [x, a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0])];
  const atY = (y) => (a, b) => [a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]), y];
  let o = edge(pts, (q) => q[0] >= x0, atX(x0));
  if (o.length) o = edge(o, (q) => q[0] <= x1, atX(x1));
  if (o.length) o = edge(o, (q) => q[1] >= y0, atY(y0));
  if (o.length) o = edge(o, (q) => q[1] <= y1, atY(y1));
  return o;
}
S.pincer = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.ctx = st.cv.getContext('2d');
    st.dir = el.querySelector('#pc-dir');
    st.tm = el.querySelector('#pc-t');
    const r = rng(2020);
    // The pane stands in the plane x = 0: z across (−1…1 m), y up (.45…2.25 m). The bullet travels along +x.
    const Z0 = -1, Z1 = 1, Y0 = .45, Y1 = 2.25, IZ = .18, IY = 1.42;
    st.pane = [Z0, Z1, Y0, Y1, IZ, IY];
    // Radial fracture: rings around the impact, cracks between, every vertex jittered; cells clipped to the pane.
    const RINGS = [0, .07, .17, .31, .5, .76, 1.1, 1.6, 2.4], NS = 12;
    const V = RINGS.map((rad, k) => Array.from({ length: NS }, (_, j) => {
      const a = (j + (k ? (r() - .5) * .55 : 0) + k * .11) / NS * TAU, rr = rad * (1 + (k ? (r() - .5) * .2 : 0));
      return [IZ + Math.cos(a) * rr, IY + Math.sin(a) * rr];
    }));
    const shards = [];
    for (let k = 0; k < RINGS.length - 1; k++) for (let j = 0; j < NS; j++) {
      const q = clipRect([V[k][j], V[k][(j + 1) % NS], V[k + 1][(j + 1) % NS], V[k + 1][j]], Z0, Y0, Z1, Y1);
      if (q.length < 3) continue;
      let area = 0;
      q.forEach((a, i) => { const b = q[(i + 1) % q.length]; area += a[0] * b[1] - b[0] * a[1]; });
      if (Math.abs(area) < 3e-4) continue;
      const cz = q.reduce((m, v) => m + v[0], 0) / q.length, cy = q.reduce((m, v) => m + v[1], 0) / q.length;
      shards.push({ loc: q.map(([z, y]) => [z - cz, y - cy]), cz, cy });
    }
    st.shards = shards;
    const n = shards.length;
    const q = shards.map((s) => {
      const d = Math.hypot(s.cz - IZ, s.cy - IY) || .01, uz = (s.cz - IZ) / d, uy = (s.cy - IY) / d;
      return { x: 0, y: s.cy, z: s.cz, a: 0, b: 0, vx: 1.1 + 4.4 * Math.exp(-d / .35) + r() * .8, vy: uy * (.5 + r() * .9) * Math.exp(-d / .9) + r() * .7, vz: uz * (.7 + r()) * Math.exp(-d / .9), wa: (r() - .5) * 20, wb: (r() - .5) * 10, rest: false };
    });
    const D = new Float32Array(PC_FR * n * 5), dt = 1 / 240;
    let tt = 0;
    for (let f = 0; f < PC_FR; f++) {
      const target = f / (PC_FR - 1) * PC_T;
      while (tt < target) {
        tt += dt;
        if (tt <= PC_HIT) continue;
        q.forEach((s) => {
          s.vy -= 9.8 * dt;
          s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt;
          s.a += s.wa * dt; s.b += s.wb * dt;
          if (s.y < .012) {
            s.y = .012;
            if (s.vy < 0 && !s.rest) {
              if (s.vy > -.7) s.rest = true;
              else { s.vy *= -.26; s.vx *= .55; s.vz *= .55; s.wa *= .4; s.wb *= .5; }
            }
          }
          if (s.rest) { // slide to a stop and lie flat
            s.vy = 0; s.y = .012; s.wa = 0;
            const fr = Math.max(0, 1 - 7 * dt);
            s.vx *= fr; s.vz *= fr; s.wb *= fr;
            const flat = Math.round((s.a - Math.PI / 2) / Math.PI) * Math.PI + Math.PI / 2;
            s.a += (flat - s.a) * Math.min(1, 14 * dt);
          }
        });
      }
      q.forEach((s, i) => D.set([s.x, s.y, s.z, s.a, s.b], (f * n + i) * 5));
    }
    st.D = D; st.n = n;
  },
  frame(p, t, el, st) {
    fit(st.cv);
    const { ctx, shards, D, n } = st;
    const W = st.cv.width, H = st.cv.height;
    const inv = p < .5;
    const tau = keyv(PC_TAU, Math.abs(2 * p - 1))[0];
    const tint = inv ? [61, 102, 255] : [224, 56, 47];
    const [Z0, Z1, Y0, Y1, IZ, IY] = st.pane;
    // camera: three-quarters behind the gun, so the pane shows its face and the glass falls away into the room
    const E = [-3.9, 1.75, -3.3], T0 = [.5, 1, .35];
    let f = [T0[0] - E[0], T0[1] - E[1], T0[2] - E[2]];
    const fl = Math.hypot(...f); f = f.map((v) => v / fl);
    const rl = Math.hypot(f[2], f[0]), rv = [f[2] / rl, 0, -f[0] / rl];
    const uv = [f[1] * rv[2] - f[2] * rv[1], f[2] * rv[0] - f[0] * rv[2], f[0] * rv[1] - f[1] * rv[0]];
    const Fo = Math.min(W * (W < H ? .8 : .62), H * 1.15);
    const P = (x, y, z) => {
      const d = [x - E[0], y - E[1], z - E[2]];
      const Z = d[0] * f[0] + d[1] * f[1] + d[2] * f[2];
      return [W * (W < H ? .6 : .5) + (d[0] * rv[0] + d[1] * rv[1] + d[2] * rv[2]) / Z * Fo, H * .47 - (d[0] * uv[0] + d[1] * uv[1] + d[2] * uv[2]) / Z * Fo, Z];
    };
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const bg = ctx.createRadialGradient(W * .55, H * .45, 0, W * .55, H * .45, Math.max(W, H) * .75);
    bg.addColorStop(0, rgba(mixc(tint, [8, 8, 10], .72))); bg.addColorStop(1, '#070709');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    // lab floor
    ctx.strokeStyle = rgba(tint, .16); ctx.lineWidth = Math.max(1, W / 1400);
    ctx.beginPath();
    for (let x = -3.5; x <= 5.01; x += .5) { ctx.moveTo(...P(x, 0, -2.5).slice(0, 2)); ctx.lineTo(...P(x, 0, 4).slice(0, 2)); }
    for (let z = -2.5; z <= 4.01; z += .5) { ctx.moveTo(...P(-3.5, 0, z).slice(0, 2)); ctx.lineTo(...P(5, 0, z).slice(0, 2)); }
    ctx.stroke();
    // the frame the pane sits in
    const corner = [[Y0, Z0], [Y0, Z1], [Y1, Z1], [Y1, Z0]].map(([y, z]) => P(0, y, z));
    ctx.strokeStyle = '#2b2b31'; ctx.lineWidth = Math.max(3, Fo * .012); ctx.lineJoin = 'round';
    ctx.beginPath(); corner.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
    [Z0, Z1].forEach((z) => { const a = P(0, Y0, z), b = P(0, 0, z); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); });
    ctx.stroke();
    // the gun
    const M = [-2.25, IY, IZ];
    const gun = (pts) => { ctx.beginPath(); pts.forEach(([dx, dy], i) => { const [x, y] = P(M[0] + dx * 1.8, M[1] + dy * 1.8, M[2]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.fill(); ctx.stroke(); };
    ctx.fillStyle = '#16161a'; ctx.strokeStyle = rgba(tint, .7); ctx.lineWidth = Math.max(1, W / 1200);
    gun([[0, .02], [0, .065], [-.32, .065], [-.34, .04], [-.32, .02]]);
    gun([[-.2, .02], [-.17, -.16], [-.28, -.175], [-.31, .02]]);
    gun([[-.13, .02], [-.12, -.045], [-.2, -.045], [-.2, .02]]);
    const glow = (x, y, R, c, a) => { const g = ctx.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, rgba(c, a)); g.addColorStop(1, rgba(c, 0)); ctx.fillStyle = g; ctx.fillRect(x - R, y - R, R * 2, R * 2); };
    if (tau > 0 && tau < .035) { const [x, y] = P(...M); glow(x, y, Fo * .12 * (1 - tau / .035), [255, 226, 160], .95); }
    // shards: interpolate the stored frames
    const fr = tau / PC_T * (PC_FR - 1), f0 = Math.min(PC_FR - 2, Math.floor(fr)), kf = fr - f0;
    const broken = tau >= PC_HIT;
    if (st.wasBroken !== undefined && broken !== st.wasBroken && Math.abs(p - st.pp) < .05) {
      if (!inv && broken) window.Sound.glass(false);
      if (inv && !broken) window.Sound.glass(true);
    }
    st.wasBroken = broken; st.pp = p;
    const L = [-.45, .75, -.5];
    const list = shards.map((sh, i) => {
      const a0 = (f0 * n + i) * 5, a1 = a0 + n * 5;
      const v = [0, 1, 2, 3, 4].map((j) => mix(D[a0 + j], D[a1 + j], kf));
      const [x, y, z, a, b] = v, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
      const pts = sh.loc.map(([dz, dy]) => { const x1 = -dy * sa, y1 = dy * ca; return P(x + x1 * cb + dz * sb, y + y1, z - x1 * sb + dz * cb); });
      const nrm = [ca * cb, sa, -ca * sb];
      const lit = Math.abs(nrm[0] * L[0] + nrm[1] * L[1] + nrm[2] * L[2]) / Math.hypot(...L);
      return { pts, depth: P(x, y, z)[2], lit, x, y, z };
    });
    if (broken) { // shadows under the falling glass
      list.forEach((s) => {
        const [x, y] = P(s.x, 0, s.z), R = Fo * .05 / P(s.x, 0, s.z)[2];
        ctx.fillStyle = `rgba(0,0,0,${(.35 / (1 + s.y * 3)).toFixed(3)})`;
        ctx.beginPath(); ctx.ellipse(x, y, R * 1.6, R * .5, 0, 0, TAU); ctx.fill();
      });
    }
    if (!broken) {
      const g = ctx.createLinearGradient(corner[0][0], corner[0][1], corner[2][0], corner[2][1]);
      g.addColorStop(0, 'rgba(210,225,255,.07)'); g.addColorStop(.5, rgba(mixc([255, 255, 255], tint, .3), .2)); g.addColorStop(1, 'rgba(210,225,255,.05)');
      ctx.fillStyle = g; ctx.beginPath(); corner.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill();
    } else {
      list.sort((m, k) => k.depth - m.depth);
      ctx.lineWidth = Math.max(1, W / 1300);
      list.forEach((s) => {
        ctx.beginPath(); s.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
        ctx.fillStyle = rgba(mixc([225, 235, 255], tint, .35), (.06 + .3 * s.lit).toFixed(3)); ctx.fill();
        ctx.strokeStyle = `rgba(255,255,255,${(.3 + .55 * s.lit).toFixed(3)})`; ctx.stroke();
      });
    }
    // the bullet, and the flash where it meets the glass
    if (tau > 0 && tau < PC_HIT + .3) {
      const bx = tau < PC_HIT ? mix(M[0], 0, tau / PC_HIT) : (tau - PC_HIT) * 16;
      const [x, y] = P(bx, IY, IZ), [x2, y2] = P(bx - .5, IY, IZ);
      const g = ctx.createLinearGradient(x2, y2, x, y);
      g.addColorStop(0, 'rgba(255,230,170,0)'); g.addColorStop(1, 'rgba(255,240,200,.9)');
      ctx.strokeStyle = g; ctx.lineWidth = Math.max(2, Fo * .006); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x, y); ctx.stroke(); ctx.lineCap = 'butt';
      glow(x, y, Fo * .02, [255, 240, 200], 1);
    }
    if (broken && tau < PC_HIT + .08) { const [x, y] = P(0, IY, IZ); glow(x, y, Fo * .22 * (1 - (tau - PC_HIT) / .08), mixc([255, 255, 255], tint, .3), .9); }
    setText(st.dir, inv ? '◀ Inverted' : 'Forward ▶');
    setText(st.tm, `${tau.toFixed(2)} s`);
    el.classList.toggle('fwd', !inv);
  },
};

// ---------- Oppenheimer: a chain reaction, then Trinity ----------
S.chain = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.ctx = st.cv.getContext('2d');
    st.gen = el.querySelector('#ch-gen');
    st.n = el.querySelector('#ch-n');
    st.wo = el.querySelector('.whiteout');
    const r = rng(1945);
    const nuc = [];
    for (let tries = 0; nuc.length < 340 && tries < 6000; tries++) {
      const x = .04 + r() * .92, y = .08 + r() * .84;
      if (nuc.every((q) => Math.hypot(q.x - x, (q.y - y) * .6) > .028)) nuc.push({ x, y, g: -1 });
    }
    // Build the reaction: each split sends 2 or 3 neutrons to the nearest unsplit nuclei.
    const ev = [];
    let front = [{ x: -.02, y: .5, g: -1 }];
    const first = nuc.reduce((m, q) => (q.x < m.x ? q : m), nuc[0]);
    first.g = 0;
    ev.push({ px: -.02, py: .5, q: first });
    front = [first];
    for (let g = 1; g < 14 && front.length; g++) {
      const next = [];
      front.forEach((f) => {
        const k = 2 + (r() < .5 ? 1 : 0);
        nuc.filter((q) => q.g < 0).sort((a, b) => Math.hypot(a.x - f.x, a.y - f.y) - Math.hypot(b.x - f.x, b.y - f.y) + (r() - .5) * .02)
          .slice(0, k).forEach((q) => { if (Math.hypot(q.x - f.x, q.y - f.y) < .22) { q.g = g; ev.push({ px: f.x, py: f.y, q }); next.push(q); } });
      });
      front = next;
    }
    st.nuc = nuc; st.ev = ev;
    st.maxG = Math.max(...ev.map((e) => e.q.g)) + 1;
    st.prev = 0;
    st.ang = nuc.map(() => r() * TAU);
  },
  frame(p, t, el, st) {
    fit(st.cv);
    const { ctx } = st;
    const W = st.cv.width, H = st.cv.height;
    const u = Math.min(W, H) / 900;
    ctx.fillStyle = '#0b0806'; ctx.fillRect(0, 0, W, H);
    const G = seg(p, .06, .58) * st.maxG;
    if (p < .9) {
      st.nuc.forEach((q, i) => {
        const done = q.g >= 0 && G > q.g + 1;
        const age = done ? G - q.g - 1 : 0;
        if (!done) {
          ctx.fillStyle = q.g >= 0 && G > q.g ? '#ffcf86' : '#4a3326';
          ctx.beginPath(); ctx.arc(q.x * W, q.y * H, 5 * u, 0, TAU); ctx.fill();
          return;
        }
        const d = Math.min(1, age) * 14 * u;
        const a = st.ang[i];
        ctx.fillStyle = `rgba(255,${Math.max(80, 200 - age * 30) | 0},40,${Math.max(.25, 1 - age * .15).toFixed(2)})`;
        ctx.beginPath(); ctx.arc(q.x * W + Math.cos(a) * d, q.y * H + Math.sin(a) * d, 3.4 * u, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.arc(q.x * W - Math.cos(a) * d, q.y * H - Math.sin(a) * d, 3.4 * u, 0, TAU); ctx.fill();
        if (age < 1.2) { ctx.fillStyle = `rgba(255,220,150,${(.5 * (1.2 - age)).toFixed(2)})`; ctx.beginPath(); ctx.arc(q.x * W, q.y * H, (6 + age * 22) * u, 0, TAU); ctx.fill(); }
      });
      ctx.lineWidth = 1.6 * u;
      let count = 0;
      st.ev.forEach((e) => {
        const f = c01(G - e.q.g);
        if (f <= 0) return;
        if (f >= 1) count++;
        if (f >= 1 && G - e.q.g > 2) return;
        ctx.strokeStyle = `rgba(160,220,255,${f >= 1 ? .25 : .95})`;
        ctx.beginPath();
        ctx.moveTo(e.px * W, e.py * H);
        ctx.lineTo(mix(e.px, e.q.x, f) * W, mix(e.py, e.q.y, f) * H);
        ctx.stroke();
      });
      setText(st.gen, String(Math.min(st.maxG, Math.floor(G))));
      setText(st.n, count.toLocaleString('en'));
    }
    if (p > .78) {
      const k = seg(p, .8, 1);
      const R = (.15 + k * .9) * Math.max(W, H);
      const g = ctx.createRadialGradient(W / 2, H * .62, 0, W / 2, H * .62, R);
      g.addColorStop(0, '#fff6dc'); g.addColorStop(.25, '#ffb347'); g.addColorStop(.55, '#d2470e'); g.addColorStop(1, 'rgba(11,8,6,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    const shake = p > .8 && p < .9 ? (1 - seg(p, .8, .9)) * 16 : 0;
    st.wo.style.translate = shake ? `${((Math.random() - .5) * shake).toFixed(1)}px ${((Math.random() - .5) * shake).toFixed(1)}px` : '0 0';
    if (p >= .8 && st.prev < .8 && p - st.prev < .05) window.Sound.boom();
    st.prev = p;
  },
};

// ---------- The Odyssey: the voyage, stage by stage, painted like a red-figure vase ----------
// Scroll pans along a frieze of fourteen stages (after Homer, not the film). Each stage gets an equal slice of
// scroll and the camera dwells at its centre, where its moving moment plays. Story time is keyed separately, so the
// year counter crawls through the early stops and races through Calypso's seven years.
const STOPS = ['Troy', 'The Cicones', 'The Lotus-eaters', 'The Cyclops', 'Aeolus, the winds', 'The Laestrygonians', 'Circe', 'The Underworld', 'The Sirens', 'Scylla and Charybdis', 'Thrinacia, the cattle of the sun', 'Calypso, seven years', 'The Phaeacians', 'Ithaca'];
const VY_LINES = [
  'Troy falls to the wooden horse, his trick. He sails for Ithaca with twelve ships.',
  'He sacks Ismarus. His men linger to feast, and the Cicones strike back.',
  'Whoever eats the lotus forgets home. He drags his men back to the ships in tears.',
  'Trapped in the giant\'s cave, he calls himself Nobody, then blinds the Cyclops\'s one eye.',
  'The king of the winds seals the storms in a bag. In sight of Ithaca, the crew open it.',
  'Giants hurl rocks down from the cliffs. Every ship in the harbour is lost; only his escapes.',
  'The witch turns his men into pigs. He makes her turn them back, and stays a year.',
  'At the edge of the world he calls up the dead, to ask the prophet Tiresias the way home.',
  'Lashed to the mast, he hears the Sirens sing. His crew row on, ears stopped with wax.',
  'Between the six-headed monster and the whirlpool. Scylla takes six of his men.',
  'His starving crew kill the Sun\'s cattle. Zeus strikes the ship with lightning; only he survives.',
  'The nymph keeps him for seven years, until the gods order her to let him go. He leaves on a raft.',
  'Wrecked again, he reaches the Phaeacians, tells his story, and they sail him home asleep.',
  'Disguised as a beggar, he strings his own bow and shoots an arrow through twelve axes.',
];
// [camera position, years since Troy]: a year at Circe's, seven at Calypso's, ten in all
const VY_YEARS = [[0, 0], [1, .1], [2, .2], [3, .4], [3.6, .8], [4.4, .9], [5, 1.2], [5.6, 1.3], [6.4, 2.3], [7, 2.4], [8, 2.5], [9, 2.6], [10, 2.8], [10.6, 2.9], [11.4, 9.9], [12, 9.95], [13, 10]];
const VY_SKY = [[[38, 10, 12], [168, 62, 30]], [[30, 12, 18], [104, 46, 40]], [[58, 28, 50], [184, 108, 112]], [[14, 8, 12], [60, 34, 36]], [[28, 22, 38], [118, 96, 100]], [[24, 10, 14], [92, 42, 34]], [[20, 24, 26], [92, 84, 70]], [[4, 4, 8], [26, 28, 36]], [[38, 18, 42], [156, 92, 112]], [[18, 12, 20], [74, 52, 60]], [[72, 40, 18], [236, 176, 92]], [[40, 64, 84], [206, 186, 150]], [[26, 26, 56], [156, 112, 120]], [[64, 36, 30], [244, 176, 112]]];
const CLAY = '#e0713f', CLAY_D = '#a8492a', CREAM = '#f2e3d3', INK = '#140a0c', LAND = '#2a1216', LAND2 = '#3a1a1c';
const vyHash = (i) => { const v = Math.sin(i * 91.7) * 43758.5453; return v - Math.floor(v); };
// A red-figure person: round head, wedge torso, line limbs. pose: stand | sit | lie | arms up | bow
function vyFigure(ctx, x, y, h, c, pose = 'stand', t = 0) {
  ctx.save(); ctx.translate(x, y);
  if (pose === 'lie') ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = c; ctx.strokeStyle = c; ctx.lineCap = 'round'; ctx.lineWidth = h * .075;
  const sit = pose === 'sit';
  const hip = sit ? -h * .32 : -h * .48;
  ctx.beginPath(); ctx.arc(0, hip - h * .43, h * .085, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-h * .12, hip - h * .32); ctx.lineTo(h * .12, hip - h * .32); ctx.lineTo(h * .07, hip); ctx.lineTo(-h * .07, hip); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  if (sit) { ctx.moveTo(-h * .04, hip); ctx.lineTo(h * .2, hip); ctx.lineTo(h * .22, 0); ctx.moveTo(h * .04, hip); ctx.lineTo(h * .26, hip + h * .02); ctx.lineTo(h * .28, 0); }
  else { ctx.moveTo(-h * .04, hip); ctx.lineTo(-h * .09, 0); ctx.moveTo(h * .04, hip); ctx.lineTo(h * .09, 0); }
  if (pose === 'up') { ctx.moveTo(-h * .11, hip - h * .3); ctx.lineTo(-h * .2, hip - h * .62); ctx.moveTo(h * .11, hip - h * .3); ctx.lineTo(h * .2, hip - h * .62); }
  else if (pose === 'bow') { ctx.moveTo(-h * .11, hip - h * .28); ctx.lineTo(-h * .42, hip - h * .3); ctx.moveTo(h * .11, hip - h * .28); ctx.lineTo(-h * .12, hip - h * .26); }
  else { ctx.moveTo(-h * .11, hip - h * .3); ctx.lineTo(-h * .15, hip - h * .02 + Math.sin(t) * h * .02); ctx.moveTo(h * .11, hip - h * .3); ctx.lineTo(h * .15, hip - h * .02); }
  ctx.stroke(); ctx.restore();
}
function vyFill(ctx, pts, c) { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); }
function vyDisc(ctx, x, y, r, c) { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU); ctx.fillStyle = c; ctx.fill(); }
function vyRock(ctx, x, y, w, h, seed, c, edge) { // a lumpy island or cliff, base on the waterline
  const r = rng(seed), pts = [[x - w / 2, y]];
  for (let i = 0; i <= 10; i++) { const k = i / 10; pts.push([x - w / 2 + k * w, y - h * Math.sin(Math.PI * k) ** .7 * (.75 + r() * .3)]); }
  pts.push([x + w / 2, y]);
  vyFill(ctx, pts, c);
  if (edge) { ctx.strokeStyle = edge; ctx.lineWidth = 2; ctx.stroke(); }
}
function vyShip(ctx, mode, x, y, L, roll, t, tied, alpha) {
  if (mode === 'none' || alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(roll); ctx.scale(L, -L);
  ctx.lineWidth = 1.6 / L; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (mode === 'wreck') { // the keel and the mast, Odysseus clinging on
    vyFill(ctx, [[-.32, .01], [.3, .01], [.33, .04], [-.3, .045]], INK);
    ctx.strokeStyle = CLAY_D; ctx.lineWidth = 5 / L; ctx.beginPath(); ctx.moveTo(-.25, .06); ctx.lineTo(.2, .1); ctx.stroke();
    ctx.restore(); vyFigure(ctx, x + L * .02, y - L * .02, L * .12, CLAY, 'lie'); return;
  }
  if (mode === 'raft') {
    for (let i = 0; i < 6; i++) vyFill(ctx, [[-.16, .005 + i * .012], [.16, .005 + i * .012], [.16, .015 + i * .012], [-.16, .015 + i * .012]], i % 2 ? CLAY_D : '#7e3820');
    ctx.strokeStyle = INK; ctx.lineWidth = 3 / L; ctx.beginPath(); ctx.moveTo(0, .07); ctx.lineTo(0, .42); ctx.stroke();
    vyFill(ctx, [[-.12, .4], [.12, .4], [.14 + Math.sin(t) * .01, .17], [-.1, .17]], CREAM);
    ctx.restore(); vyFigure(ctx, x - L * .08, y - L * .07, L * .15, CLAY, 'sit'); return;
  }
  const ph = mode === 'phaeacian';
  const hull = ph ? '#c08a3a' : INK;
  ctx.beginPath(); ctx.moveTo(-.46, .2); ctx.quadraticCurveTo(-.5, .05, -.36, -.02); ctx.lineTo(.4, -.02); ctx.lineTo(.53, 0); ctx.lineTo(.42, .03);
  ctx.quadraticCurveTo(.47, .1, .45, .15); ctx.lineTo(.38, .07); ctx.lineTo(-.36, .07); ctx.quadraticCurveTo(-.44, .1, -.46, .2); ctx.closePath();
  ctx.fillStyle = hull; ctx.fill(); ctx.strokeStyle = ph ? '#7e5420' : CLAY; ctx.stroke();
  ctx.beginPath(); ctx.arc(-.445, .215, .026, Math.PI * .2, Math.PI * 1.9); ctx.stroke();
  ctx.strokeStyle = ph ? INK : CLAY; ctx.beginPath(); ctx.moveTo(-.36, .035); ctx.lineTo(.41, .035); ctx.stroke();
  vyDisc(ctx, .38, .045, .02, CREAM); vyDisc(ctx, .385, .045, .009, INK);
  // oars
  ctx.strokeStyle = ph ? '#7e5420' : CLAY_D; ctx.lineWidth = 2 / L;
  const n = ph ? 16 : 9, sp = ph ? 7 : 3.2;
  ctx.beginPath();
  for (let i = 0; i < n; i++) { const ox = -.28 + i * (.6 / (n - 1)), a = Math.sin(t * sp + i * .2) * .08; ctx.moveTo(ox, .02); ctx.lineTo(ox - .1 + a, -.11); }
  ctx.stroke();
  // crew heads
  if (!ph) for (let i = 0; i < 7; i++) vyDisc(ctx, -.24 + i * .075, .09, .016, CLAY);
  if (ph) vyFigure(ctx, -.05, .075, .2, CLAY, 'lie');
  // mast and sail
  ctx.strokeStyle = ph ? '#7e5420' : CLAY_D; ctx.lineWidth = 4 / L;
  ctx.beginPath(); ctx.moveTo(0, .07); ctx.lineTo(0, .56); ctx.moveTo(-.2, .52); ctx.lineTo(.2, .52); ctx.stroke();
  const bulge = .03 + Math.sin(t * 1.3) * .01;
  ctx.beginPath(); ctx.moveTo(-.19, .515); ctx.lineTo(.19, .515); ctx.quadraticCurveTo(.19 + bulge, .34, .17, .18); ctx.lineTo(-.17, .18); ctx.quadraticCurveTo(-.19 + bulge, .34, -.19, .515); ctx.closePath();
  ctx.fillStyle = CREAM; ctx.fill();
  ctx.strokeStyle = CLAY; ctx.lineWidth = 5 / L; ctx.beginPath();
  for (let i = -2; i <= 2; i++) { ctx.moveTo(i * .07, .5); ctx.lineTo(i * .07 + bulge * .5, .2); }
  ctx.stroke();
  ctx.restore();
  if (tied) { // Odysseus lashed to the mast
    vyFigure(ctx, x, y - L * .08, L * .2, CREAM, 'stand');
    ctx.strokeStyle = CLAY; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i < 3; i++) { ctx.moveTo(x - L * .03, y - L * (.16 + i * .035)); ctx.lineTo(x + L * .03, y - L * (.15 + i * .035)); }
    ctx.stroke();
  }
}

S.voyage = {
  init(el, st) {
    st.cv = el.querySelector('canvas');
    st.ctx = st.cv.getContext('2d');
    st.year = el.querySelector('#vy-year');
    st.stop = el.querySelector('#vy-stop');
    st.line = el.querySelector('#vy-line');
  },
  frame(p, t, el, st) {
    fit(st.cv);
    const { ctx } = st;
    const W = st.cv.width, H = st.cv.height, sc = W / Math.max(1, st.cv.clientWidth);
    const u = Math.min(H / 900, W / 900);
    // camera: equal slice per stage, dwelling at each centre
    const f = seg(p, .02, .97) * 13, fi = Math.min(12, Math.floor(f)), fr = f - fi;
    const cam = fi + fr - .55 * Math.sin(TAU * fr) / TAU;
    const near = Math.round(cam);
    if (st.pc !== undefined && cam - st.pc > 0 && cam - st.pc < .3) [4.05, 10.17].forEach((c0) => { if (st.pc < c0 && cam >= c0) window.Sound.thunder(); });
    st.pc = cam;
    const years = keyv(VY_YEARS, cam)[0];
    setText(st.year, String(Math.min(10, Math.floor(years + 1e-6))));
    setText(st.stop, STOPS[near]);
    setText(st.line, VY_LINES[near]);
    const y0 = Math.min(H * .7, H * .5 + 250 * u);
    const SP = Math.max(W * 1.15, 1250 * u);
    const lpOf = (i) => cam - i;
    // weather: the Aeolus storm, Zeus's thunderbolt, Calypso's seven years of days and nights
    const storm = Math.max(smooth(seg(cam, 3.95, 4.2)) * (1 - smooth(seg(cam, 4.55, 4.9))), smooth(seg(cam, 10.05, 10.18)) * (1 - smooth(seg(cam, 10.4, 10.8))), .35 * smooth(seg(cam, 8.7, 9)) * (1 - smooth(seg(cam, 9.2, 9.5))));
    const flash = Math.max(0, 1 - Math.abs(cam - 10.2) / .035);
    const cyc = c01((years - 2.9) / 7) * 7;
    const calW = Math.max(0, 1 - Math.abs(cam - 11) / .55);
    const day = .5 + .5 * Math.cos(TAU * cyc);
    // sky
    const sa = VY_SKY[fi], sb = VY_SKY[Math.min(13, fi + 1)];
    let top = mixc(sa[0], sb[0], fr), hor = mixc(sa[1], sb[1], fr);
    if (calW > 0) { top = mixc(top, mixc([6, 8, 22], [52, 88, 120], day), calW); hor = mixc(hor, mixc([22, 24, 48], [214, 196, 160], day), calW); }
    top = mixc(top, [10, 10, 16], storm * .8); hor = mixc(hor, [48, 46, 56], storm * .75);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const g = ctx.createLinearGradient(0, 0, 0, y0);
    g.addColorStop(0, rgba(top)); g.addColorStop(1, rgba(hor));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (calW > 0 && day < .5) { // stars on Calypso's nights
      ctx.fillStyle = `rgba(242,227,211,${((.5 - day) * 2 * calW).toFixed(3)})`;
      for (let i = 0; i < 80; i++) ctx.fillRect(vyHash(i) * W, vyHash(i + 99) * y0 * .9, 2 * u, 2 * u);
    }
    const lp = (i) => lpOf(i);
    const X = (i, k, dx) => W * .5 + (i - cam) * SP * k + dx * u;
    const shipX = W * .42, shipY = y0 + 62 * u, L = 300 * u;
    const ship = { x: shipX, y: shipY - 40 * u };
    // ---- the stages ----
    const D = [];
    D[0] = (i) => { // Troy burning, the horse on the shore
      const l = lp(i), fl = (k) => .8 + .3 * Math.sin(t * 9 + k * 2.1) * Math.sin(t * 5.3 + k);
      const gx = X(i, .6, 60), gl = ctx.createRadialGradient(gx, y0 - 140 * u, 0, gx, y0 - 140 * u, 560 * u);
      gl.addColorStop(0, `rgba(255,130,50,${(.45 * fl(0)).toFixed(3)})`); gl.addColorStop(1, 'rgba(255,130,50,0)');
      ctx.fillStyle = gl; ctx.fillRect(0, 0, W, y0);
      vyFill(ctx, [[X(i, .9, -560), y0], [X(i, .9, -420), y0 - 110 * u], [X(i, .9, -150), y0 - 170 * u], [X(i, .9, 220), y0 - 150 * u], [X(i, .9, 460), y0]], LAND);
      const wx0 = X(i, .9, -330), wx1 = X(i, .9, 200), wy = y0 - 165 * u;
      ctx.fillStyle = '#7a3420'; ctx.fillRect(wx0, wy - 90 * u, wx1 - wx0, 90 * u);
      [-330, -110, 120, 200].forEach((dx, k) => { ctx.fillRect(X(i, .9, dx) - 22 * u, wy - 150 * u, 44 * u, 150 * u); for (let c = 0; c < 3; c++) ctx.fillRect(X(i, .9, dx) - 22 * u + c * 17 * u, wy - 162 * u, 10 * u, 12 * u); });
      for (let c = 0; wx0 + c * 26 * u < wx1; c++) ctx.fillRect(wx0 + c * 26 * u, wy - 102 * u, 14 * u, 12 * u);
      ctx.strokeStyle = INK; ctx.lineWidth = 1.5 * u; ctx.beginPath();
      for (let r = 1; r < 6; r++) { ctx.moveTo(wx0, wy - r * 16 * u); ctx.lineTo(wx1, wy - r * 16 * u); } ctx.stroke();
      for (let k = 0; k < 9; k++) { // flames on the walls
        const fx = mix(wx0, wx1, k / 8), h = (60 + vyHash(k) * 70) * u * fl(k);
        vyFill(ctx, [[fx - 22 * u, wy - 88 * u], [fx - 8 * u, wy - 88 * u - h * .6], [fx + 3 * u * Math.sin(t * 7 + k), wy - 88 * u - h], [fx + 12 * u, wy - 88 * u - h * .5], [fx + 22 * u, wy - 88 * u]], CLAY);
        vyFill(ctx, [[fx - 10 * u, wy - 88 * u], [fx, wy - 88 * u - h * .55], [fx + 10 * u, wy - 88 * u]], '#ffc070');
        for (let s = 0; s < 4; s++) { const ph = (s / 4 + t * .12 + k * .13) % 1; vyDisc(ctx, fx - ph * 70 * u, wy - 90 * u - h - ph * 240 * u, (18 + ph * 54) * u, `rgba(30,14,16,${(.22 * (1 - ph)).toFixed(3)})`); }
      }
      // the wooden horse on its platform
      const hx = X(i, 1.05, 380), hy = y0 - 6 * u;
      ctx.fillStyle = '#9a5428';
      ctx.fillRect(hx - 90 * u, hy - 26 * u, 180 * u, 14 * u);
      [-70, -30, 30, 70].forEach((dx) => vyDisc(ctx, hx + dx * u, hy - 8 * u, 10 * u, INK));
      [-60, -40, 40, 60].forEach((dx) => ctx.fillRect(hx + dx * u - 7 * u, hy - 120 * u, 14 * u, 96 * u));
      ctx.beginPath(); ctx.ellipse(hx, hy - 135 * u, 95 * u, 40 * u, 0, 0, TAU); ctx.fill();
      vyFill(ctx, [[hx + 55 * u, hy - 150 * u], [hx + 85 * u, hy - 250 * u], [hx + 135 * u, hy - 240 * u], [hx + 130 * u, hy - 215 * u], [hx + 100 * u, hy - 210 * u], [hx + 90 * u, hy - 140 * u]], '#9a5428');
      vyFill(ctx, [[hx + 82 * u, hy - 246 * u], [hx + 90 * u, hy - 270 * u], [hx + 100 * u, hy - 248 * u]], '#9a5428');
      vyFill(ctx, [[hx - 92 * u, hy - 140 * u], [hx - 130 * u, hy - 90 * u + Math.sin(t * 2) * 4 * u], [hx - 118 * u, hy - 85 * u], [hx - 88 * u, hy - 125 * u]], '#9a5428');
      ctx.strokeStyle = INK; ctx.lineWidth = 1.4 * u; ctx.beginPath();
      for (let r = -2; r <= 2; r++) { ctx.moveTo(hx - 85 * u, hy - 135 * u + r * 12 * u); ctx.lineTo(hx + 85 * u, hy - 135 * u + r * 12 * u); } ctx.stroke();
      vyDisc(ctx, hx + 112 * u, hy - 236 * u, 4 * u, INK);
      void l;
    };
    D[1] = (i) => { // the Cicones march down to the shore
      const l = lp(i);
      vyRock(ctx, X(i, .7, -100), y0, 900 * u, 150 * u, 11, LAND);
      for (let k = 0; k < 6; k++) { const bx = X(i, .8, -40 + k * 34); ctx.fillStyle = '#6a2c1e'; ctx.fillRect(bx, y0 - (110 + vyHash(k + 3) * 50) * u, 30 * u, (110 + vyHash(k + 3) * 50) * u); }
      const adv = smooth(seg(l, -.6, .5)) * 160;
      for (let k = 0; k < 8; k++) {
        const fx = X(i, 1.05, 340 - k * 74 - adv), fy = y0 - 4 * u, h = 140 * u, bob = Math.abs(Math.sin(t * 4 + k)) * 4 * u;
        vyFigure(ctx, fx, fy - bob, h, CLAY, 'stand', t * 4 + k);
        ctx.strokeStyle = CLAY_D; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.moveTo(fx - 20 * u, fy - h * 1.15 - bob); ctx.lineTo(fx + 8 * u, fy - bob); ctx.stroke();
        vyDisc(ctx, fx + 14 * u, fy - h * .62 - bob, 30 * u, CLAY_D); vyDisc(ctx, fx + 14 * u, fy - h * .62 - bob, 22 * u, CLAY); vyDisc(ctx, fx + 14 * u, fy - h * .62 - bob, 7 * u, INK);
        vyFill(ctx, [[fx - 16 * u, fy - h * .96 - bob], [fx + 4 * u, fy - h * 1.12 - bob], [fx + 18 * u, fy - h * .96 - bob]], CLAY_D);
      }
    };
    D[2] = (i) => { // the Lotus-eaters: a shore of drowsing men and opening flowers
      const l = lp(i), open = .25 + .75 * smooth(seg(l, -.7, -.05));
      vyRock(ctx, X(i, .8, 0), y0, 1000 * u, 90 * u, 21, '#4a2232');
      for (let k = 0; k < 4; k++) vyFigure(ctx, X(i, .95, -260 + k * 150), y0 - 14 * u, 110 * u, '#d9897a', 'lie');
      for (let k = 0; k < 7; k++) {
        const bx = X(i, 1.2, -460 + k * 150), sway = Math.sin(t * .9 + k) * 18 * u, top = y0 - (180 + vyHash(k) * 120) * u;
        ctx.strokeStyle = '#6a7a4a'; ctx.lineWidth = 5 * u; ctx.beginPath(); ctx.moveTo(bx, y0 + 30 * u); ctx.quadraticCurveTo(bx + sway, (top + y0) / 2, bx + sway * 1.5, top); ctx.stroke();
        for (let pt = 0; pt < 7; pt++) {
          const a = -Math.PI / 2 + (pt - 3) * .32 * open;
          ctx.save(); ctx.translate(bx + sway * 1.5, top); ctx.rotate(a + Math.PI / 2);
          ctx.beginPath(); ctx.ellipse(0, -28 * u, 11 * u, 30 * u, 0, 0, TAU); ctx.fillStyle = pt % 2 ? '#f0b3b0' : '#e8928e'; ctx.fill(); ctx.restore();
        }
      }
      ctx.fillStyle = `rgba(240,180,190,${(.12 + .06 * Math.sin(t)).toFixed(3)})`; ctx.fillRect(0, 0, W, y0 + 20 * u);
    };
    D[3] = (i) => { // Polyphemus: the cave, the one eye that follows the ship, the blinding, the boulder
      const l = lp(i);
      vyRock(ctx, X(i, .9, -40), y0, 1000 * u, 430 * u, 31, LAND2, CLAY_D);
      const ex = X(i, .9, -40), ey = y0 - 190 * u;
      ctx.beginPath(); ctx.ellipse(ex, ey + 40 * u, 170 * u, 150 * u, 0, Math.PI, TAU); ctx.lineTo(ex + 170 * u, y0); ctx.lineTo(ex - 170 * u, y0); ctx.closePath(); ctx.fillStyle = '#080406'; ctx.fill();
      const blind = smooth(seg(l, -.04, .06)), open = smooth(seg(l, -.75, -.35)) * (1 - blind);
      if (open > .01) {
        ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, 80 * u, 46 * u * open, 0, 0, TAU); ctx.clip();
        ctx.fillStyle = CREAM; ctx.fillRect(ex - 90 * u, ey - 50 * u, 180 * u, 100 * u);
        const dx = ship.x - ex, dy = ship.y - ey, dl = Math.hypot(dx, dy) || 1, k = Math.min(36 * u, dl * .1);
        vyDisc(ctx, ex + dx / dl * k, ey + dy / dl * k * .6, 30 * u, CLAY); vyDisc(ctx, ex + dx / dl * k, ey + dy / dl * k * .6, 13 * u, INK);
        ctx.restore();
        ctx.strokeStyle = CLAY; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.ellipse(ex, ey, 80 * u, 46 * u * open, 0, 0, TAU); ctx.stroke();
      }
      if (l > -.2 && l < .08) { // the burning stake
        const k = smooth(seg(l, -.2, -.03));
        ctx.strokeStyle = '#7e3820'; ctx.lineWidth = 12 * u; ctx.beginPath(); ctx.moveTo(ex + mix(320, 70, k) * u, ey + mix(140, 20, k) * u); ctx.lineTo(ex + mix(520, 270, k) * u, ey + mix(230, 110, k) * u); ctx.stroke();
        vyDisc(ctx, ex + mix(320, 70, k) * u, ey + mix(140, 20, k) * u, 14 * u, '#ffb050');
      }
      if (blind > 0) { const gl = ctx.createRadialGradient(ex, ey, 0, ex, ey, 160 * u); gl.addColorStop(0, `rgba(220,40,20,${(.6 * blind * (1 - seg(l, .3, .6))).toFixed(3)})`); gl.addColorStop(1, 'rgba(220,40,20,0)'); ctx.fillStyle = gl; ctx.fillRect(ex - 160 * u, ey - 160 * u, 320 * u, 320 * u); ctx.strokeStyle = '#c03018'; ctx.lineWidth = 6 * u; ctx.beginPath(); ctx.moveTo(ex - 80 * u, ey); ctx.lineTo(ex + 80 * u, ey); ctx.stroke(); }
      for (let k = 0; k < 6; k++) { const sx = X(i, 1.05, 160 + k * 52), sy = y0 - 18 * u; ctx.beginPath(); ctx.ellipse(sx, sy, 24 * u, 15 * u, 0, 0, TAU); ctx.fillStyle = CREAM; ctx.fill(); vyDisc(ctx, sx + 22 * u, sy - 6 * u, 7 * u, INK); }
      const bk = seg(l, .12, .5); // the boulder thrown after him
      if (bk > 0 && bk < 1) { const bx = mix(ex + 60 * u, ship.x + 230 * u, bk), by = mix(y0 - 420 * u, y0 + 20 * u, bk) - Math.sin(Math.PI * bk) * 160 * u; vyDisc(ctx, bx, by, 34 * u, '#4a2a22'); ctx.strokeStyle = CLAY_D; ctx.lineWidth = 2 * u; ctx.stroke(); }
      const sk = seg(l, .5, .75);
      if (sk > 0 && sk < 1) { const sx = ship.x + 230 * u, hgt = Math.sin(Math.PI * sk) * 200 * u; vyFill(ctx, [[sx - 40 * u, y0 + 30 * u], [sx - 18 * u, y0 + 30 * u - hgt], [sx + 4 * u, y0 + 30 * u - hgt * .8], [sx + 22 * u, y0 + 30 * u - hgt * .95], [sx + 44 * u, y0 + 30 * u]], CREAM); }
    };
    D[4] = (i) => { // Aeolus: the floating island, the winds let out of the bag
      const l = lp(i), ix = X(i, .55, 120), iy = y0 - 330 * u + Math.sin(t * .6) * 8 * u;
      vyFill(ctx, [[ix - 170 * u, iy], [ix + 170 * u, iy], [ix + 60 * u, iy + 120 * u], [ix - 30 * u, iy + 150 * u], [ix - 110 * u, iy + 80 * u]], LAND2);
      ctx.fillStyle = '#c9933e'; ctx.fillRect(ix - 150 * u, iy - 50 * u, 300 * u, 50 * u);
      ctx.strokeStyle = '#6a4818'; ctx.lineWidth = 2 * u; ctx.beginPath(); for (let k = 1; k < 10; k++) { ctx.moveTo(ix - 150 * u + k * 30 * u, iy - 50 * u); ctx.lineTo(ix - 150 * u + k * 30 * u, iy); } ctx.stroke();
      const home = 1 - smooth(seg(l, -.15, .1)); // Ithaca's lights on the horizon, then gone
      if (home > 0) { ctx.fillStyle = `rgba(60,30,30,${home.toFixed(3)})`; ctx.fillRect(X(i, .3, 260), y0 - 10 * u, 260 * u, 10 * u); for (let k = 0; k < 7; k++) vyDisc(ctx, X(i, .3, 280 + k * 34), y0 - 13 * u, 3 * u, `rgba(255,200,120,${(home * (.6 + .4 * Math.sin(t * 3 + k))).toFixed(3)})`); }
      if (l < .05) { const bx = ship.x - 70 * u, by = ship.y - 20 * u; ctx.beginPath(); ctx.ellipse(bx, by, 26 * u, 20 * u, 0, 0, TAU); ctx.fillStyle = '#8a4a26'; ctx.fill(); vyFill(ctx, [[bx - 8 * u, by - 18 * u], [bx + 8 * u, by - 18 * u], [bx, by - 30 * u]], '#8a4a26'); }
      const n = 9 + Math.round(storm * 9);
      ctx.strokeStyle = `rgba(242,227,211,${(.25 + .45 * storm).toFixed(3)})`; ctx.lineWidth = (2 + storm * 2) * u;
      for (let k = 0; k < n; k++) { // spiralling winds
        const R = (30 + vyHash(k) * 40) * u * (1 + storm), cx0 = ((vyHash(k + 5) * W + t * (60 + storm * 400) * u * (1 + vyHash(k))) % (W + 2 * R)) - R, cy0 = (vyHash(k + 9) * .8) * y0;
        ctx.beginPath();
        for (let a = 0; a < 4 * Math.PI; a += .25) { const rr = R * (1 - a / (4 * Math.PI)); ctx.lineTo(cx0 + Math.cos(a + t * 2) * rr, cy0 + Math.sin(a + t * 2) * rr * .6); }
        ctx.stroke();
      }
    };
    D[5] = (i) => { // the Laestrygonians: giants on the cliffs, rocks into the harbour
      const l = lp(i);
      vyFill(ctx, [[X(i, 1, -620), y0], [X(i, 1, -600), y0 - 300 * u], [X(i, 1, -300), y0 - 320 * u], [X(i, 1, -170), y0 - 220 * u], [X(i, 1, -150), y0]], LAND2);
      vyFill(ctx, [[X(i, 1, 160), y0], [X(i, 1, 190), y0 - 290 * u], [X(i, 1, 420), y0 - 310 * u], [X(i, 1, 640), y0 - 270 * u], [X(i, 1, 660), y0]], LAND2);
      [[-380, -318], [330, -308]].forEach(([dx, gy], k) => {
        const gx = X(i, 1, dx), ty = y0 + gy * u, h = 230 * u;
        vyFigure(ctx, gx, ty, h, CLAY_D, 'up');
        const thr = seg(l, -.55 + k * .3, -.25 + k * .3);
        if (thr < .05) vyDisc(ctx, gx, ty - h * 1.08, 34 * u, '#4a2a22');
      });
      const ships = [[-60, .9], [10, .85], [80, .9]];
      ships.forEach(([dx, kk], j) => {
        const sx = X(i, kk, dx), hit = seg(l, -.4 + j * .22, -.12 + j * .22), sink = seg(l, -.12 + j * .22, .3 + j * .22);
        ctx.save(); ctx.translate(sx, y0 + 6 * u + sink * 30 * u); ctx.rotate(sink * .6 * (j % 2 ? 1 : -1)); ctx.globalAlpha = 1 - sink;
        vyFill(ctx, [[-36 * u, 0], [36 * u, 0], [44 * u, -14 * u], [-40 * u, -12 * u]], INK); ctx.fillStyle = CREAM; ctx.fillRect(-2 * u, -60 * u, 3 * u, 48 * u); ctx.fillRect(-14 * u, -56 * u, 26 * u, 22 * u);
        ctx.restore();
        if (hit > 0 && hit < 1) { const gx = X(i, 1, j % 2 ? 330 : -380), bx = mix(gx, sx, hit), by = mix(y0 - 570 * u, y0, hit * hit); vyDisc(ctx, bx, by, 26 * u, '#4a2a22'); }
        const sp = seg(l, -.12 + j * .22, .08 + j * .22);
        if (sp > 0 && sp < 1) vyFill(ctx, [[sx - 30 * u, y0], [sx - 10 * u, y0 - Math.sin(Math.PI * sp) * 150 * u], [sx + 12 * u, y0 - Math.sin(Math.PI * sp) * 120 * u], [sx + 30 * u, y0]], CREAM);
      });
    };
    D[6] = (i) => { // Circe's island: her house in the trees, men turning into pigs
      const l = lp(i);
      vyRock(ctx, X(i, .85, 0), y0, 1100 * u, 220 * u, 61, '#22261c');
      for (let k = 0; k < 9; k++) { const tx = X(i, .85, -420 + k * 100 + vyHash(k) * 40), th = (120 + vyHash(k + 1) * 90) * u, ty = y0 - 150 * u * Math.sin(Math.PI * (k + .5) / 9) ** .7; ctx.beginPath(); ctx.ellipse(tx, ty - th / 2, 22 * u, th / 2, 0, 0, TAU); ctx.fillStyle = k % 2 ? '#3c4a2c' : '#2e3a22'; ctx.fill(); }
      const hx = X(i, .85, 40), hy = y0 - 175 * u;
      ctx.fillStyle = '#b89a78'; ctx.fillRect(hx - 60 * u, hy - 60 * u, 120 * u, 60 * u); vyFill(ctx, [[hx - 72 * u, hy - 60 * u], [hx, hy - 100 * u], [hx + 72 * u, hy - 60 * u]], CLAY_D);
      ctx.fillStyle = INK; ctx.fillRect(hx - 12 * u, hy - 34 * u, 24 * u, 34 * u);
      for (let s = 0; s < 6; s++) { const ph = (s / 6 + t * .08) % 1; vyDisc(ctx, hx + 40 * u + Math.sin(ph * 6) * 14 * u, hy - 100 * u - ph * 200 * u, (6 + ph * 18) * u, `rgba(220,210,200,${(.35 * (1 - ph)).toFixed(3)})`); }
      vyFigure(ctx, X(i, 1.05, 170), y0 - 4 * u, 150 * u, CREAM, 'stand'); // Circe, with her wand
      ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.moveTo(X(i, 1.05, 182), y0 - 80 * u); ctx.lineTo(X(i, 1.05, 240), y0 - 150 * u); ctx.stroke();
      vyDisc(ctx, X(i, 1.05, 240), y0 - 150 * u, (5 + 3 * Math.sin(t * 6)) * u, '#fff0b0');
      const turn = smooth(seg(l, -.5, .05));
      for (let k = 0; k < 4; k++) {
        const mx = X(i, 1.05, -60 - k * 85 + Math.sin(t * 2 + k) * 6), my = y0 - 4 * u;
        ctx.globalAlpha = 1 - turn; vyFigure(ctx, mx, my, 120 * u, CLAY);
        ctx.globalAlpha = turn;
        ctx.beginPath(); ctx.ellipse(mx, my - 26 * u, 38 * u, 22 * u, 0, 0, TAU); ctx.fillStyle = '#d98a7a'; ctx.fill();
        vyDisc(ctx, mx + 38 * u, my - 30 * u, 12 * u, '#d98a7a'); ctx.fillStyle = '#d98a7a';
        [-22, -8, 10, 24].forEach((dx, j) => ctx.fillRect(mx + dx * u + Math.sin(t * 8 + j) * 2 * u, my - 10 * u, 7 * u, 10 * u));
        ctx.globalAlpha = 1;
      }
    };
    D[7] = (i) => { // the Underworld: the shades rise to the trench
      const l = lp(i), px = X(i, 1, 40);
      ctx.fillStyle = '#16141a'; ctx.fillRect(0, y0 - 40 * u, W, 60 * u);
      for (let k = 0; k < 30; k++) { const ax = X(i, 1.1, -600 + k * 42), ah = (30 + vyHash(k) * 40) * u; ctx.strokeStyle = '#8a8a90'; ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.moveTo(ax, y0 - 20 * u); ctx.lineTo(ax + 4 * u, y0 - 20 * u - ah); ctx.stroke(); vyDisc(ctx, ax + 4 * u, y0 - 20 * u - ah, 4 * u, '#d8d4dc'); }
      const gl = ctx.createRadialGradient(px, y0 - 20 * u, 0, px, y0 - 20 * u, 120 * u); gl.addColorStop(0, 'rgba(150,20,20,.8)'); gl.addColorStop(1, 'rgba(150,20,20,0)'); ctx.fillStyle = gl; ctx.fillRect(px - 120 * u, y0 - 140 * u, 240 * u, 160 * u);
      ctx.beginPath(); ctx.ellipse(px, y0 - 20 * u, 70 * u, 12 * u, 0, 0, TAU); ctx.fillStyle = '#3a0608'; ctx.fill();
      const rise = smooth(seg(l, -.8, .1));
      for (let k = 0; k < 14; k++) {
        const hx = X(i, 1, -520 + k * 80 + Math.sin(t * .7 + k) * 20), base = y0 - 30 * u, hh = (110 + vyHash(k) * 60) * u, up = rise * (40 + vyHash(k + 2) * 120) * u;
        const drift = (px - hx) * .25 * rise, gx = hx + drift, gy = base - up;
        ctx.fillStyle = `rgba(214,220,232,${(.18 + .3 * rise).toFixed(3)})`;
        ctx.beginPath(); ctx.moveTo(gx - 18 * u, gy - hh * .7); ctx.quadraticCurveTo(gx - 26 * u, gy - hh * .2, gx + Math.sin(t * 2 + k) * 14 * u, gy); ctx.quadraticCurveTo(gx + 26 * u, gy - hh * .2, gx + 18 * u, gy - hh * .7); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.arc(gx, gy - hh * .78, 16 * u, 0, TAU); ctx.fill();
        vyDisc(ctx, gx - 6 * u, gy - hh * .8, 3 * u, '#000'); vyDisc(ctx, gx + 6 * u, gy - hh * .8, 3 * u, '#000');
      }
      const tx = X(i, 1, 190); vyFigure(ctx, tx, y0 - 30 * u - rise * 30 * u, 190 * u, `rgba(232,236,244,${(.35 + .4 * rise).toFixed(3)})`, 'stand');
      ctx.strokeStyle = `rgba(232,236,244,${(.4 + .4 * rise).toFixed(3)})`; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.moveTo(tx + 30 * u, y0 - 30 * u - rise * 30 * u); ctx.lineTo(tx + 34 * u, y0 - 230 * u - rise * 30 * u); ctx.stroke();
    };
    D[8] = (i) => { // the Sirens on their rock, the song spreading out over the water
      const l = lp(i), rx = X(i, 1, 220);
      vyRock(ctx, rx, y0, 520 * u, 170 * u, 81, LAND2, CLAY_D);
      for (let k = 0; k < 7; k++) { ctx.strokeStyle = CREAM; ctx.lineWidth = 3 * u; ctx.beginPath(); const bx = rx - 160 * u + k * 46 * u, by = y0 - 20 * u - vyHash(k) * 20 * u; ctx.moveTo(bx, by); ctx.lineTo(bx + 18 * u, by - 6 * u); ctx.stroke(); }
      [[-120, -150], [0, -175], [120, -140]].forEach(([dx, dy], k) => {
        const sx = rx + dx * u, sy = y0 + dy * u;
        ctx.beginPath(); ctx.ellipse(sx, sy, 36 * u, 24 * u, -.2, 0, TAU); ctx.fillStyle = CLAY; ctx.fill();
        const wing = Math.sin(t * 2 + k) * .2;
        vyFill(ctx, [[sx - 10 * u, sy - 10 * u], [sx - 70 * u, sy - 50 * u - wing * 60 * u], [sx - 30 * u, sy + 6 * u]], CLAY_D);
        vyFill(ctx, [[sx + 30 * u, sy + 4 * u], [sx + 62 * u, sy + 14 * u], [sx + 30 * u, sy + 18 * u]], CLAY_D);
        vyDisc(ctx, sx - 30 * u, sy - 34 * u, 16 * u, CREAM); ctx.beginPath(); ctx.arc(sx - 30 * u, sy - 38 * u, 17 * u, Math.PI, TAU); ctx.fillStyle = INK; ctx.fill();
        for (let w = 0; w < 4; w++) { // the song
          const ph = (w / 4 + t * .35 + k * .1) % 1, R = (40 + ph * 520) * u;
          ctx.strokeStyle = `rgba(242,227,211,${(.35 * (1 - ph) * smooth(seg(l, -.8, -.2))).toFixed(3)})`; ctx.lineWidth = 2 * u;
          ctx.beginPath(); ctx.arc(sx - 30 * u, sy - 34 * u, R, Math.PI * .6, Math.PI * 1.15); ctx.stroke();
        }
      });
    };
    D[9] = (i) => { // Scylla's six necks above, Charybdis turning below
      const l = lp(i), cx0 = X(i, 1, -300), cy0 = y0 - 380 * u;
      vyFill(ctx, [[X(i, 1, -700), y0], [X(i, 1, -660), y0 - 520 * u], [X(i, 1, -200), y0 - 470 * u], [X(i, 1, -120), y0]], LAND2);
      ctx.beginPath(); ctx.ellipse(cx0, cy0, 70 * u, 50 * u, 0, 0, TAU); ctx.fillStyle = '#080406'; ctx.fill();
      const strike = Math.max(0, 1 - Math.abs(l + .05) / .35);
      for (let k = 0; k < 6; k++) {
        const a = (k - 2.5) * .3 + Math.sin(t * 1.6 + k * 1.3) * .25, reach = (170 + k * 18) * u;
        const hx = mix(cx0 + Math.cos(a) * reach + 140 * u, ship.x - 40 * u + k * 22 * u, strike * .85), hy = mix(cy0 + Math.sin(a) * reach * .8, ship.y - 40 * u, strike * .85);
        ctx.strokeStyle = CLAY_D; ctx.lineWidth = 16 * u; ctx.beginPath(); ctx.moveTo(cx0, cy0); ctx.quadraticCurveTo(cx0 + 120 * u, cy0 - 120 * u + k * 30 * u, hx, hy); ctx.stroke();
        ctx.strokeStyle = CLAY; ctx.lineWidth = 8 * u; ctx.stroke();
        const jaw = .3 + .25 * Math.sin(t * 7 + k);
        ctx.save(); ctx.translate(hx, hy); ctx.rotate(.4);
        vyFill(ctx, [[-22 * u, -10 * u], [26 * u, -6 * u - jaw * 14 * u], [6 * u, 0], [26 * u, 6 * u + jaw * 14 * u], [-22 * u, 10 * u]], CLAY);
        vyDisc(ctx, -6 * u, -5 * u, 4 * u, INK); ctx.restore();
      }
      const wx = X(i, 1, 320), wy = y0 + 30 * u; // Charybdis
      ctx.save(); ctx.translate(wx, wy); ctx.scale(1, .3);
      for (let k = 0; k < 7; k++) { ctx.strokeStyle = `rgba(242,227,211,${(.15 + k * .07).toFixed(3)})`; ctx.lineWidth = 4 * u; ctx.beginPath(); ctx.arc(0, 0, (230 - k * 30) * u, t * (1 + k * .4) + k, t * (1 + k * .4) + k + 4.4); ctx.stroke(); }
      vyDisc(ctx, 0, 0, 40 * u, '#05030a'); ctx.restore();
      ctx.strokeStyle = '#3c4a2c'; ctx.lineWidth = 8 * u; ctx.beginPath(); ctx.moveTo(wx + 200 * u, y0 - 60 * u); ctx.quadraticCurveTo(wx + 180 * u, y0 - 140 * u, wx + 140 * u, y0 - 170 * u); ctx.stroke(); vyDisc(ctx, wx + 140 * u, y0 - 180 * u, 36 * u, '#3c4a2c');
      vyRock(ctx, wx + 220 * u, y0, 240 * u, 80 * u, 91, LAND2);
    };
    D[10] = (i) => { // Thrinacia: the Sun's cattle, then Zeus's thunderbolt
      const l = lp(i), sx = X(i, .35, 300), sy = y0 - 340 * u;
      const dim = smooth(seg(l, .05, .18));
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(t * .1);
      ctx.strokeStyle = `rgba(255,200,90,${(.8 * (1 - dim)).toFixed(3)})`; ctx.lineWidth = 6 * u; ctx.beginPath();
      for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; ctx.moveTo(Math.cos(a) * 110 * u, Math.sin(a) * 110 * u); ctx.lineTo(Math.cos(a) * 160 * u, Math.sin(a) * 160 * u); }
      ctx.stroke(); ctx.restore();
      vyDisc(ctx, sx, sy, 90 * u, `rgba(255,196,80,${(1 - dim * .7).toFixed(3)})`);
      vyRock(ctx, X(i, .9, 0), y0, 1100 * u, 160 * u, 101, '#4a3a1c');
      for (let k = 0; k < 7; k++) {
        const cx1 = X(i, 1.02, -380 + k * 110), cy1 = y0 - 8 * u, graze = Math.sin(t * 1.5 + k) * 3 * u;
        ctx.beginPath(); ctx.ellipse(cx1, cy1 - 40 * u, 48 * u, 24 * u, 0, 0, TAU); ctx.fillStyle = k % 3 ? CLAY : CLAY_D; ctx.fill();
        ctx.fillStyle = ctx.fillStyle; [-34, -18, 20, 34].forEach((dx) => ctx.fillRect(cx1 + dx * u - 4 * u, cy1 - 24 * u, 8 * u, 24 * u));
        vyDisc(ctx, cx1 + 54 * u, cy1 - 28 * u + graze, 15 * u, k % 3 ? CLAY : CLAY_D);
        ctx.strokeStyle = CREAM; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.arc(cx1 + 54 * u, cy1 - 44 * u + graze, 14 * u, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      }
      if (l > .12 && l < .3) { // the bolt
        const r = rng(7 + Math.floor(t * 12)); ctx.strokeStyle = '#fff6d8'; ctx.lineWidth = 6 * u; ctx.beginPath();
        let bx = ship.x + 60 * u, by = 0; ctx.moveTo(bx, by);
        while (by < ship.y - 120 * u) { by += 50 * u; bx += (r() - .5) * 80 * u; ctx.lineTo(bx, by); }
        ctx.lineTo(ship.x, ship.y - 100 * u); ctx.stroke();
      }
    };
    D[11] = (i) => { // Calypso's island: seven years of days and nights, then the raft
      const l = lp(i);
      if (calW > 0) {
        const sunX = W * (.08 + .84 * ((cyc % 1) * 2 % 1)), up = Math.sin(Math.PI * ((cyc % 1) * 2 % 1));
        if ((cyc % 1) < .5) vyDisc(ctx, sunX, y0 - up * 360 * u, 44 * u, `rgba(255,214,120,${calW.toFixed(3)})`);
        else { vyDisc(ctx, sunX, y0 - up * 360 * u, 34 * u, `rgba(242,232,214,${calW.toFixed(3)})`); vyDisc(ctx, sunX + 12 * u, y0 - up * 360 * u - 6 * u, 30 * u, rgba(mixc([6, 8, 22], [52, 88, 120], day), calW)); }
      }
      vyRock(ctx, X(i, .9, 40), y0, 1150 * u, 260 * u, 111, '#1e3020');
      for (let k = 0; k < 10; k++) { const tx = X(i, .9, -470 + k * 105), th = (140 + vyHash(k + 4) * 120) * u, ty = y0 - 190 * u * Math.sin(Math.PI * (k + .5) / 10) ** .6; ctx.strokeStyle = '#5a3a20'; ctx.lineWidth = 6 * u; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + 10 * u, ty - th / 2, tx + 4 * u, ty - th); ctx.stroke(); for (let fz = 0; fz < 5; fz++) { const a = -Math.PI / 2 + (fz - 2) * .55 + Math.sin(t + k) * .05; ctx.beginPath(); ctx.ellipse(tx + 4 * u + Math.cos(a) * 40 * u, ty - th + Math.sin(a) * 26 * u + 18 * u, 46 * u, 10 * u, a, 0, TAU); ctx.fillStyle = '#2f5a30'; ctx.fill(); } }
      const cvx = X(i, .9, 140); ctx.beginPath(); ctx.ellipse(cvx, y0 - 70 * u, 70 * u, 70 * u, 0, Math.PI, TAU); ctx.fillStyle = '#0c0806'; ctx.fill();
      const fire = ctx.createRadialGradient(cvx, y0 - 30 * u, 0, cvx, y0 - 30 * u, 60 * u); fire.addColorStop(0, 'rgba(255,170,70,.7)'); fire.addColorStop(1, 'rgba(255,170,70,0)'); ctx.fillStyle = fire; ctx.fillRect(cvx - 60 * u, y0 - 90 * u, 120 * u, 90 * u);
      vyFigure(ctx, cvx - 90 * u, y0 - 6 * u, 150 * u, CREAM, 'stand');
      if (l < .35) vyFigure(ctx, X(i, 1.05, -200), y0 + 6 * u, 130 * u, CLAY, 'sit'); // Odysseus on the shore, looking out to sea
    };
    D[12] = (i) => { // Scheria, the Phaeacians' palace; their ship runs like a falcon
      const l = lp(i), px = X(i, .6, 120);
      vyRock(ctx, px, y0, 900 * u, 200 * u, 121, LAND2);
      ctx.fillStyle = '#d9b26a'; ctx.fillRect(px - 120 * u, y0 - 250 * u, 240 * u, 18 * u); vyFill(ctx, [[px - 130 * u, y0 - 250 * u], [px, y0 - 300 * u], [px + 130 * u, y0 - 250 * u]], '#d9b26a');
      for (let k = 0; k < 7; k++) ctx.fillRect(px - 110 * u + k * 35 * u, y0 - 232 * u, 12 * u, 70 * u);
      ctx.fillRect(px - 130 * u, y0 - 166 * u, 260 * u, 12 * u);
      ctx.strokeStyle = 'rgba(242,227,211,.35)'; ctx.lineWidth = 2 * u; ctx.beginPath();
      for (let k = 0; k < 12; k++) { const yy = y0 + (14 + vyHash(k) * 120) * u, xx = ((vyHash(k + 3) * W - t * 900 * u) % W + W) % W; ctx.moveTo(xx, yy); ctx.lineTo(xx + 140 * u, yy); } ctx.stroke();
      void l;
    };
    D[13] = (i) => { // Ithaca: the olive tree, the palace, an arrow through twelve axes
      const l = lp(i), ix = X(i, .8, 60);
      vyRock(ctx, ix, y0, 1100 * u, 240 * u, 131, '#3a2a1a');
      ctx.fillStyle = '#c9a88a'; ctx.fillRect(ix + 60 * u, y0 - 300 * u, 200 * u, 90 * u); vyFill(ctx, [[ix + 50 * u, y0 - 300 * u], [ix + 160 * u, y0 - 340 * u], [ix + 270 * u, y0 - 300 * u]], CLAY_D);
      ctx.strokeStyle = '#4a3020'; ctx.lineWidth = 16 * u; ctx.beginPath(); ctx.moveTo(ix - 160 * u, y0 - 170 * u); ctx.bezierCurveTo(ix - 190 * u, y0 - 240 * u, ix - 130 * u, y0 - 270 * u, ix - 160 * u, y0 - 330 * u); ctx.stroke();
      for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; ctx.beginPath(); ctx.ellipse(ix - 160 * u + Math.cos(a) * 70 * u, y0 - 360 * u + Math.sin(a) * 40 * u, 50 * u, 24 * u, a, 0, TAU); ctx.fillStyle = k % 2 ? '#6e7a50' : '#5a6640'; ctx.fill(); }
      const ay = y0 - 120 * u, ax0 = X(i, 1.1, -180);
      for (let k = 0; k < 12; k++) { // twelve axe heads in a line, their rings aligned
        const ax = ax0 + k * 34 * u;
        ctx.strokeStyle = '#5a3a20'; ctx.lineWidth = 5 * u; ctx.beginPath(); ctx.moveTo(ax, ay + 10 * u); ctx.lineTo(ax, y0 + 10 * u); ctx.stroke();
        vyFill(ctx, [[ax - 16 * u, ay - 14 * u], [ax + 16 * u, ay - 14 * u], [ax + 22 * u, ay + 12 * u], [ax - 22 * u, ay + 12 * u]], '#9aa0a6');
        vyDisc(ctx, ax, ay, 7 * u, rgba(hor));
      }
      const bx = ax0 - 150 * u;
      vyFigure(ctx, bx, y0 + 10 * u, 160 * u, CLAY, 'bow');
      ctx.strokeStyle = '#7e3820'; ctx.lineWidth = 4 * u; ctx.beginPath(); ctx.arc(bx - 66 * u, y0 - 110 * u, 70 * u, -1.1, 1.1); ctx.stroke();
      const ak = smooth(seg(l, -.45, .2));
      if (ak > 0 && ak < 1) {
        const arx = mix(bx - 20 * u, ax0 + 12 * 34 * u + 260 * u, ak);
        ctx.strokeStyle = CREAM; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.moveTo(arx - 60 * u, ay); ctx.lineTo(arx, ay); ctx.stroke();
        vyFill(ctx, [[arx, ay - 6 * u], [arx + 14 * u, ay], [arx, ay + 6 * u]], CREAM);
        ctx.strokeStyle = 'rgba(242,227,211,.3)'; ctx.beginPath(); ctx.moveTo(bx, ay); ctx.lineTo(arx - 60 * u, ay); ctx.stroke();
      }
    };
    for (let i = Math.max(0, near - 1); i <= Math.min(13, near + 1); i++) D[i](i);
    // ---- the sea, in rows of running waves; the ship rides between them ----
    const amp = 1 + storm * 2.4;
    const waveRow = (yb, a, per, k, col, curls) => {
      const off = cam * SP * k + t * 30 * u * k;
      ctx.beginPath(); ctx.moveTo(0, H);
      const pts = [];
      for (let x = 0; x <= W + 8; x += 8) { const ph = ((x + off) / (per * u)) % 1, cr = 1 - Math.abs(Math.sin(Math.PI * (ph < 0 ? ph + 1 : ph))); const y = yb - a * u * amp * cr ** 2; ctx.lineTo(x, y); pts.push(x, y); }
      ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
      if (curls) {
        ctx.strokeStyle = curls; ctx.lineWidth = 2.4 * u; ctx.beginPath();
        const pw = per * u, r = a * u * amp * .45, cy1 = yb - a * u * amp * .55;
        for (let n = Math.floor(off / pw) - 1; (n + .5) * pw - off < W + pw; n++) {
          const x1 = (n + .5) * pw - off;
          ctx.moveTo(x1 + r, cy1); ctx.arc(x1, cy1, r, 0, Math.PI * 1.6); ctx.moveTo(x1 + r * .5, cy1); ctx.arc(x1, cy1, r * .5, 0, Math.PI * 1.4);
        }
        ctx.stroke();
      }
    };
    const seaTop = mixc(mixc([70, 22, 34], hor, .25), [20, 20, 28], storm * .5);
    waveRow(y0 + 16 * u, 10, 120, .8, rgba(seaTop), null);
    waveRow(y0 + 56 * u, 16, 170, 1.05, rgba(mixc(seaTop, [16, 6, 10], .35)), rgba(mixc(seaTop, [242, 227, 211], .35), .55));
    // the ship (or what is left of it)
    let mode = 'ship';
    if (cam > 10.21) mode = 'wreck';
    if (cam > 10.75) mode = 'none';
    if (cam > 11.32) mode = 'raft';
    if (cam > 11.6) mode = 'phaeacian';
    const shipA = 1 - smooth(seg(cam, 12.55, 12.85));
    const roll = Math.sin(t * .9) * .03 + storm * Math.sin(t * 2.3) * .16;
    vyShip(ctx, mode, shipX, shipY + Math.sin(t * 1.3) * 5 * u * amp, L, roll, t, Math.abs(cam - 8) < .55, shipA);
    waveRow(y0 + 130 * u, 24, 240, 1.4, rgba(mixc(seaTop, [10, 4, 6], .6)), rgba(mixc(seaTop, [242, 227, 211], .5), .7));
    if (storm > .05) { // rain
      ctx.strokeStyle = `rgba(220,220,230,${(.3 * storm).toFixed(3)})`; ctx.lineWidth = 1.5 * u; ctx.beginPath();
      for (let k = 0; k < 120; k++) { const rx = (vyHash(k) * W * 1.2 + t * 300 * u) % (W * 1.2) - W * .1, ry = (vyHash(k + 7) * H + t * 900 * u) % H; ctx.moveTo(rx, ry); ctx.lineTo(rx - 14 * u, ry + 40 * u); }
      ctx.stroke();
    }
    if (flash > 0) { ctx.fillStyle = `rgba(255,250,235,${(flash * .85).toFixed(3)})`; ctx.fillRect(0, 0, W, H); }
    // the rim of the vase: a meander frieze that fills in as he travels
    const g0 = 9 * sc, fy = 66 * sc, fx0 = Math.max(16 * sc, W * .04), fx1 = W - 70 * sc;
    const units = Math.max(1, Math.floor((fx1 - fx0) / (6 * g0)));
    const pathK = () => {
      ctx.beginPath(); ctx.moveTo(fx0, fy + 2 * g0);
      for (let k = 0; k < units; k++) { const x = fx0 + k * 6 * g0; ctx.lineTo(x, fy); ctx.lineTo(x + 4 * g0, fy); ctx.lineTo(x + 4 * g0, fy + g0); ctx.lineTo(x + 2 * g0, fy + g0); ctx.lineTo(x + 2 * g0, fy + 2 * g0); ctx.lineTo(x + 6 * g0, fy + 2 * g0); }
    };
    ctx.lineWidth = 1.6 * sc; ctx.strokeStyle = 'rgba(242,227,211,.22)'; pathK(); ctx.stroke();
    const px1 = fx0 + (fx1 - fx0) * (cam / 13);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, px1, H); ctx.clip(); ctx.strokeStyle = CLAY; ctx.lineWidth = 2.4 * sc; pathK(); ctx.stroke(); ctx.restore();
    vyDisc(ctx, px1, fy + g0, 4 * sc, CREAM);
  },
};

// ---------- The company: a race through the filmography ----------
// A playhead runs through the 13 films. Each person's bar gains one block, in that film's colour, as it passes;
// rows appear on their first film with him and re-rank live. The rows themselves are built in app.js from the credits.
S.company = {
  init(el, st) {
    st.list = el.querySelector('#crew');
    st.rows = [...st.list.children].map((li, k) => ({ li, k, films: li.dataset.films.split(',').map(Number), segs: [...li.querySelectorAll('.cr-bar i')], ct: li.querySelector('.ct'), y: 0 }));
    st.list.style.setProperty('--rows', st.rows.length);
    st.films = [...document.querySelectorAll('.chapter')].map((c) => ({ t: c.dataset.title, y: c.dataset.year, acc: getComputedStyle(c).getPropertyValue('--acc').trim() }));
    st.strip = [...el.querySelectorAll('#co-films li')];
    st.year = el.querySelector('#co-year'); st.film = el.querySelector('#co-film'); st.ghost = el.querySelector('#co-ghost'); st.n = el.querySelector('#co-n');
    st.last = null;
  },
  frame(p, t, el, st) {
    const N = st.films.length;
    const head = seg(p, .05, .9) * N;
    const k = Math.min(N - 1, Math.floor(head));
    const rh = st.list.clientHeight / Math.max(1, st.rows.length);
    const snap = t === 0 || st.last === null || t - st.last > .5;
    const ease = snap ? 1 : Math.min(1, (t - st.last) * 10);
    st.last = t;
    const live = [];
    st.rows.forEach((r) => {
      r.score = 0;
      r.films.forEach((f, j) => { const g = c01(head - f); r.score += g; r.segs[j].style.setProperty('--g', g.toFixed(3)); });
      if (r.score > 0) live.push(r);
    });
    // rank by blocks so far, then by who came first, then by the credits order: ties never swap
    live.sort((a, b) => (b.score - a.score) || (a.films[0] - b.films[0]) || (a.k - b.k));
    const rank = new Map(live.map((r, i) => [r, i]));
    st.rows.forEach((r) => {
      const target = (rank.has(r) ? rank.get(r) : live.length) * rh;
      r.y = snap ? target : r.y + (target - r.y) * ease;
      r.li.style.transform = `translate3d(${((1 - c01(r.score * 3)) * -24).toFixed(1)}px, ${r.y.toFixed(1)}px, 0)`;
      r.li.style.opacity = c01(r.score * 3).toFixed(3);
      setText(r.ct, String(Math.floor(r.score + 1e-6)));
      r.li.classList.toggle('hot', r.films.includes(k) && head - k < 1 && head < N);
    });
    const f = st.films[k];
    setText(st.year, f.y); setText(st.film, f.t); setText(st.ghost, f.t); setText(st.n, String(live.length));
    el.style.setProperty('--now', f.acc);
    st.strip.forEach((li, i) => { li.classList.toggle('done', i < k || head >= N); li.classList.toggle('now', i === k && head < N); });
  },
};

// ---------- sound: all synthesised, only after the viewer presses the button ----------
// Every section has a bed, a loop that fades in while that section is on screen, and some scenes fire one-shots.
// Nothing is a recording: oscillators, filtered noise and plucked strings, all built in the browser.
window.Sound = {
  ctx: null, on: false, want: null, cur: null, nodes: null,
  toggle() {
    this.on = !this.on;
    if (this.on && !this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { this.on = false; return false; }
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = .5;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx) (this.on ? this.ctx.resume() : this.ctx.suspend()).catch(() => {});
    this.apply();
    return this.on;
  },
  chapter(name) { this.want = name || null; this.apply(); },
  apply() {
    if (!this.ctx) return;
    const next = this.on ? this.want : null;
    if (next === this.cur) return;
    this.stop();
    this.cur = next;
    if (next && this.beds[next]) this.nodes = this.beds[next].call(this, this.ctx);
  },
  stop() {
    if (!this.nodes) return;
    const n = this.nodes;
    n.out.gain.setTargetAtTime(0, this.ctx.currentTime, .25);
    setTimeout(() => n.kill(), 1500);
    this.nodes = null;
  },
  live() { return this.on && this.ctx && this.ctx.state === 'running'; },

  // ---- building blocks ----
  noise() {
    if (!this.nb) {
      const c = this.ctx, b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
      b.getChannelData(0).forEach((_, i, a) => { a[i] = Math.random() * 2 - 1; });
      this.nb = b;
    }
    return this.nb;
  },
  // A bed: one output that fades in, plus everything to stop when the section changes.
  bed(level, build) {
    const c = this.ctx, out = c.createGain(), stops = [];
    out.gain.value = 0; out.gain.setTargetAtTime(level, c.currentTime, .6); out.connect(this.master);
    const k = {
      out,
      osc: (type, f, g, to = out) => { const o = c.createOscillator(), v = c.createGain(); o.type = type; o.frequency.value = f; v.gain.value = g; o.connect(v); v.connect(to); o.start(); stops.push(() => o.stop()); return [o, v]; },
      noise: (type, f, q, g, to = out) => { const s = c.createBufferSource(), fl = c.createBiquadFilter(), v = c.createGain(); s.buffer = this.noise(); s.loop = true; fl.type = type; fl.frequency.value = f; fl.Q.value = q; v.gain.value = g; s.connect(fl); fl.connect(v); v.connect(to); s.start(); stops.push(() => s.stop()); return [s, fl, v]; },
      lfo: (param, f, depth, type = 'sine') => { const o = c.createOscillator(), v = c.createGain(); o.type = type; o.frequency.value = f; v.gain.value = depth; o.connect(v); v.connect(param); o.start(); stops.push(() => o.stop()); },
      filter: (type, f, q = 1, to = out) => { const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; fl.connect(to); return fl; },
      every: (ms, fn) => { const id = setInterval(() => { if (this.live()) fn(); }, ms); stops.push(() => clearInterval(id)); },
    };
    build(k, c);
    return { out, kill: () => { stops.forEach((f) => { try { f(); } catch { /* already stopped */ } }); out.disconnect(); } };
  },
  blip(to, f0, f1, dur, g, type = 'sine', t0 = this.ctx.currentTime) {
    const c = this.ctx, o = c.createOscillator(), v = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
    v.gain.setValueAtTime(g, t0); v.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    o.connect(v); v.connect(to); o.start(t0); o.stop(t0 + dur + .02);
  },
  burst(to, type, f, q, dur, g, t0 = this.ctx.currentTime) {
    const c = this.ctx, s = c.createBufferSource(), fl = c.createBiquadFilter(), v = c.createGain();
    s.buffer = this.noise(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    v.gain.setValueAtTime(.0001, t0); v.gain.exponentialRampToValueAtTime(g, t0 + .002); v.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    s.connect(fl); fl.connect(v); v.connect(to); s.start(t0, Math.random()); s.stop(t0 + dur + .05);
  },
  // the same noise, played as if reversed: it swells and then cuts off dead
  swell(to, type, f, dur, g, t0 = this.ctx.currentTime) {
    const c = this.ctx, s = c.createBufferSource(), fl = c.createBiquadFilter(), v = c.createGain();
    s.buffer = this.noise(); s.loop = true; fl.type = type; fl.frequency.value = f;
    v.gain.setValueAtTime(.0001, t0); v.gain.exponentialRampToValueAtTime(g, t0 + dur); v.gain.setValueAtTime(0, t0 + dur + .01);
    s.connect(fl); fl.connect(v); v.connect(to); s.start(t0); s.stop(t0 + dur + .05);
  },
  // a plucked string (Karplus-Strong), cached per pitch
  pluck(to, f, g, t0 = this.ctx.currentTime) {
    const c = this.ctx, key = f.toFixed(1);
    this.ks ||= {};
    if (!this.ks[key]) {
      const sr = c.sampleRate, n = Math.floor(sr * 1.8), b = c.createBuffer(1, n, sr), d = b.getChannelData(0), P = Math.max(2, Math.round(sr / f));
      const ring = new Float32Array(P).map(() => Math.random() * 2 - 1);
      for (let i = 0; i < n; i++) { const j = i % P, v = ring[j]; d[i] = v; ring[j] = .497 * (v + ring[(j + 1) % P]); }
      this.ks[key] = b;
    }
    const s = c.createBufferSource(), v = c.createGain();
    s.buffer = this.ks[key]; v.gain.value = g; s.connect(v); v.connect(to); s.start(t0);
  },
  // a sung vowel, two formants over a buzzing source, for the chant from the pit
  vowel(to, f, dur, g, t0) {
    const c = this.ctx, o = c.createOscillator(), v = c.createGain();
    o.type = 'sawtooth'; o.frequency.value = f;
    v.gain.setValueAtTime(.0001, t0); v.gain.exponentialRampToValueAtTime(g, t0 + .04); v.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    [[700, 6], [1150, 8]].forEach(([ff, q]) => { const fl = c.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = ff; fl.Q.value = q; o.connect(fl); fl.connect(v); });
    v.connect(to); o.start(t0); o.stop(t0 + dur + .05);
  },

  // ---- one bed per section ----
  beds: {
    // the cinema itself: projector flutter at 24 frames a second, mains hum
    projector() {
      return this.bed(1.3, (k) => {
        const [, , v] = k.noise('bandpass', 1600, .8, .035);
        k.lfo(v.gain, 24, .022, 'square');
        k.osc('sine', 50, .025); k.osc('triangle', 100, .008);
        k.noise('lowpass', 180, .5, .05);
      });
    },
    // Following: footsteps on a pavement, a low drone underneath
    footsteps(c) {
      return this.bed(1, (k) => {
        const lp = k.filter('lowpass', 220);
        k.osc('sawtooth', 55, .05, lp); k.osc('sawtooth', 55.6, .05, lp); k.osc('sine', 36.7, .05);
        let step = 0;
        k.every(560, () => {
          const t0 = c.currentTime, pan = c.createStereoPanner();
          pan.pan.value = step++ % 2 ? .35 : -.35; pan.connect(k.out);
          this.burst(pan, 'lowpass', 700, .8, .09, .5, t0); this.burst(pan, 'bandpass', 2400, 2, .03, .12, t0 + .045);
        });
      });
    },
    // Memento: chords and cymbals that play as if reversed, swelling up to a dead stop
    reverse(c) {
      return this.bed(2.6, (k) => {
        const chords = [[220, 261.63, 329.63], [196, 246.94, 293.66], [174.61, 220, 261.63], [164.81, 207.65, 246.94]];
        let n = 0;
        const go = () => {
          const t0 = c.currentTime, dur = 2.6;
          chords[n++ % chords.length].forEach((f) => { const o = c.createOscillator(), v = c.createGain(); o.type = 'triangle'; o.frequency.value = f; v.gain.setValueAtTime(.0001, t0); v.gain.exponentialRampToValueAtTime(.06, t0 + dur); v.gain.setValueAtTime(0, t0 + dur + .01); o.connect(v); v.connect(k.out); o.start(t0); o.stop(t0 + dur + .05); });
          this.swell(k.out, 'highpass', 5000, dur, .08, t0);
        };
        go(); k.every(3000, go);
      });
    },
    // Insomnia: wind over ice, one high note that never stops, a clock
    wind() {
      return this.bed(2, (k) => {
        const [, fl] = k.noise('bandpass', 520, 1.2, .2);
        k.lfo(fl.frequency, .07, 300);
        k.noise('lowpass', 120, .5, .08);
        k.osc('sine', 1760, .006);
        k.every(1000, () => this.blip(k.out, 2600, 2400, .03, .04));
      });
    },
    // Batman Begins: a cave, water dripping, a burst of wings
    cave(c) {
      return this.bed(0.9, (k) => {
        k.osc('sine', 41, .08); k.noise('lowpass', 140, .7, .1);
        k.every(900, () => { if (Math.random() < .6) this.blip(k.out, 1400 + Math.random() * 600, 380, .07, .07); });
        k.every(2600, () => { const t0 = c.currentTime, n = 8 + Math.floor(Math.random() * 14); for (let i = 0; i < n; i++) this.burst(k.out, 'highpass', 2500, .7, .025, .02 + Math.random() * .05, t0 + i * .028 + Math.random() * .01); });
      });
    },
    // The Prestige: Tesla's coils, mains buzz and sparks
    tesla(c) {
      return this.bed(2, (k) => {
        const lp = k.filter('lowpass', 500);
        k.osc('sawtooth', 60, .05, lp); k.osc('sine', 120, .03);
        k.every(120, () => { if (Math.random() < .45) this.burst(k.out, 'highpass', 2500 + Math.random() * 3000, .8, .012 + Math.random() * .03, .03 + Math.random() * .1); });
        k.every(3800, () => { const t0 = c.currentTime; for (let i = 0; i < 18; i++) this.burst(k.out, 'bandpass', 1200 + Math.random() * 3000, 1.5, .03, .12, t0 + i * .012); });
      });
    },
    // The Dark Knight: one bowed note that keeps climbing, a slow heartbeat
    tension(c) {
      return this.bed(1.8, (k) => {
        const bp = k.filter('bandpass', 900, 1.4);
        const [o, v] = k.osc('sawtooth', 98, .09, bp);
        k.lfo(v.gain, 6.5, .035);
        const glide = () => { const t0 = c.currentTime; o.frequency.cancelScheduledValues(t0); o.frequency.setValueAtTime(98, t0); o.frequency.exponentialRampToValueAtTime(233, t0 + 11.5); };
        glide(); k.every(12000, glide);
        k.every(1000, () => this.blip(k.out, 70, 38, .25, .3));
      });
    },
    // Inception: a low brass blast every few seconds, and a clock running slow
    braam(c) {
      return this.bed(.5, (k) => {
        const hit = () => {
          const t0 = c.currentTime, lp = c.createBiquadFilter(), v = c.createGain();
          lp.type = 'lowpass'; lp.frequency.setValueAtTime(180, t0); lp.frequency.exponentialRampToValueAtTime(1400, t0 + .25); lp.frequency.exponentialRampToValueAtTime(300, t0 + 3);
          v.gain.setValueAtTime(.0001, t0); v.gain.exponentialRampToValueAtTime(.2, t0 + .06); v.gain.setTargetAtTime(.0001, t0 + 2.4, .7);
          lp.connect(v); v.connect(k.out);
          [49, 49.4, 73.42, 98, 98.6].forEach((f) => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(lp); o.start(t0); o.stop(t0 + 5.5); });
        };
        hit(); k.every(7000, hit);
        k.every(2000, () => this.blip(k.out, 900, 600, .05, .05, 'triangle'));
        k.noise('lowpass', 90, .5, .05);
      });
    },
    // The Dark Knight Rises: drums and a five-beat chant from the pit, and a masked man breathing
    chant(c) {
      return this.bed(1.5, (k) => {
        const bar = () => {
          const t0 = c.currentTime;
          [0, .6, .9, 1.5].forEach((d, i) => this.blip(k.out, 90, 40, .35, i ? .22 : .32, 'sine', t0 + d));
          [[0, 98], [.3, 98], [.6, 110], [.9, 98], [1.2, 87.31]].forEach(([d, f]) => this.vowel(k.out, f, .26, .06, t0 + d));
        };
        bar(); k.every(2400, bar);
        const [, , v] = k.noise('bandpass', 600, 1.2, .05);
        k.lfo(v.gain, .28, .05);
      });
    },
    // Interstellar: a held organ chord, and a soft tick
    organ(c) {
      return this.bed(.6, (k) => {
        const lp = k.filter('lowpass', 1600);
        [110, 164.81, 220, 261.63, 329.63, 493.88].forEach((f, i) => ['sine', 'triangle'].forEach((type) => {
          const [o] = k.osc(type, f * (type === 'triangle' ? 2 : 1), (type === 'sine' ? .1 : .03) / (1 + i * .3), lp);
          o.detune.value = i % 2 ? 3 : -3;
        }));
        k.every(1250, () => this.blip(k.out, 1800, 1600, .02, .03));
        void c;
      });
    },
    // Dunkirk: a Shepard tone, a pitch that seems to rise forever, and a ticking watch
    shepard(c) {
      return this.bed(.6, (k) => {
        const N = 8, oscs = [];
        for (let i = 0; i < N; i++) oscs.push(k.osc('sine', 32, 0));
        let ph = 0;
        k.every(40, () => {
          ph = (ph + .004) % 1;
          oscs.forEach(([o, g], i) => { const x = (i + ph) / N; o.frequency.setTargetAtTime(32 * 2 ** (x * N), c.currentTime, .03); g.gain.setTargetAtTime(Math.exp(-((x - .5) ** 2) / .03) * .12, c.currentTime, .03); });
        });
        k.every(500, () => this.burst(k.out, 'highpass', 2500, .7, .03, .9));
      });
    },
    // Tenet: a gated bass that runs forwards and backwards, reversed swells on the bar
    tenet(c) {
      return this.bed(1.6, (k) => {
        const lp = k.filter('lowpass', 340, 6);
        const gate = c.createGain(); gate.gain.value = 0; gate.connect(lp);
        k.osc('sawtooth', 55, 1, gate); k.osc('sawtooth', 55.3, 1, gate);
        const pat = [1, 0, .6, 1, 0, .8, .5, 0, 1, 0, .6, 1, .4, .8, 0, .6];
        let step = 0;
        k.every(107, () => {
          const t0 = c.currentTime, a = pat[step % 16], rev = step % 4 === 3;
          step++;
          if (!a) return;
          gate.gain.cancelScheduledValues(t0);
          if (rev) { gate.gain.setValueAtTime(.0001, t0); gate.gain.exponentialRampToValueAtTime(.25 * a, t0 + .1); gate.gain.setValueAtTime(0, t0 + .102); }
          else { gate.gain.setValueAtTime(.25 * a, t0); gate.gain.exponentialRampToValueAtTime(.0001, t0 + .1); }
        });
        k.every(3424, () => this.swell(k.out, 'highpass', 3000, 1.7, .1));
      });
    },
    // Oppenheimer: a trembling string drone and a Geiger counter
    geiger() {
      return this.bed(2.4, (k) => {
        const bp = k.filter('bandpass', 1300);
        [196, 293.66].forEach((f, i) => { const [o, v] = k.osc('sawtooth', f, .035, bp); k.lfo(o.detune, 5.5 + i * .4, 9); k.lfo(v.gain, .08 + i * .05, .02); });
        k.every(40, () => { if (Math.random() < .2) this.burst(k.out, 'highpass', 3000, .5, .004, .3); });
      });
    },
    // The Odyssey: a lyre wandering in an old mode, a reed drone, the sea
    lyre() {
      return this.bed(0.9, (k) => {
        const [, , v] = k.noise('lowpass', 520, .5, .12);
        k.lfo(v.gain, .11, .08);
        const bp = k.filter('bandpass', 900, 2);
        const [, rv] = k.osc('sawtooth', 146.83, .02, bp); k.lfo(rv.gain, .2, .008);
        const scale = [146.83, 164.81, 174.61, 196, 220, 233.08, 261.63, 293.66, 329.63];
        let i = 4;
        k.every(420, () => {
          if (Math.random() < .25) return;
          i = Math.max(0, Math.min(scale.length - 1, i + [-2, -1, 1, 2][Math.floor(Math.random() * 4)]));
          this.pluck(k.out, scale[i], .35);
          if (Math.random() < .2) this.pluck(k.out, scale[Math.max(0, i - 4)], .22);
        });
      });
    },
  },

  // ---- one-shots fired by scenes ----
  // the Academy leader's beep on each number
  beep() { if (!this.live()) return; this.blip(this.master, 1000, 1000, .09, .3); },
  // glass breaking, or un-breaking: the same pings with their envelopes turned round
  glass(rev) {
    if (!this.live()) return;
    const c = this.ctx, t0 = c.currentTime;
    for (let i = 0; i < 16; i++) {
      const o = c.createOscillator(), v = c.createGain(), d = .15 + Math.random() * .5, st = t0 + Math.random() * .12;
      o.frequency.value = 2500 + Math.random() * 4500;
      if (rev) { v.gain.setValueAtTime(.0001, st); v.gain.exponentialRampToValueAtTime(.05, st + d); v.gain.setValueAtTime(0, st + d + .01); }
      else { v.gain.setValueAtTime(.05, st); v.gain.exponentialRampToValueAtTime(.0001, st + d); }
      o.connect(v); v.connect(this.master); o.start(st); o.stop(st + d + .05);
    }
    if (rev) this.swell(this.master, 'highpass', 4000, .35, .4, t0); else this.burst(this.master, 'highpass', 4000, .7, .35, .5, t0);
  },
  // the stadium going down
  rumble() {
    if (!this.live()) return;
    const c = this.ctx, t0 = c.currentTime, s = c.createBufferSource(), fl = c.createBiquadFilter(), v = c.createGain();
    s.buffer = this.noise(); s.loop = true; fl.type = 'lowpass'; fl.frequency.value = 130;
    v.gain.setValueAtTime(.0001, t0); v.gain.exponentialRampToValueAtTime(1, t0 + .4); v.gain.exponentialRampToValueAtTime(.0001, t0 + 5);
    s.connect(fl); fl.connect(v); v.connect(this.master); s.start(t0); s.stop(t0 + 5.1);
    this.blip(this.master, 38, 26, 4, .6, 'sine', t0);
  },
  // Zeus's thunderbolt
  thunder() {
    if (!this.live()) return;
    const c = this.ctx, t0 = c.currentTime;
    this.burst(this.master, 'highpass', 1800, .6, .12, .9, t0);
    const s = c.createBufferSource(), fl = c.createBiquadFilter(), v = c.createGain();
    s.buffer = this.noise(); s.loop = true; fl.type = 'lowpass';
    fl.frequency.setValueAtTime(1200, t0 + .05); fl.frequency.exponentialRampToValueAtTime(90, t0 + 3.2);
    v.gain.setValueAtTime(.0001, t0); v.gain.exponentialRampToValueAtTime(.9, t0 + .1); v.gain.exponentialRampToValueAtTime(.0001, t0 + 3.5);
    s.connect(fl); fl.connect(v); v.connect(this.master); s.start(t0); s.stop(t0 + 3.6);
  },
  // A Stuka's siren, the 'Jericho trumpet': a wail that climbs as the plane dives.
  siren() {
    if (!this.live()) return;
    const c = this.ctx, t0 = c.currentTime;
    const f = c.createBiquadFilter(), g = c.createGain();
    f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = .9;
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(.18, t0 + .9); g.gain.setValueAtTime(.18, t0 + 2.6); g.gain.exponentialRampToValueAtTime(.001, t0 + 3.6);
    f.connect(g); g.connect(this.master);
    [['sawtooth', 0], ['square', 7]].forEach(([type, det]) => {
      const o = c.createOscillator();
      o.type = type; o.detune.value = det;
      o.frequency.setValueAtTime(260, t0); o.frequency.exponentialRampToValueAtTime(780, t0 + 2.7); o.frequency.exponentialRampToValueAtTime(560, t0 + 3.5);
      o.connect(f); o.start(t0); o.stop(t0 + 3.7);
    });
  },
  // Trinity: the sound arrives after the light.
  boom() {
    if (!this.live()) return;
    const c = this.ctx, t0 = c.currentTime;
    const buf = c.createBuffer(1, c.sampleRate * 5, c.sampleRate);
    buf.getChannelData(0).forEach((_, i, a) => { a[i] = Math.random() * 2 - 1; });
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = buf; f.type = 'lowpass';
    f.frequency.setValueAtTime(1200, t0); f.frequency.exponentialRampToValueAtTime(40, t0 + 4);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(1.2, t0 + .03); g.gain.exponentialRampToValueAtTime(.001, t0 + 5);
    s.connect(f); f.connect(g); g.connect(this.master); s.start();
    const o = c.createOscillator(), og = c.createGain();
    o.frequency.setValueAtTime(55, t0); o.frequency.exponentialRampToValueAtTime(28, t0 + 3);
    og.gain.setValueAtTime(.8, t0); og.gain.exponentialRampToValueAtTime(.001, t0 + 4);
    o.connect(og); og.connect(this.master); o.start(); o.stop(t0 + 4.2);
  },
};
