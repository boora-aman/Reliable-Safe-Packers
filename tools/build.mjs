// Static site generator. Run: node tools/build.mjs
// Writes every .html page, sitemap.xml and robots.txt into the project root.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, SERVICES, AREAS, ROUTES, REVIEWS, HOME_FAQS } from './data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const S = SITE;
const e = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pages = []; // {path, priority, index}

/* ---------- icons ---------- */
const ICONS = {
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  wa: '<path d="M3 21l1.65-4.8A9 9 0 1 1 8 19.4L3 21z"/><path d="M9 9.5c.5 2.5 3 5 5.5 5.5l1.2-1.2-2-1-1 .8c-1-.5-1.8-1.3-2.3-2.3l.8-1-1-2z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  truck: '<path d="M1 4h14v12H1z"/><path d="M15 8h4l4 4v4h-8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
  car: '<path d="M19 17h2a1 1 0 0 0 1-1v-3a2 2 0 0 0-1.5-1.9C18.7 10.6 16 10 16 10l-2.2-2.3A2 2 0 0 0 12.3 7H5a1 1 0 0 0-.9.6l-1.9 3.8A3.7 3.7 0 0 0 2 13v3a1 1 0 0 0 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M9 17h6"/>',
  bike: '<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
  warehouse: '<path d="M22 8.35V20a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8.35a1 1 0 0 1 .63-.93l9-4.5a1 1 0 0 1 .74 0l9 4.5a1 1 0 0 1 .63.93z"/><path d="M6 21v-8h12v8M6 17h12"/>',
  route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  arrow: '<path d="M5 12h14M13 5l7 7-7 7"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.5"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
};
const ico = (n, c = '') => `<svg class="ico ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>${Object.entries(ICONS).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('')}</defs></svg>`;

const LOGO_ICON = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 3 57 11v21c0 15-10.5 25-25 29C17.5 57 7 47 7 32V11z" fill="#0a2540"/><path d="M32 8.5 52 15v17c0 12-8.5 20.5-20 24.5C20.5 52.5 12 44 12 32V15z" fill="#12365c"/><rect x="15" y="22" width="19" height="14" rx="2" fill="#fff"/><path d="M36 26h7.5l5.5 6v4H36z" fill="#fff"/><path d="M39 28.5h3.5l3 3.3H39z" fill="#12365c"/><path d="M14 36h35" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><circle cx="23" cy="38.5" r="4" fill="#e0560d" stroke="#12365c" stroke-width="2"/><circle cx="42" cy="38.5" r="4" fill="#e0560d" stroke="#12365c" stroke-width="2"/><path d="m22 47 6 4.5L42 44" fill="none" stroke="#e0560d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const brand = `<a class="brand" href="/" aria-label="${e(S.name)} home">${LOGO_ICON}<span><b>Reliable Safe</b><small>Packers &amp; Movers</small></span></a>`;

/* ---------- paths ---------- */
const areaPath = (a) => `packers-movers-${a.slug}-dehradun.html`;
const routePath = (r) => `dehradun-to-${r.slug}-packers-movers.html`;
const svcPath = (s) => `${s.slug}.html`;
const abs = (p) => `${S.url}/${p === 'index.html' ? '' : p}`;

/* ---------- shared pieces ---------- */
function head({ title, desc, path, noindex = false, schema = [], ogImage = 'assets/img/og-image.jpg' }) {
  const url = abs(path);
  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e(title)}</title>
<meta name="description" content="${e(desc)}">
<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large'}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#0a2540">
<meta name="geo.region" content="IN-UT"><meta name="geo.placename" content="Dehradun"><meta name="geo.position" content="${S.lat};${S.lng}"><meta name="ICBM" content="${S.lat}, ${S.lng}">
<meta property="og:type" content="website"><meta property="og:site_name" content="${e(S.name)}"><meta property="og:locale" content="en_IN">
<meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(desc)}"><meta property="og:url" content="${url}">
<meta property="og:image" content="${S.url}/${ogImage}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/img/icon-192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/css/site.css" as="style">
<link rel="stylesheet" href="/assets/css/site.css">
${schema.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
</head>`;
}

const orgSchema = () => ({
  '@context': 'https://schema.org',
  '@type': ['MovingCompany', 'LocalBusiness'],
  '@id': `${S.url}/#org`,
  name: S.name, url: S.url + '/', telephone: S.phone, email: S.email,
  image: `${S.url}/assets/img/og-image.jpg`, logo: `${S.url}/assets/img/icon-512.png`,
  priceRange: '₹₹',
  address: { '@type': 'PostalAddress', streetAddress: S.street, addressLocality: S.city, addressRegion: S.region, postalCode: S.zip, addressCountry: 'IN' },
  geo: { '@type': 'GeoCoordinates', latitude: S.lat, longitude: S.lng },
  hasMap: 'https://www.google.com/maps/search/?api=1&query=Reliable+Safe+Packers+%26+Movers+Dehradun',
  openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '09:00', closes: '21:00' }],
  areaServed: [{ '@type': 'City', name: 'Dehradun' }, ...['Mussoorie', 'Rishikesh', 'Haridwar', 'Roorkee', 'Delhi', 'Noida', 'Gurgaon', 'Chandigarh'].map((n) => ({ '@type': 'City', name: n })), { '@type': 'State', name: 'Uttarakhand' }, { '@type': 'Country', name: 'India' }],
  contactPoint: { '@type': 'ContactPoint', telephone: S.phone, contactType: 'customer service', areaServed: 'IN', availableLanguage: ['en', 'hi'] },
});
const siteSchema = () => ({ '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${S.url}/#site`, url: S.url + '/', name: S.name, publisher: { '@id': `${S.url}/#org` }, inLanguage: 'en-IN' });
const crumbSchema = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c[0], item: abs(c[1]) })) });
const faqSchema = (faqs) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
const serviceSchema = (name, desc, path, area = 'Dehradun') => ({ '@context': 'https://schema.org', '@type': 'Service', name, description: desc, url: abs(path), serviceType: name, provider: { '@id': `${S.url}/#org` }, areaServed: { '@type': 'City', name: area } });

