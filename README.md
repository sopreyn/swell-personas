# Swell Practice Room

A chat-style proof of concept for practicing conflict resolution with an AI that plays one of three personality archetypes (`lib/personas/archetypes`).

- **UI:** `components/practice/*`, styled by the tokens at the top of `app/globals.css`. The accent colour (`--persona`) changes with the archetype.
- **Chat:** `POST /api/chat` builds the system prompt from `lib/personas`, calls the Anthropic SDK and returns the reply plus a 1 to 5 tension score. `POST /api/review` writes the coaching lines on the review screen.
- **No API key?** Copy `.env.example` to `.env.local`. Without `ANTHROPIC_API_KEY` both routes fall back to scripted replies so the UI still runs.
- **History:** sessions are saved in the browser (`lib/practice/history.ts`) in the same shape the database layer can store later.
- **Placeholders:** the user name and personality type (`lib/practice/catalog.ts`) and the six scenarios (`lib/personas/scenarios.ts`).

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
