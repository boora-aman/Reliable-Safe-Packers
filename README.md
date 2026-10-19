# Reliable Safe Packers & Movers website

Static site on Vercel + one serverless function (`api/lead.js`) that posts quote-form leads to Slack.

## Edit content
Pages are generated. Edit `tools/data.mjs` (services, areas, routes, FAQs) or `tools/build.mjs` (templates), then:

    node tools/build.mjs

This rewrites all `.html`, `sitemap.xml`, `robots.txt`. Commit the output.

## Slack lead alerts
1. Go to https://api.slack.com/apps -> Create New App -> From scratch (name: Website Leads, pick workspace).
2. Left menu: Incoming Webhooks -> turn On.
3. Add New Webhook to Workspace -> choose the channel (e.g. #leads) -> Allow.
4. Copy the webhook URL (https://hooks.slack.com/services/...).
5. Vercel -> Project -> Settings -> Environment Variables -> add `SLACK_WEBHOOK_URL` = that URL (Production + Preview). Redeploy.
6. Submit the form on the live site to test.

Never commit the webhook URL.

## Ad tracking
Form sends utm_* / gclid to Slack. Thank-you page (`/thank-you.html`) fires `lead_thank_you`; call/WhatsApp taps fire `call_click` / `whatsapp_click` via dataLayer/gtag. Add your Google tag to the page head in `tools/build.mjs`.

## Test locally
Open `index.html` directly in the browser (all links are relative, works from file://), or:

    python3 -m http.server 8000      # then open http://localhost:8000
    npx vercel dev                   # also runs /api/lead (needs SLACK_WEBHOOK_URL in .env.local)