function header(cur) {
  const c = (p) => (cur === p ? ' aria-current="page"' : '');
  return `<a class="skip" href="#main">Skip to content</a>
<div class="topbar"><div class="wrap"><span>Packers &amp; Movers in Dehradun | ${e(S.hours)}</span><span><a href="tel:${S.phone}">${ico('phone')} ${S.phoneShow}</a> &nbsp; <a href="mailto:${S.email}">${S.email}</a></span></div></div>
<header class="header"><div class="wrap">
${brand}
<div class="hd-actions">
<a class="hd-call" href="tel:${S.phone}" aria-label="Call ${S.phoneShow}">${ico('phone')}<span>${S.phoneShow}</span></a>
<button class="burger" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="nav">${ico('menu')}</button>
</div>
<nav class="nav" id="nav" aria-label="Main"><ul>
<li><a href="/"${c('index.html')}>Home</a></li>
<li class="dd"><details><summary>Services</summary><div class="sub two">${SERVICES.map((s) => `<a href="/${svcPath(s)}"${c(svcPath(s))}>${e(s.nav)}</a>`).join('')}<a href="/services.html"><b>All services</b></a></div></details></li>
<li class="dd"><details><summary>Areas</summary><div class="sub two">${AREAS.map((a) => `<a href="/${areaPath(a)}"${c(areaPath(a))}>${e(a.name)}</a>`).join('')}<a href="/branches.html"><b>All areas &amp; routes</b></a></div></details></li>
<li><a href="/about.html"${c('about.html')}>About</a></li>
<li><a href="/branches.html"${c('branches.html')}>Service Areas</a></li>
<li><a href="/contact.html"${c('contact.html')}>Contact</a></li>
</ul>
<div class="nav-cta"><a class="btn btn-cta" href="tel:${S.phone}">${ico('phone')} Call ${S.phoneShow}</a><a class="btn btn-wa" href="https://wa.me/${S.wa}?text=${encodeURIComponent('Hi, I need a moving quote.')}" target="_blank" rel="noopener">${ico('wa')} WhatsApp</a></div>
</nav>
</div></header>`;
}

function footer() {
  return `<footer class="footer"><div class="wrap">
<div class="fgrid">
<div class="f-about">${brand}<p style="margin-top:12px">Professional packers and movers in Dehradun for home, office, car and bike shifting, locally and across India.</p>
<p><a class="btn btn-cta" href="tel:${S.phone}">${ico('phone')} Call ${S.phoneShow}</a></p></div>
<div><h4>Services</h4><ul>${SERVICES.map((s) => `<li><a href="/${svcPath(s)}">${e(s.nav)}</a></li>`).join('')}</ul></div>
<div><h4>Areas in Dehradun</h4><ul>${AREAS.slice(0, 8).map((a) => `<li><a href="/${areaPath(a)}">${e(a.name)}</a></li>`).join('')}<li><a href="/branches.html">More areas &amp; routes</a></li></ul></div>
<div><h4>Contact</h4><address class="addr" style="font-style:normal"><p>${e(S.street)}, ${S.city} (U.K.) ${S.zip}</p>
<p>${ico('phone')} <a href="tel:${S.phone}">${S.phoneShow}</a><br>${ico('mail')} <a href="mailto:${S.email}">${S.email}</a></p><p>${e(S.hours)}</p></address>
<ul><li><a href="/about.html">About us</a></li><li><a href="/contact.html">Contact</a></li><li><a href="/privacy-policy.html">Privacy policy</a></li></ul></div>
</div>
<div class="copy"><span>&copy; ${S.year} ${e(S.name)}. All rights reserved.</span><span>Dehradun, Uttarakhand, India</span></div>
</div></footer>
<div class="mbar" role="navigation" aria-label="Quick contact">
<a class="c" href="tel:${S.phone}">${ico('phone')}Call Now</a>
<a class="w" href="https://wa.me/${S.wa}?text=${encodeURIComponent('Hi, I need a moving quote.')}" target="_blank" rel="noopener">${ico('wa')}WhatsApp</a>
<a class="q" href="#quote">${ico('tag')}Free Quote</a>
</div>
<a class="fab" href="https://wa.me/${S.wa}?text=${encodeURIComponent('Hi, I need a moving quote.')}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${ico('wa')}</a>
<script src="/assets/js/site.js" defer></script>`;
}

