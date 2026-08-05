# Steno

**Stop sounding like a language model.**

Steno is a writing standard for AI output. It is a paste-once instruction layer plus an editing pass that strips the patterns readers recognise as machine written, without touching a single claim in the text.

One time payment, ₹99. No app, no login, no subscription.

Live site: **[steno-ai.vercel.app](https://steno-ai.vercel.app)**

---

## The problem it solves

Everyone can tell when something was written by ChatGPT. The giveaway is not grammar. It is rhythm, puffed up openers, three item lists, em dashes everywhere, and a dozen other habits the model reaches for when it has nothing to say.

Detector scores move and none of them publish their method, so Steno makes no promise about beating one. It targets the part you can actually control: the patterns that make a human reader stop and think, a bot wrote this.

## What it catches

Twelve families of tells, each with concrete substitutions rather than vague advice.

## The result

Same information in, fewer words out, nothing invented.

> **Before.** In today's rapidly evolving digital landscape, choosing the right project management tool stands as a critical decision for teams of all sizes. It is important to note that the market offers a vast tapestry of options.

> **After.** Picking a project management tool is a real decision, and there are a lot of options.

Across the full sample on the landing page: 11 tells found, 118 words became 51, every claim kept.

## What you get

**The instruction layer.** A block of instructions that sits in custom instructions, project instructions or a system prompt, so the model writes clean text from the start instead of you fixing it afterwards. Ships in four versions: ChatGPT custom instructions, Claude projects and styles, a short version for character limits, and a per message version for any chat.

**The skills file.** The editing pass for text you already have. Follows the Claude Skills format, works as a plain prompt if you do not use skills, keeps every fact, and returns text unchanged when it is already clean.

Works with ChatGPT, Claude, Gemini, Copilot, Cursor and most agent frameworks. Includes free updates and a commercial licence for client work.

## This repository

The Steno landing page. A single static page, no build step, no dependencies, no framework.

- Hand written HTML and CSS with the styles and scripts inline
- Custom type pairing, ambient gradient and film grain treatment, and a live before and after demo the visitor can toggle
- Original logo mark in SVG, rendered out to a full favicon and app icon set
- Open Graph share card generated from source HTML rather than hand edited in an image tool
- Three long form guide pages that double as the SEO surface, written in the standard the product sells
- Structured data for Product, FAQ, Article and breadcrumbs, plus a sitemap and crawl rules that admit assistant bots
- Deployed on Vercel with clean URLs, cache policy and security headers

Built end to end by one person: product, copy, brand, design and front end.

## Buy

Payment runs through Buy Me a Coffee. Card and UPI both work. The files unlock on the page as soon as the payment clears, and a copy goes to your email.

Launch price ₹99, down from ₹499. If it does not work for you, write in and say so. At ₹99 there is no argument worth having about a refund.

## Contact

raghavg2705@gmail.com
