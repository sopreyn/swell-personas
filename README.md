# Swell Practice Room

A chat UI for practicing a hard conversation with an AI that plays one of the personality archetypes in `lib/personas`. The persona's replies come from Claude through a server route, so the API key never reaches the browser.

```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY (plus the Supabase values)
npm run dev                  # http://localhost:3000
```

Without `ANTHROPIC_API_KEY` the UI still runs and falls back to scripted replies.

## How it fits together

```
Composer -> app/page.tsx -> POST /api/chat -> app/api/chat/route.ts -> Anthropic API
```

- `app/api/chat/route.ts` looks the persona and scenario up on the server, builds the system prompt with `compileSystemPrompt` plus the reply format in `lib/ui/chat-prompt.ts`, and returns `{ reply, tension, coach }`.
- `tension` (1 to 5) drives the meter in the top bar. `coach` is a one-line note on the user's message, shown only on the review screen.
- `components/` holds the UI: `Sidebar`, `TopBar` (archetype and scenario picker, tension meter), `ChatLog`, `Composer`, `ReviewPanel`.
- `lib/ui/` holds UI-only data: scenarios, persona colors, sample sidebar history, the placeholder user.

Placeholders to replace: the scenarios in `lib/ui/scenarios.ts`, the user in `lib/ui/user.ts`, and the sample history in `lib/ui/threads.ts`. Conversations are not saved yet; `lib/conversation` and `lib/supabase.ts` are the intended persistence layer.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