const SERVICE_OPTS = ['House Shifting', 'Office Relocation', 'Local Shifting', 'Long Distance Move', 'Car Transport', 'Bike Transport', 'Packing Only', 'Warehouse / Storage', 'Other'];
const svcDefault = { shifting: 'House Shifting', 'office-relocation': 'Office Relocation', 'local-shifting': 'Local Shifting', 'long-distance': 'Long Distance Move', packing: 'Packing Only', 'car-transport': 'Car Transport', 'bike-transport': 'Bike Transport', transport: 'Other', warehouse: 'Warehouse / Storage' };

function qform({ title = 'Get a Free Quote', sub = 'Reply in minutes. No obligation.', service = '', to = '', from = 'Dehradun', full = false, id = 'quote' } = {}) {
  return `<div class="qcard" id="${id}"><h2>${e(title)}</h2><p class="sub">${e(sub)}</p>
<form data-quote novalidate>
<div class="fld-2"><div class="fld"><label for="${id}-n">Your name</label><input id="${id}-n" name="name" autocomplete="name" required></div>
<div class="fld"><label for="${id}-p">Mobile number</label><input id="${id}-p" name="phone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="10-digit mobile" required></div></div>
<div class="fld-2"><div class="fld"><label for="${id}-f">Moving from</label><input id="${id}-f" name="from" value="${e(from)}" autocomplete="off"></div>
<div class="fld"><label for="${id}-t">Moving to</label><input id="${id}-t" name="to" value="${e(to)}" placeholder="City or area" autocomplete="off"></div></div>
<div class="fld-2"><div class="fld"><label for="${id}-s">Service</label><select id="${id}-s" name="service">${SERVICE_OPTS.map((o) => `<option${o === service ? ' selected' : ''}>${e(o)}</option>`).join('')}</select></div>
<div class="fld"><label for="${id}-d">Moving date (optional)</label><input id="${id}-d" name="date" type="date"></div></div>
${full ? `<div class="fld"><label for="${id}-m">Details (optional)</label><textarea id="${id}-m" name="message" placeholder="e.g. 2 BHK, 2nd floor, no lift"></textarea></div>` : ''}
<div class="hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
<button class="btn btn-cta btn-block" type="submit">${ico('arrow')} Get My Free Quote</button>
<div class="form-msg" role="alert" aria-live="polite"></div>
<p class="fine">We use your number only to contact you about your move.</p>
</form></div>`;
}

const crumbs = (items) => `<nav class="crumbs" aria-label="Breadcrumb">${items.map((c, i) => (i === items.length - 1 ? `<span aria-current="page" style="margin:0">${e(c[0])}</span>` : `<a href="/${c[1] === 'index.html' ? '' : c[1]}">${e(c[0])}</a><span>/</span>`)).join('')}</nav>`;

const faqHtml = (faqs, h = 'Frequently asked questions') => `<div class="faq"><h2>${e(h)}</h2>${faqs.map(([q, a]) => `<details><summary>${e(q)}</summary><p>${e(a)}</p></details>`).join('')}</div>`;

const band = (t = 'Ready to move? Get your free quote today', p = 'Call or WhatsApp us. We reply fast and quote clearly.') => `<section class="band"><div class="wrap"><h2>${e(t)}</h2><p>${e(p)}</p><div class="row"><a class="btn btn-line" href="tel:${S.phone}">${ico('phone')} Call ${S.phoneShow}</a><a class="btn btn-wa" href="https://wa.me/${S.wa}?text=${encodeURIComponent('Hi, I need a moving quote.')}" target="_blank" rel="noopener">${ico('wa')} WhatsApp Us</a></div></div></section>`;

const pageHero = ({ trail, h1, lead }) => `<section class="phero"><div class="wrap">${crumbs(trail)}<h1>${e(h1)}</h1><p>${e(lead)}</p>
<div class="row"><a class="btn btn-cta" href="tel:${S.phone}">${ico('phone')} Call Now</a><a class="btn btn-wa" href="https://wa.me/${S.wa}?text=${encodeURIComponent('Hi, I need a moving quote.')}" target="_blank" rel="noopener">${ico('wa')} WhatsApp</a></div></div></section>`;

const sideBox = (title, items) => `<div class="box"><h3>${e(title)}</h3><ul>${items.map(([l, h]) => `<li><a href="/${h}">${e(l)}</a></li>`).join('')}</ul></div>`;
const contactBox = () => `<div class="box"><h3>Talk to us</h3><ul><li>${ico('phone')} <a href="tel:${S.phone}"><b>${S.phoneShow}</b></a></li><li>${ico('mail')} <a href="mailto:${S.email}">${S.email}</a></li><li>${ico('pin')} ${e(S.street)}, ${S.city} ${S.zip}</li><li>${ico('clock')} ${e(S.hours)}</li></ul></div>`;

function emit(path, { title, desc, cur, body, schema = [], noindex = false, priority = 0.6 }) {
  const html = `${head({ title, desc, path, noindex, schema: [orgSchema(), siteSchema(), ...schema] })}
<body>
${sprite}
${header(cur || path)}
<main id="main">
${body}
</main>
${footer()}
</body>
</html>
`;
  writeFileSync(join(ROOT, path), html);
  if (!noindex) pages.push({ path, priority });
}

