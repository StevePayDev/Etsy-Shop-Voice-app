# ShopVoice

Find your shop voice. Write better listings. Sell more.

## Setup

1. Clone this repo
2. Install dependencies:
   ```
   npm install
   ```
3. Add your Anthropic API key to `.env.local`:
   ```
   ANTHROPIC_API_KEY=your_key_here
   ```
4. Run locally:
   ```
   npm run dev
   ```
5. Open http://localhost:3000

## Deploy to Vercel

1. Push to GitHub
2. Import repo at vercel.com
3. Add `ANTHROPIC_API_KEY` in Vercel environment variables
4. Deploy

## How it works

- Pages: Next.js pages router
- AI: Anthropic Claude Haiku via server-side API routes
- Storage: localStorage (client-side)
- Styling: inline styles, no CSS framework needed

## Structure

```
pages/
  index.js          Main app (questionnaire + identity flow)
  api/
    generate-pack.js    Identity pack generation
    generate-listing.js Listing generation + validation
components/
  ListingDashboard.js
  ListingInput.js
  ListingOutput.js
  theme.js          Shared colours + field config
lib/
  prompts.js        All AI prompts
  ai.js             Anthropic client wrapper
```
