# Project Notes

## Goal

Explore whether LEGO sets have become more complex over time using inventory data instead of prices.

## What it measures

- Median piece count per set
- Unique part ratio
- Number of colors and minifigures
- Share of pieces that are not basic bricks, plates, or tiles

## Data approach

The preprocessing script selects the lowest-numbered inventory version for each set, excludes spare parts, and calculates metrics only for sets with linked inventory data. The Creative Density score combines structural scale, part diversity, color variety, and minifigure count into a comparative 100-point index.

## Future direction

Add personal collection analysis so a user can import or select their own LEGO sets and view the same metrics for their collection. The dashboard could then compare a personal collection with the full LEGO dataset or with sets released during a chosen year range, making it easier to see how an individual collection differs in scale, themes, part variety, colors, and minifigures.

## Project structure

- `data/` — source LEGO CSV files
- `scripts/preprocess-data.mjs` — summary-data generator
- `app/` — interactive React application