const reviewCards = () => `<div class="grid c3 reviews">${REVIEWS.map(([n, t]) => `<div class="card"><div class="stars" aria-label="5 out of 5 stars">★★★★★</div><p>&ldquo;${e(t)}&rdquo;</p><div class="who"><span class="av">${e(n[0])}</span>${e(n)}</div></div>`).join('')}</div>`;
const chips = (items) => `<ul class="chips">${items.map(([l, h]) => `<li><a href="/${h}">${e(l)}</a></li>`).join('')}</ul>`;
const svcLinks = () => SERVICES.map((s) => [s.nav, svcPath(s)]);
const img = (n, alt, w, h, lazy = true) => `<img src="/assets/img/opt/${n}.webp" alt="${e(alt)}" width="${w}" height="${h}"${lazy ? ' loading="lazy" decoding="async"' : ''}>`;

/* =============== HOME =============== */
{
  const faqs = HOME_FAQS;
  emit('index.html', {
    title: 'Packers & Movers in Dehradun | Reliable Safe Packers',
    desc: 'Reliable Safe Packers & Movers: trusted house shifting, office relocation, car and bike transport in Dehradun and across India. Free quote. Call 87557 22118.',
    priority: 1.0,
    schema: [faqSchema(faqs)],
    body: `<section class="hero"><div class="hero-bg" aria-hidden="true"></div><div class="wrap hero-grid">
<div><span class="kicker">Dehradun &bull; 15+ years of experience</span>
<h1>Trusted Packers and Movers in Dehradun</h1>
<p class="lead">Safe house shifting, office relocation and car &amp; bike transport. Trained crew, quality packing, on-time delivery.</p>
<ul class="ticks"><li>${ico('check')} Free home survey and clear fixed quote</li><li>${ico('check')} Careful packing with quality material</li><li>${ico('check')} Local, Delhi NCR and all-India moves</li></ul>
<div class="hero-cta"><a class="btn btn-cta" href="tel:${S.phone}">${ico('phone')} Call Now</a><a class="btn btn-wa" href="https://wa.me/${S.wa}?text=${encodeURIComponent('Hi, I need a moving quote.')}" target="_blank" rel="noopener">${ico('wa')} WhatsApp</a></div></div>
<div>${qform({ title: 'Get a Free Quote', sub: 'Fill in 30 seconds. We call you back fast.' })}</div>
</div></section>
<section class="trust"><div class="wrap"><ul>
<li>${ico('shield')} Safe &amp; careful handling</li><li>${ico('clock')} On-time delivery</li><li>${ico('tag')} Transparent pricing</li><li>${ico('phone')} 24/7 support line</li></ul></div></section>

<section class="sec"><div class="wrap"><div class="sec-head center"><span class="eyebrow">Our services</span><h2>Everything for a smooth move</h2><p>From one room to a full office, choose the service you need.</p></div>
<div class="grid c3">${SERVICES.map((s) => `<a class="card" href="/${svcPath(s)}"><div class="ci">${ico(s.icon)}</div><h3>${e(s.nav)}</h3><p>${e(s.short)}</p><span class="more">Learn more &rarr;</span></a>`).join('')}</div></div></section>

<section class="sec soft"><div class="wrap split">
<div>${img('crew', 'Uniformed Reliable Safe Packers crew member with wrapped furniture', 900, 504)}</div>
<div><span class="eyebrow">Why choose us</span><h2>Dehradun movers you can rely on</h2>
<p>We are a local Dehradun company with our own office at Sewla Khurd. You deal directly with us, not a call centre.</p>
<ul class="checks"><li>${ico('check')}<span><b>Trained crew.</b> Experienced packers, loaders and drivers.</span></li>
<li>${ico('check')}<span><b>Quality packing.</b> Bubble wrap, cartons, stretch film and blankets.</span></li>
<li>${ico('check')}<span><b>Fixed, clear quote.</b> No hidden charges on the day.</span></li>
<li>${ico('check')}<span><b>Local knowledge.</b> We know Dehradun lanes, hill roads and society rules.</span></li>
<li>${ico('check')}<span><b>Support at every step.</b> Call or WhatsApp anytime.</span></li></ul>
<a class="btn btn-cta" href="/about.html">About us</a></div></div></section>

<section class="sec"><div class="wrap"><div class="sec-head center"><span class="eyebrow">How it works</span><h2>Moving made simple in 4 steps</h2></div>
<ol class="steps"><li><h3>Call or fill form</h3><p>Tell us what and where you are moving.</p></li><li><h3>Free survey and quote</h3><p>We assess your goods and give a fixed price.</p></li><li><h3>Packing and loading</h3><p>Our crew packs, labels and loads carefully.</p></li><li><h3>Delivery and setup</h3><p>We unload, place items and help you settle in.</p></li></ol></div></section>

<section class="sec dark"><div class="wrap"><div class="sec-head"><span class="eyebrow" style="color:#ffb27a">Areas we serve</span><h2>Local in Dehradun, reliable across India</h2><p>We serve all localities in Dehradun, nearby hill and valley cities, and major cities across India.</p></div>
<h3>Dehradun localities</h3>${chips(AREAS.map((a) => [a.name, areaPath(a)]))}
<h3 style="margin-top:22px">Popular routes</h3>${chips(ROUTES.map((r) => [`Dehradun to ${r.city}`, routePath(r)]))}</div></section>

<section class="sec"><div class="wrap"><div class="sec-head center"><span class="eyebrow">Customer reviews</span><h2>What our customers say</h2></div>${reviewCards()}</div></section>

<section class="sec soft"><div class="wrap" style="max-width:860px">${faqHtml(faqs)}</div></section>
${band()}`,
  });
}

