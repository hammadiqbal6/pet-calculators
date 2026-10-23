# Contact form via EmailJS (FREE plan)

The `/contact/` page can show an accessible form that sends mail through the
[EmailJS](https://www.emailjs.com/) REST API with plain `fetch` — no
`@emailjs/browser` SDK and no extra npm dependency. The script loads only on
`/contact/`.

If any of the three public env vars is empty at **build** time, the page keeps
the existing mailto button and never ships a broken form. The mailto link stays
visible as a secondary option when the form is enabled.

## Build env vars

Set these in Cloudflare Workers Builds (Variables) or a local `.env` (see
`.env.example`). They are `PUBLIC_*` and are inlined into the static HTML/JS at
`npm run build`.

| Variable | EmailJS UI name | Notes |
|---|---|---|
| `PUBLIC_EMAILJS_SERVICE_ID` | Service ID | e.g. `service_…` |
| `PUBLIC_EMAILJS_TEMPLATE_ID` | Template ID | e.g. `template_…` |
| `PUBLIC_EMAILJS_PUBLIC_KEY` | Public Key / Account Public Key | formerly “User ID”; safe in the browser |

**Do not** put the EmailJS **private** key (or `accessToken`) in the repo,
Workers Variables, or client code. The FREE-plan browser send uses only the
public key as `user_id` in the JSON body.

After changing env vars, rebuild and redeploy so Astro re-inlines them.

## REST call

```http
POST https://api.emailjs.com/api/v1.0/email/send
Content-Type: application/json
```

```json
{
  "service_id": "<PUBLIC_EMAILJS_SERVICE_ID>",
  "template_id": "<PUBLIC_EMAILJS_TEMPLATE_ID>",
  "user_id": "<PUBLIC_EMAILJS_PUBLIC_KEY>",
  "template_params": {
    "from_name": "…",
    "reply_to": "…",
    "message": "…",
    "page_url": "https://…/contact/",
    "site_name": "PetCalc Tools"
  }
}
```

CSP (`public/_headers`) allow-lists `connect-src https://api.emailjs.com`.

## Email template variables

Create an EmailJS email template that uses these placeholders (double curly braces):

| Template variable | Source |
|---|---|
| `{{from_name}}` | Name field |
| `{{reply_to}}` | Email field (set Reply-To in the template to this) |
| `{{message}}` | Message body |
| `{{page_url}}` | Absolute `/contact/` URL at build time |
| `{{site_name}}` | `siteConfig.siteName` |

Suggested subject: `Contact from {{from_name}} ({{site_name}})`.

## Free-plan safeguards (client-side)

- One successful send per 60 seconds per browser (`localStorage` throttle).
- Hidden honeypot field (`company`); filled → fake success, no API call.
- Message length capped (4000 characters).
- Submit button disabled while the request is in flight.

These reduce casual abuse; they are not a substitute for EmailJS dashboard
limits or turning off unused services.

## Privacy

When the form is enabled, messages (name, email, body) leave the browser to
EmailJS and then to your configured mailbox. Calculator inputs still never leave
the browser. See `/privacy/` and keep that page accurate if you change providers.
