// Vercel serverless function: receives quote form, posts to Slack incoming webhook.
// Env var required: SLACK_WEBHOOK_URL

const clean = (v, max) =>
  String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);

// Slack mrkdwn: escape control chars so user text cannot inject links/mentions.
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const SERVICES = new Set([
  'House Shifting', 'Office Relocation', 'Local Shifting', 'Long Distance Move',
  'Car Transport', 'Bike Transport', 'Packing Only', 'Warehouse / Storage', 'Other'
]);

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method' });
  }

  const hook = process.env.SLACK_WEBHOOK_URL;
  if (!hook) return res.status(500).json({ ok: false, error: 'not_configured' });

  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};

  // honeypot: bots fill the hidden field. Pretend success, send nothing.
  if (clean(b.website, 50)) return res.status(200).json({ ok: true });

  const name = clean(b.name, 80);
  let phone = clean(b.phone, 20).replace(/\D/g, '');
  if (phone.length === 12 && phone.startsWith('91')) phone = phone.slice(2);
  if (name.length < 2 || !/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ ok: false, error: 'invalid' });
  }

  const service = SERVICES.has(b.service) ? b.service : clean(b.service, 40) || '-';
  const from = clean(b.from, 120) || '-';
  const to = clean(b.to, 120) || '-';
  const date = clean(b.date, 20) || '-';
  const message = clean(b.message, 600);
  const page = clean(b.page, 120) || '-';

  const t = b.track && typeof b.track === 'object' ? b.track : {};
  const trackLine = Object.keys(t).slice(0, 9)
    .map((k) => `${clean(k, 20)}=${clean(t[k], 80)}`).join(' | ');

  const lines = [
    `*New moving lead* :truck:`,
    `*Name:* ${esc(name)}`,
    `*Phone:* ${phone}  (tel:+91${phone})`,
    `*Service:* ${esc(service)}`,
    `*From:* ${esc(from)}`,
    `*To:* ${esc(to)}`,
    `*Move date:* ${esc(date)}`,
  ];
  if (message) lines.push(`*Message:* ${esc(message)}`);
  lines.push(`*Page:* ${esc(page)}`);
  if (trackLine) lines.push(`*Ad data:* ${esc(trackLine)}`);

  try {
    const r = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `New lead: ${esc(name)} ${phone}`, blocks: [
        { type: 'section', text: { type: 'mrkdwn', text: lines.join('\n') } }
      ] }),
    });
    if (!r.ok) return res.status(502).json({ ok: false, error: 'slack' });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'slack' });
  }
};