/* =============== SERVICES HUB =============== */
emit('services.html', {
  title: 'Packing & Moving Services in Dehradun | Reliable Safe Packers',
  desc: 'All our moving services in Dehradun: house shifting, office relocation, local and long-distance moves, car and bike transport, packing, goods transport and warehouse.',
  priority: 0.9,
  schema: [crumbSchema([['Home', 'index.html'], ['Services', 'services.html']])],
  body: `${pageHero({ trail: [['Home', 'index.html'], ['Services', 'services.html']], h1: 'Our Packers & Movers Services in Dehradun', lead: 'Pick the service you need. Every move gets trained crew, quality packing and a clear quote.' })}
<section class="sec"><div class="wrap"><div class="grid c3">${SERVICES.map((s) => `<a class="card img" href="/${svcPath(s)}">${img(s.img, s.imgAlt, 800, 533)}<div class="cb"><h3>${e(s.nav)}</h3><p>${e(s.short)}</p><span class="more">Learn more &rarr;</span></div></a>`).join('')}</div></div></section>
<section class="sec soft" id="quote-sec"><div class="wrap" style="max-width:720px">${qform({ full: true, title: 'Not sure which service? Ask us' })}</div></section>
${band()}`,
});

/* =============== SERVICE PAGES =============== */
for (const s of SERVICES) {
  const path = svcPath(s);
  const trail = [['Home', 'index.html'], ['Services', 'services.html'], [s.nav, path]];
  const others = SERVICES.filter((x) => x.slug !== s.slug).map((x) => [x.nav, svcPath(x)]);
  const body = `${pageHero({ trail, h1: s.h1, lead: s.lead })}
<section class="sec"><div class="wrap cols"><div class="prose">
${img(s.img, s.imgAlt, 800, 450, false).replace('<img ', '<img style="border-radius:14px;margin-bottom:20px;width:100%;height:auto" ')}
<p>${e(s.lead)} ${e(s.slug === 'long-distance' ? 'We cover all major cities from Dehradun.' : 'Reliable Safe Packers & Movers serves all of Dehradun and nearby areas.')}</p>
${s.blocks.map((b) => `<h2>${e(b.h)}</h2>${b.p ? `<p>${e(b.p)}</p>` : ''}${b.ul ? `<ul class="checks">${b.ul.map((i) => `<li>${ico('check')}<span>${e(i)}</span></li>`).join('')}</ul>` : ''}`).join('')}
<h2>Price: what decides your quote</h2>
<p>Every move is different. The quote depends on the volume of goods, distance, floors and lift access, packing material, vehicle size and the date. We give a clear fixed quote after a quick survey or photo check, so you know the price before you book.</p>
<h2>Areas we serve</h2>${chips(AREAS.slice(0, 8).map((a) => [a.name, areaPath(a)]))}
${s.slug === 'long-distance' ? `<h2>Routes from Dehradun</h2>${chips(ROUTES.map((r) => [`Dehradun to ${r.city}`, routePath(r)]))}` : ''}
<div style="margin-top:26px">${faqHtml(s.faqs)}</div>
</div><aside class="side">${qform({ service: svcDefault[s.slug] || '', title: 'Free Quote', sub: `For ${s.nav.toLowerCase()} in Dehradun` })}${contactBox()}${sideBox('Other services', others)}</aside></div></section>
${band()}`;
  emit(path, {
    title: s.title, desc: s.desc, priority: 0.9,
    schema: [crumbSchema(trail), serviceSchema(s.h1, s.desc, path), faqSchema(s.faqs)], body,
  });
}

/* =============== AREA PAGES =============== */
for (const a of AREAS) {
  const path = areaPath(a);
  const title = `Packers & Movers in ${a.name}, Dehradun | Reliable Safe`;
  const desc = `Packers and movers in ${a.name}, Dehradun: house shifting, office moves, packing, car and bike transport. Trained crew and free quote. Call 87557 22118.`;
  const trail = [['Home', 'index.html'], ['Service Areas', 'branches.html'], [a.name, path]];
  const faqs = [
    [`Do you provide packers and movers service in ${a.name}?`, `Yes. We serve ${a.name} and all nearby colonies in Dehradun for house shifting, office relocation, packing, car and bike transport.`],
    [`How soon can you shift from ${a.name}?`, `Local moves in Dehradun can often be arranged for the same or next day. Call us with your date and we confirm availability.`],
    [`How much does shifting cost in ${a.name}?`, `The price depends on goods, floor, lift access and distance. We give a free fixed quote after a quick call or photo check.`],
  ];
  const others = AREAS.filter((x) => x.slug !== a.slug).map((x) => [x.name, areaPath(x)]);
  emit(path, {
    title, desc, priority: 0.7, cur: 'branches.html',
    schema: [crumbSchema(trail), serviceSchema(`Packers and Movers in ${a.name}`, desc, path, a.name), faqSchema(faqs)],
    body: `${pageHero({ trail, h1: `Packers and Movers in ${a.name}, Dehradun`, lead: `Local, trained movers for homes and offices in ${a.name}. Free quote, careful packing and on-time service.` })}
<section class="sec"><div class="wrap cols"><div class="prose">
<h2>Moving in ${e(a.name)}</h2><p>${e(a.blurb)}</p>
<h2>What to know about moves in ${e(a.name)}</h2><ul class="checks">${a.notes.map((n) => `<li>${ico('check')}<span>${e(n)}</span></li>`).join('')}</ul>
<h2>Our services in ${e(a.name)}</h2><ul class="checks">${SERVICES.slice(0, 7).map((s) => `<li>${ico('check')}<span><a href="/${svcPath(s)}"><b>${e(s.nav)}</b></a>: ${e(s.short)}</span></li>`).join('')}</ul>
<h2>How we work</h2><p>Call or send the form. We confirm the pickup and drop address, ask about floors and lift access, and give a fixed quote. On the day the crew arrives on time with packing material, loads carefully and delivers to your new address.</p>
<h2>Other areas we serve</h2>${chips(others)}
<div style="margin-top:26px">${faqHtml(faqs)}</div>
</div><aside class="side">${qform({ from: a.name + ', Dehradun', title: `Free Quote in ${a.name}`, sub: 'We call you back fast' })}${contactBox()}${sideBox('Popular services', svcLinks().slice(0, 6))}</aside></div></section>
${band()}`,
  });
}

