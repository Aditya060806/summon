/* ---------- Year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Nav scroll state ---------- */
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
window.addEventListener('scroll', onScroll, {passive: true});
onScroll();

/* ---------- Theme toggle ---------- */
(() => {
	const root = document.documentElement;
	const btn = document.getElementById('theme-toggle');
	const meta = document.querySelector('meta[name="theme-color"]');
	const apply = (theme) => {
		root.dataset.theme = theme;
		if (meta) meta.setAttribute('content', theme === 'light' ? '#f7f8fb' : '#05060a');
		if (window.__refreshStars) window.__refreshStars();
	};
	btn.addEventListener('click', () => {
		const next = root.dataset.theme === 'light' ? 'dark' : 'light';
		try { localStorage.setItem('summon-theme', next); } catch (e) {}
		apply(next);
	});
	// Follow the OS if the user hasn't chosen explicitly.
	window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
		let stored = null;
		try { stored = localStorage.getItem('summon-theme'); } catch (err) {}
		if (stored !== 'light' && stored !== 'dark') apply(e.matches ? 'light' : 'dark');
	});
})();

/* ---------- Starfield ---------- */
(() => {
	const canvas = document.getElementById('stars');
	const ctx = canvas.getContext('2d');
	let stars = [];
	let w, h, raf;
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	let rgb = readRGB();
	function readRGB() {
		return (getComputedStyle(document.documentElement).getPropertyValue('--star-rgb').trim()) || '180,200,235';
	}
	window.__refreshStars = () => { rgb = readRGB(); };

	function resize() {
		w = canvas.width = window.innerWidth;
		h = canvas.height = window.innerHeight;
		const count = Math.min(160, Math.floor((w * h) / 12000));
		stars = Array.from({length: count}, () => ({
			x: Math.random() * w,
			y: Math.random() * h,
			r: Math.random() * 1.3 + 0.3,
			a: Math.random() * 0.6 + 0.2,
			tw: Math.random() * 0.02 + 0.004,
			dir: Math.random() > 0.5 ? 1 : -1,
		}));
	}

	function draw() {
		ctx.clearRect(0, 0, w, h);
		for (const s of stars) {
			s.a += s.tw * s.dir;
			if (s.a > 0.85 || s.a < 0.15) s.dir *= -1;
			ctx.beginPath();
			ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
			ctx.fillStyle = `rgba(${rgb},${s.a})`;
			ctx.fill();
		}
		raf = requestAnimationFrame(draw);
	}

	resize();
	window.addEventListener('resize', resize);
	if (!reduce) draw();
	else { for (const s of stars) { ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(${rgb},${s.a})`; ctx.fill(); } }
})();

/* ---------- Feature cards ---------- */
const icon = p => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const features = [
	{ t: 'Multiple targets', d: 'Open many files, URLs, and bookmarks in one call.', c: 'summon a.pdf b.png x.com', i: '<path d="M4 6h16M4 12h16M4 18h10"/>' },
	{ t: 'Smart URL normalization', d: 'Bare domains get https:// automatically — existing files always win.', c: 'summon github.com', i: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>' },
	{ t: 'Bookmarks', d: 'Save aliases and open them instantly. Turns summon into a daily driver.', c: 'summon @docs', i: '<path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/>' },
	{ t: 'Configurable search', d: '10 built-in engines. Pick one per search or set your default.', c: 'summon -s "flatMap" -e mdn', i: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>' },
	{ t: 'Clipboard mode', d: 'Open whatever URL or path you just copied.', c: 'summon -c', i: '<rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>' },
	{ t: 'Reveal in file manager', d: 'Highlight a file in Finder, Explorer, or your file manager.', c: 'summon file -r', i: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>' },
	{ t: 'Fuzzy picker', d: 'Type to fuzzy-filter a menu of bookmarks and recent items.', c: 'summon --recent', i: '<path d="M4 6h16M7 12h10M10 18h4"/>' },
	{ t: 'Dry-run', d: 'Preview exactly what would open — perfect for scripts and trust.', c: 'summon x.com --dry-run', i: '<circle cx="12" cy="12" r="3"/><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/>' },
	{ t: 'Stdin + type detect', d: 'Pipe raw bytes in; the file type is auto-detected from 100+ formats.', c: 'cat photo.png | summon', i: '<path d="M4 17V7a2 2 0 0 1 2-2h12M20 7v10a2 2 0 0 1-2 2H6M8 12h8"/>' },
	{ t: 'Cross-platform', d: 'Identical behavior on macOS, Windows, Linux, and Termux.', c: '', i: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18"/>' },
	{ t: 'Shell completions', d: 'Bash, zsh, fish, and PowerShell — with dynamic bookmark names.', c: '', i: '<path d="m5 8 4 4-4 4M12 16h7"/>' },
	{ t: 'Typed exit codes', d: 'Friendly errors and scriptable exit codes for every failure type.', c: '', i: '<path d="M20 6 9 17l-5-5"/>' },
];
document.getElementById('feature-cards').innerHTML = features.map((f, n) => `
	<article class="card reveal" style="transition-delay:${(n % 3) * 70}ms">
		<div class="card__icon">${icon(f.i)}</div>
		<h3>${f.t}</h3>
		<p>${f.d}${f.c ? `<br><code>${f.c}</code>` : ''}</p>
	</article>`).join('');

/* ---------- Flags table ---------- */
const flags = [
	['--wait', '-w', 'Wait for the opened app to exit. Great as a $EDITOR.'],
	['--background', '', 'Open without focus (macOS only).'],
	['--extension', '', 'Extension for piped stdin when the type is unknown.'],
	['--dry-run', '-n', 'Print what would be opened, without launching.'],
	['--search', '-s', 'Treat the input as a web search query.'],
	['--engine', '-e', 'Search engine to use with --search.'],
	['--engines', '', 'List available search engines.'],
	['--clipboard', '-c', 'Open the URL/path on the clipboard.'],
	['--reveal', '-r', 'Reveal/highlight the file in the file manager.'],
	['--recent', '', 'Fuzzy-pick from recently opened items.'],
	['--save &lt;name&gt;', '', 'Save the given target as a bookmark.'],
	['--remove-bookmark', '', 'Remove a saved bookmark by name.'],
	['--bookmarks', '', 'List saved bookmarks.'],
];
document.getElementById('flags-table').innerHTML = flags.map(([f, s, d]) =>
	`<tr><td><code>${f}</code></td><td>${s ? `<code>${s}</code>` : '—'}</td><td>${d}</td></tr>`).join('');

/* ---------- Cheatsheet ---------- */
const cheats = [
	['Open a URL / domain', 'summon github.com'],
	['Open several things', 'summon a.pdf b.png x.com'],
	['Open in a specific app', "summon url -- firefox"],
	['Save / open a bookmark', 'summon url --save gh · summon @gh'],
	['Search with an engine', 'summon -s "query" -e npm'],
	['Open clipboard URL', 'summon -c'],
	['Reveal a file', 'summon report.pdf -r'],
	['Preview without opening', 'summon url --dry-run'],
	['Pipe data in', 'cat photo.png | summon'],
];
document.getElementById('cheatsheet-table').innerHTML = cheats.map(([t, c]) =>
	`<tr><td>${t}</td><td><code>${c}</code></td></tr>`).join('');

/* ---------- Engine chips ---------- */
const engines = ['google', 'ddg', 'bing', 'brave', 'npm', 'gh', 'mdn', 'so', 'yt', 'wiki'];
document.getElementById('engine-chips').innerHTML = engines.map(e => `<span class="chip">${e}</span>`).join('');

/* ---------- Comparison table ---------- */
const Y = '<span style="color:var(--good)">✅</span>';
const P = '<span style="color:var(--warn)">⚠️</span>';
const N = '<span style="color:var(--bad)">❌</span>';
const cmp = [
	['Works on macOS / Win / Linux', Y, Y, Y, P],
	['One identical command', Y, Y, Y, N],
	['Multiple targets', Y, N, N, P],
	['Auto https:// for domains', Y, N, N, N],
	['Bookmarks / aliases', Y, N, N, N],
	['Search + engines', Y, N, N, N],
	['Clipboard mode', Y, N, N, N],
	['Reveal in file manager', Y, N, N, P],
	['Fuzzy picker', Y, N, N, N],
	['Dry-run preview', Y, N, N, N],
	['Stdin + type detection', Y, Y, N, N],
	['Choose app + args', Y, Y, N, P],
	['Typed exit codes', Y, P, P, N],
];
document.getElementById('cmp-table').innerHTML = cmp.map(r =>
	`<tr><td>${r[0]}</td><td class="hl">${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td></tr>`).join('');

/* ---------- Reveal on scroll ---------- */
const io = new IntersectionObserver((entries) => {
	for (const e of entries) {
		if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
	}
}, {threshold: 0.12});
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ---------- Copy buttons ---------- */
function flashCopy(btn, label) {
	const original = label ? btn.textContent : null;
	btn.classList.add('copied');
	if (label) btn.textContent = 'Copied';
	setTimeout(() => { btn.classList.remove('copied'); if (label) btn.textContent = original; }, 1400);
}
async function copyText(text) {
	try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}
document.querySelectorAll('.install-pill').forEach(pill => {
	pill.querySelector('.install-pill__copy').addEventListener('click', async () => {
		if (await copyText(pill.dataset.copy)) { pill.classList.add('copied'); setTimeout(() => pill.classList.remove('copied'), 1400); }
	});
});
document.querySelectorAll('.codeblock__copy').forEach(btn => {
	btn.addEventListener('click', async () => {
		const code = btn.parentElement.querySelector('code').innerText;
		if (await copyText(code)) flashCopy(btn, true);
	});
});

/* ---------- Install tabs ---------- */
const tabWrap = document.getElementById('install-tabs');
tabWrap.querySelectorAll('.tabs__btn').forEach(btn => {
	btn.addEventListener('click', () => {
		tabWrap.querySelectorAll('.tabs__btn').forEach(b => b.classList.remove('is-active'));
		tabWrap.querySelectorAll('.codeblock').forEach(p => p.classList.remove('is-active'));
		btn.classList.add('is-active');
		tabWrap.querySelector(`.codeblock[data-panel="${btn.dataset.tab}"]`).classList.add('is-active');
	});
});

/* ---------- Typed terminal ---------- */
(() => {
	const el = document.getElementById('typed');
	if (!el) return;
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const lines = [
		{ t: 'cmd', s: '$ summon github.com report.pdf' },
		{ t: 'out', s: '  opening https://github.com …' },
		{ t: 'out', s: '  opening report.pdf …' },
		{ t: 'cmd', s: '$ summon -s "how to center a div" -e mdn' },
		{ t: 'out', s: '  → developer.mozilla.org/…?q=how%20to%20center%20a%20div' },
		{ t: 'cmd', s: '$ summon https://docs.example.com --save docs' },
		{ t: 'ok', s: '  ✓ saved bookmark docs' },
		{ t: 'cmd', s: '$ cat diagram.png | summon' },
		{ t: 'out', s: '  detected png · opening …' },
	];

	if (reduce) {
		el.innerHTML = lines.map(l => `<span class="${l.t === 'cmd' ? 'prompt' : l.t}">${l.s}</span>`).join('\n');
		document.querySelector('.cursor').style.display = 'none';
		return;
	}

	let li = 0, ci = 0, buffer = '';
	function tick() {
		if (li >= lines.length) {
			setTimeout(() => { el.innerHTML = ''; buffer = ''; li = 0; ci = 0; tick(); }, 3200);
			return;
		}
		const line = lines[li];
		if (ci === 0) buffer += `<span class="${line.t === 'cmd' ? 'prompt' : line.t}">`;
		if (ci < line.s.length) {
			const ch = line.s[ci] === '<' ? '&lt;' : line.s[ci] === '>' ? '&gt;' : line.s[ci];
			buffer += ch;
			el.innerHTML = buffer + '</span>';
			ci++;
			setTimeout(tick, line.t === 'cmd' ? 34 : 12);
		} else {
			buffer += '</span>\n';
			el.innerHTML = buffer;
			li++; ci = 0;
			setTimeout(tick, line.t === 'cmd' ? 360 : 200);
		}
	}
	const start = new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting) { tick(); start.disconnect(); }
	}, {threshold: 0.3});
	start.observe(document.querySelector('.terminal'));
})();
