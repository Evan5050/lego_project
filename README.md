# LEGO Inflation Without Prices

A small data visualization project that looks at how LEGO set complexity has changed over time without using price data. It compares piece counts, part variety, color variety, specialized pieces, and minifigures across sets from 1949–2027.

## Run locally

```bash
cd app
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Refresh the data

The source CSV files live in `data/`. To rebuild the browser-ready summary file, run:

```bash
node scripts/preprocess-data.mjs
```

This writes `app/public/data/lego-summary.json`.

## Tech

React, TypeScript, Vite/Vinext, Tailwind CSS, and Recharts.