/* =============== ROUTE PAGES =============== */
for (const r of ROUTES) {
  const path = routePath(r);
  const title = `Dehradun to ${r.city} Packers & Movers | Reliable Safe`;
  const desc = `Packers and movers from Dehradun to ${r.city} (and ${r.city} to Dehradun): household, office, car and bike shifting. Safe packing, fixed quote. Call 87557 22118.`;
  const trail = [['Home', 'index.html'], ['Service Areas', 'branches.html'], [`Dehradun to ${r.city}`, path]];
  const faqs = [
    [`How much do packers and movers charge from Dehradun to ${r.city}?`, `It depends on the volume of goods, vehicle type (part load or full load), floors and the date. The distance is about ${r.km} km by road. Call 87557 22118 for a fixed quote.`],
    [`Do you also move from ${r.city} to Dehradun?`, `Yes. We handle the route in both directions, for households, offices, cars and bikes.`],
    [`Is my furniture safe on the ${r.city} route?`, `We wrap furniture, pack fragile goods in multiple layers, and secure everything in the vehicle. Ask us about transit cover when you book.`],
  ];
  const others = ROUTES.filter((x) => x.slug !== r.slug && x.group === r.group).slice(0, 8).map((x) => [`Dehradun to ${x.city}`, routePath(x)]);
  emit(path, {
    title, desc, priority: 0.7, cur: 'branches.html',
    schema: [crumbSchema(trail), serviceSchema(`Packers and Movers Dehradun to ${r.city}`, desc, path, r.city), faqSchema(faqs)],
    body: `${pageHero({ trail, h1: `Packers and Movers Dehradun to ${r.city}`, lead: `Safe household and office relocation between Dehradun and ${r.city}, in both directions. Free quote, careful packing.` })}
<section class="sec"><div class="wrap cols"><div class="prose">
<h2>Dehradun to ${e(r.city)} relocation</h2><p>${e(r.note)}</p>
<div class="tbl-wrap"><table class="tbl"><tbody><tr><th scope="row">Route</th><td>Dehradun &harr; ${e(r.city)}</td></tr><tr><th scope="row">Approx. distance</th><td>About ${r.km} km by road</td></tr><tr><th scope="row">We move</th><td>Household goods, offices, car, bike</td></tr><tr><th scope="row">Vehicle</th><td>Part load or full vehicle</td></tr></tbody></table></div>
<h2>Good to know</h2><ul class="checks">${r.tips.map((t) => `<li>${ico('check')}<span>${e(t)}</span></li>`).join('')}</ul>
<h2>What is included</h2><ul class="checks"><li>${ico('check')}<span>Free survey and fixed quote</span></li><li>${ico('check')}<span>Packing with quality material</span></li><li>${ico('check')}<span>Loading, transport and unloading</span></li><li>${ico('check')}<span>Updates during transit</span></li><li>${ico('check')}<span>Placement at your new address</span></li></ul>
<h2>Related services</h2>${chips(svcLinks().slice(0, 7))}
<h2>Other routes</h2>${chips(others)}
<div style="margin-top:26px">${faqHtml(faqs)}</div>
</div><aside class="side">${qform({ to: r.city, service: r.group === 'near' ? 'House Shifting' : 'Long Distance Move', title: `Quote: Dehradun to ${r.city}`, sub: 'Free quote, no obligation' })}${contactBox()}</aside></div></section>
${band()}`,
  });
}

