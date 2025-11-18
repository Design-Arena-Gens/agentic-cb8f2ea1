# Pipeline Pilot — Lead Generation AI Agent

Pipeline Pilot is a Next.js application that synthesizes a full-funnel lead generation blueprint tailored to your product, goals, and preferred channels. Feed it the essentials and it returns channel plays, copy, automations, and experiments you can plug directly into your go-to-market motion.

## Quickstart

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to launch the agent.

## Environment

Set `OPENAI_API_KEY` to enable the GPT-powered strategist:

```bash
export OPENAI_API_KEY=sk-...
```

If the key is absent, the app gracefully falls back to a heuristic playbook so you can still test the UX.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm start` — run the production server
- `npm run lint` — Next.js lint checks

## Tech Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS for styling
- OpenAI Responses API for plan generation
- Zod-powered validation and safe fallbacks

## Deployment

The project is prepped for Vercel. Run `vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-cb8f2ea1` once you have a production-ready build.
