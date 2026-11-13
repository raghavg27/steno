# Steno

**Teach your AI to write like a human.**

Steno is one writing skill for AI. Paste it into custom instructions once and your AI writes like a person from then on, or run it on text you already have. The landing page has a live demo that runs the real skill on the visitor's own text, with one click checks on QuillBot and GPTZero.

One time payment, ₹4,999. Built for freelancers and people who write for clients. No app, no login, no subscription.

Live site: **[steno-ai.vercel.app](https://steno-ai.vercel.app)**

---

## The problem it solves

Everyone can tell when something was written by ChatGPT. The giveaway is not grammar. It is rhythm, puffed up openers, three item lists, em dashes everywhere, and a dozen other habits the model reaches for when it has nothing to say.

Detector scores move and none of them publish their method, so Steno makes no promise about beating one. It targets the part you can actually control: the patterns that make a human reader stop and think, a bot wrote this.

## What it catches

Twelve families of tells, each with concrete substitutions rather than vague advice.

## The result

Same information in, no AI habits out, nothing invented. Steno does not promise shorter text.

> **Before.** In today's rapidly evolving digital landscape, choosing the right project management tool stands as a critical decision for teams of all sizes. It is important to note that the market offers a vast tapestry of options.

> **After.** Picking a project management tool is a real decision, and there are a lot of options.

Across the full sample on the landing page: 11 tells found, every claim kept.

## What you get

**The instruction layer.** Instructions that sit in custom instructions, project instructions or a system prompt, so the model writes clean text from the start instead of you fixing it afterwards. Ships in four versions: ChatGPT custom instructions, Claude projects and styles, a short version for character limits, and a per message version for any chat.

**The skills file.** The editing pass for text you already have. Follows the Claude Skills format, works as a plain prompt if you do not use skills, and keeps every fact. It can still make small changes to text that is already clean.

Works with ChatGPT, Claude, Gemini, Copilot, Cursor and most agent frameworks. Includes free updates and a commercial licence for client work.

## This repository

The Steno website. Static HTML pages plus one serverless function for the live demo. No build step, no framework.

- `index.html` is the landing page. Its scripts are in `js/`. The Real results section shows real Steno output from a fresh chat. If you change the examples, use real output only.
- The guides, the comparison page and the About, Changelog, Privacy, Terms and Refunds pages use `article.css`.
- The fonts are in `fonts/`. The site does not load fonts from Google.

## Facts and llms.txt

`facts.json` holds the price and the demo limits. Do not write `llms.txt` by hand. Edit `llms.template.txt` or `facts.json`, then run:

```bash
npm run facts
```

The command builds `llms.txt`. It stops with an error if a page shows a price that is different from `facts.json`. Run it before each release.

## Security policy

`vercel.json` sets a strict content security policy. Scripts can load only from this site and from unpkg.com. Do not add inline scripts or `onclick` attributes. Put scripts in `js/` and add event listeners there.

## Live demo setup (Vercel)

`api/convert.js` runs the skill with the Anthropic API. The skill text is **not** in this repo. Set these in Vercel, Project, Settings, Environment Variables:

- `ANTHROPIC_API_KEY` your Anthropic API key
- `STENO_SKILL` the full skill text (the same thing buyers get)
- `STENO_MODEL` optional, defaults to `claude-opus-5-5`

Abuse limits: 2,500 characters per request, 3 free tries per browser, and a per instance cap of 8 requests an hour per IP. For a hard cap across instances, add Vercel KV or Upstash.

- Hand written HTML and CSS, with the scripts in separate files
- Custom type pairing, ambient gradient and film grain treatment, and a live before and after demo the visitor can toggle
- Original logo mark in SVG, rendered out to a full favicon and app icon set
- Open Graph share card generated from source HTML rather than hand edited in an image tool
- Three long form guide pages and one honest comparison page that double as the SEO surface, written in the standard the product sells
- Structured data for Product, FAQ, Article and breadcrumbs, plus a sitemap and crawl rules that admit assistant bots
- Deployed on Vercel with clean URLs, cache policy, security headers and a strict content security policy

Built end to end by one person: product, copy, brand, design and front end.

## Buy

Payment runs through Buy Me a Coffee. Card and UPI both work. The files unlock on the page as soon as the payment clears, and a copy goes to your email.

Price ₹4,999, one time. The free demo on the page lets people test it on their own text before paying.

## Contact

raghavg2705@gmail.com