/* =============== SERVICE AREAS HUB (branches.html) =============== */
{
  const trail = [['Home', 'index.html'], ['Service Areas', 'branches.html']];
  emit('branches.html', {
    title: 'Service Areas & Routes | Reliable Safe Packers Dehradun',
    desc: 'Our Dehradun office, localities we serve and city routes: Mussoorie, Rishikesh, Haridwar, Roorkee, Delhi NCR, Chandigarh, Lucknow, Jaipur, Mumbai and more.',
    priority: 0.8,
    schema: [crumbSchema(trail)],
    body: `${pageHero({ trail, h1: 'Service Areas & Routes', lead: 'Our office is in Dehradun. From here we serve every locality in the city, nearby towns and cities across India.' })}
<section class="sec"><div class="wrap">
<div class="split"><div><span class="eyebrow">Our office</span><h2>Dehradun Office</h2><address class="addr"><p>${ico('pin')} ${e(S.street)}, ${S.city} (U.K.), ${S.zip}</p><p>${ico('phone')} <a href="tel:${S.phone}">${S.phoneShow}</a></p><p>${ico('mail')} <a href="mailto:${S.email}">${S.email}</a></p><p>${ico('clock')} ${e(S.hours)}</p></address>
<a class="btn btn-cta" href="https://www.google.com/maps/search/?api=1&query=Reliable+Safe+Packers+%26+Movers+Dehradun" target="_blank" rel="noopener">${ico('pin')} Open in Google Maps</a></div>
<div class="map"><iframe title="Reliable Safe Packers & Movers location map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3871.6096593390835!2d77.9832249755629!3d30.2821437748047!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39092bb9f451fc3b%3A0x92b55e1330b1a16d!2sReliable%20Safe%20Packers%20%26%20Movers!5e1!3m2!1sen!2sin!4v1734193217146!5m2!1sen!2sin"></iframe></div></div></div></section>
<section class="sec soft"><div class="wrap"><div class="sec-head"><h2>Localities in Dehradun</h2><p>Select your area for local details.</p></div>${chips(AREAS.map((a) => [a.name, areaPath(a)]))}</div></section>
<section class="sec" id="routes"><div class="wrap"><div class="sec-head"><h2>Nearby cities</h2></div>${chips(ROUTES.filter((r) => r.group === 'near').map((r) => [`Dehradun to ${r.city}`, routePath(r)]))}
<div class="sec-head" style="margin-top:30px"><h2>Intercity routes across India</h2><p>Household, office, car and bike relocation in both directions.</p></div>${chips(ROUTES.filter((r) => r.group === 'far').map((r) => [`Dehradun to ${r.city}`, routePath(r)]))}</div></section>
${band()}`,
  });
}

/* =============== ABOUT =============== */
{
  const trail = [['Home', 'index.html'], ['About', 'about.html']];
  emit('about.html', {
    title: 'About Reliable Safe Packers & Movers | Dehradun',
    desc: 'About Reliable Safe Packers and Movers, a Dehradun moving company with 15+ years of experience in safe, affordable household and office relocation.',
    priority: 0.7,
    schema: [crumbSchema(trail)],
    body: `${pageHero({ trail, h1: 'About Reliable Safe Packers & Movers', lead: 'A Dehradun moving company focused on safe handling, honest pricing and on-time delivery.' })}
<section class="sec"><div class="wrap split"><div>${img('home-2', 'Movers talking to a family before a house shifting', 900, 600, false)}</div>
<div><span class="eyebrow">Who we are</span><h2>Reliable, affordable moving in Dehradun</h2>
<p>At Reliable Safe Packers and Movers, we provide reliable and affordable moving services in Dehradun. With 15+ years of experience and a team of skilled professionals, we handle your belongings with care from packing to transport, unloading and unpacking.</p>
<p>We know moving is stressful, so we offer 24/7 support to assist you at every step. Whether you are relocating a home or an office, our goal is a smooth and hassle-free move.</p>
<a class="btn btn-cta" href="/contact.html">Contact us</a></div></div></section>
<section class="sec soft"><div class="wrap"><div class="grid c3">
<div class="card"><div class="ci">${ico('shield')}</div><h3>Our mission</h3><p>To provide safe, reliable and cost-effective moving services, and make every move stress-free by handling each detail with care.</p></div>
<div class="card"><div class="ci">${ico('route')}</div><h3>Our vision</h3><p>To be the most trusted moving company in Dehradun, known for dependable and affordable relocation.</p></div>
<div class="card"><div class="ci">${ico('users')}</div><h3>Our promise</h3><p>Skilled staff, premium packing materials and personal attention. Your satisfaction is our success.</p></div></div></div></section>
<section class="sec"><div class="wrap"><div class="sec-head"><span class="eyebrow">What we offer</span><h2>Services</h2></div>${chips(svcLinks())}</div></section>
<section class="sec soft"><div class="wrap"><div class="sec-head center"><h2>What our customers say</h2></div>${reviewCards()}</div></section>
${band()}`,
  });
}

