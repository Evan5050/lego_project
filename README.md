# LEGO Inflation Without Prices

A small data visualization project that looks at how LEGO set complexity has changed over time without using price data. It compares piece counts, part variety, color variety, specialized pieces, and minifigures across sets from 1949–2027.

## Screenshots

<img width="1800" height="1169" alt="Screenshot 2026-09-01 at 3 32 17 PM" src="https://github.com/user-attachments/assets/db7787e6-7f57-45f8-ba5c-50116ab0bf61" />

<img width="1800" height="390" alt="Screenshot 2026-09-01 at 3 32 32 PM" src="https://github.com/user-attachments/assets/bc62004d-fa70-4fe7-9c82-0c05f5484b92" />

<img width="1800" height="1169" alt="Screenshot 2026-09-01 at 3 32 46 PM" src="https://github.com/user-attachments/assets/585dafdb-6462-4ac9-a51f-21503576eb70" />

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

## Data availability

`data/inventory_parts.csv` is not included in this repository because it exceeds GitHub's file-size limit. Download the LEGO CSV database from [Rebrickable](https://rebrickable.com/downloads/) and place `inventory_parts.csv` in the `data/` folder before rebuilding the summary data.

## Tech

React, TypeScript, Vite/Vinext, Tailwind CSS, and Recharts.