/* =============== CONTACT =============== */
{
  const trail = [['Home', 'index.html'], ['Contact', 'contact.html']];
  const faqs = HOME_FAQS.slice(0, 4);
  emit('contact.html', {
    title: 'Contact Reliable Safe Packers & Movers | Dehradun',
    desc: 'Contact Reliable Safe Packers & Movers in Dehradun. Call 87557 22118, WhatsApp, or send the form for a free moving quote. Office at Sewla Khurd, Dehradun.',
    priority: 0.8,
    schema: [crumbSchema(trail), { '@context': 'https://schema.org', '@type': 'ContactPage', url: abs('contact.html'), name: 'Contact', mainEntity: { '@id': `${S.url}/#org` } }],
    body: `${pageHero({ trail, h1: 'Contact Us for a Free Quote', lead: 'Call, WhatsApp or send the form. We reply fast with a clear quote.' })}
<section class="sec"><div class="wrap cols"><div class="prose">
<div class="grid c2"><a class="card" href="tel:${S.phone}"><div class="ci">${ico('phone')}</div><h3>Call us</h3><p><b>${S.phoneShow}</b></p><span class="more">Tap to call</span></a>
<a class="card" href="https://wa.me/${S.wa}?text=${encodeURIComponent('Hi, I need a moving quote.')}" target="_blank" rel="noopener"><div class="ci">${ico('wa')}</div><h3>WhatsApp</h3><p>Send photos of your goods for a faster quote.</p><span class="more">Chat now</span></a>
<a class="card" href="mailto:${S.email}"><div class="ci">${ico('mail')}</div><h3>Email</h3><p>${S.email}</p><span class="more">Send email</span></a>
<div class="card"><div class="ci">${ico('pin')}</div><h3>Office</h3><address class="addr"><p>${e(S.street)}, ${S.city} (U.K.) ${S.zip}</p></address><p>${e(S.hours)}</p></div></div>
<h2 style="margin-top:28px">Find us</h2><div class="map"><iframe title="Reliable Safe Packers & Movers map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3871.6096593390835!2d77.9832249755629!3d30.2821437748047!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39092bb9f451fc3b%3A0x92b55e1330b1a16d!2sReliable%20Safe%20Packers%20%26%20Movers!5e1!3m2!1sen!2sin!4v1734193217146!5m2!1sen!2sin"></iframe></div>
<div style="margin-top:26px">${faqHtml(faqs)}</div></div>
<aside class="side">${qform({ full: true, title: 'Send Us a Message', sub: 'We call you back fast' })}</aside></div></section>`,
  });
}

/* =============== THANK YOU / 404 / PRIVACY =============== */
emit('thank-you.html', {
  title: 'Thank You | Reliable Safe Packers & Movers', desc: 'We received your request and will call you shortly.', noindex: true, cur: '',
  body: `<section class="center-page"><div class="wrap" style="max-width:560px"><div class="big">${ico('check', '')}</div><h1>Thank you!</h1><p>We got your request. Our team will call you shortly with your free quote.</p><p>Need it urgently? Call us now.</p>
<p><a class="btn btn-cta" href="tel:${S.phone}">${ico('phone')} Call ${S.phoneShow}</a> <a class="btn btn-wa" href="https://wa.me/${S.wa}" target="_blank" rel="noopener">${ico('wa')} WhatsApp</a></p><p><a href="/">Back to home</a></p></div></section>
<script>try{window.dataLayer=window.dataLayer||[];dataLayer.push({event:'lead_thank_you'});if(typeof gtag==='function')gtag('event','lead_thank_you');}catch(e){}</script>`,
});
emit('404.html', {
  title: 'Page not found | Reliable Safe Packers & Movers', desc: 'Page not found.', noindex: true, cur: '',
  body: `<section class="center-page"><div class="wrap" style="max-width:600px"><div class="big">404</div><h1>Page not found</h1><p>The page you are looking for may have moved. Try these:</p>${chips([['Home', 'index.html'], ['Services', 'services.html'], ['Service areas', 'branches.html'], ['Contact', 'contact.html']])}
<p style="margin-top:22px"><a class="btn btn-cta" href="tel:${S.phone}">${ico('phone')} Call ${S.phoneShow}</a></p></div></section>`,
});
emit('privacy-policy.html', {
  title: 'Privacy Policy | Reliable Safe Packers & Movers', desc: 'How Reliable Safe Packers & Movers collects and uses information from our website forms.', priority: 0.2, cur: '',
  body: `${pageHero({ trail: [['Home', 'index.html'], ['Privacy Policy', 'privacy-policy.html']], h1: 'Privacy Policy', lead: 'How we handle the information you send us.' })}
<section class="sec"><div class="wrap prose" style="max-width:820px">
<h2>Information we collect</h2><p>When you submit our quote form we collect your name, mobile number, moving locations, service type, preferred date and any message you add. We also record which page you used and campaign details (such as UTM parameters) to understand which advertisements work.</p>
<h2>How we use it</h2><p>We use this information only to contact you about your moving enquiry, prepare a quote and improve our service. We do not sell your information.</p>
<h2>Who sees it</h2><p>Your enquiry is delivered to our team through a secure internal messaging tool. Our website hosting provider processes requests to run the site.</p>
<h2>Cookies and analytics</h2><p>The site may use analytics or advertising tags (for example Google) to measure visits and ad performance. You can control cookies in your browser settings.</p>
<h2>Your choices</h2><p>To ask us to delete your enquiry data, call ${S.phoneShow} or email <a href="mailto:${S.email}">${S.email}</a>.</p>
<p>Last updated: ${S.year}.</p></div></section>`,
});

/* =============== sitemap, robots, manifest =============== */
const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `<url><loc>${abs(p.path)}</loc><lastmod>${today}</lastmod><priority>${p.priority.toFixed(1)}</priority></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /thank-you.html\n\nSitemap: ${S.url}/sitemap.xml\n`);
writeFileSync(join(ROOT, 'site.webmanifest'), JSON.stringify({ name: S.name, short_name: 'Reliable Packers', start_url: '/', display: 'browser', theme_color: '#0a2540', background_color: '#ffffff', icons: [{ src: '/assets/img/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/assets/img/icon-512.png', sizes: '512x512', type: 'image/png' }] }));
console.log(`built ${pages.length} indexable pages`);
