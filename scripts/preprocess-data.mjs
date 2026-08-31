import fs from 'node:fs';
import readline from 'node:readline';

const root = new URL('..', import.meta.url).pathname;
const source = (name) => `${root}data/${name}.csv`;
const output = `${root}app/public/data/lego-summary.json`;

function parseCsv(line) {
  const values = [];
  let value = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { value += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) { values.push(value); value = ''; }
    else value += char;
  }
  values.push(value);
  return values;
}

async function rows(name, visit) {
  const input = readline.createInterface({ input: fs.createReadStream(source(name)) });
  let header;
  for await (const line of input) {
    if (!header) { header = parseCsv(line); continue; }
    if (!line) continue;
    const values = parseCsv(line);
    const record = Object.fromEntries(header.map((key, index) => [key, values[index] ?? '']));
    visit(record);
  }
}

const themes = new Map();
await rows('themes', (row) => themes.set(row.id, row));
function rootTheme(id) {
  let theme = themes.get(String(id));
  const visited = new Set();
  while (theme?.parent_id && !visited.has(theme.id)) {
    visited.add(theme.id);
    theme = themes.get(theme.parent_id);
  }
  return theme?.name || 'Uncategorized';
}

const sets = new Map();
await rows('sets', (row) => {
  const year = Number(row.year);
  if (year >= 1949 && year <= 2027) {
    sets.set(row.set_num, { id: row.set_num, name: row.name, year, theme: rootTheme(row.theme_id), listedParts: Number(row.num_parts) || 0 });
  }
});

const selectedInventory = new Map();
await rows('inventories', (row) => {
  if (!sets.has(row.set_num)) return;
  const current = selectedInventory.get(row.set_num);
  const version = Number(row.version) || 99;
  if (!current || version < current.version) selectedInventory.set(row.set_num, { id: row.id, version });
});
const inventoryToSet = new Map([...selectedInventory].map(([set, inventory]) => [inventory.id, set]));

const categoryByPart = new Map();
await rows('parts', (row) => categoryByPart.set(row.part_num, Number(row.part_cat_id)));
const categoryNames = new Map();
await rows('part_categories', (row) => categoryNames.set(Number(row.id), row.name));
const basicCategories = new Set([...categoryNames].filter(([, name]) => ['Bricks', 'Plates', 'Tiles'].includes(name)).map(([id]) => id));

const colors = new Map();
await rows('colors', (row) => {
  if (Number(row.id) >= 0) colors.set(row.id, { id: Number(row.id), name: row.name, rgb: row.rgb, years: {}, themes: {} });
});

const metricBySet = new Map([...sets].map(([id]) => [id, { total: 0, unique: new Set(), colors: new Set(), specialized: 0, minifigs: 0 }]));
await rows('inventory_parts', (row) => {
  const set = inventoryToSet.get(row.inventory_id);
  if (!set || row.is_spare === 'True') return;
  const metric = metricBySet.get(set);
  const quantity = Number(row.quantity) || 0;
  if (quantity <= 0) return;
  metric.total += quantity;
  metric.unique.add(row.part_num);
  const color = colors.get(row.color_id);
  if (color) {
    metric.colors.add(row.color_id);
    const year = sets.get(set).year;
    const theme = sets.get(set).theme;
    color.years[year] = (color.years[year] || 0) + quantity;
    color.themes[theme] = (color.themes[theme] || 0) + quantity;
  }
  if (!basicCategories.has(categoryByPart.get(row.part_num))) metric.specialized += quantity;
});
await rows('inventory_minifigs', (row) => {
  const set = inventoryToSet.get(row.inventory_id);
  if (set) metricBySet.get(set).minifigs += Number(row.quantity) || 0;
});

const cleanSets = [];
for (const [id, set] of sets) {
  const metric = metricBySet.get(id);
  if (!metric.total) continue; // inventory data is unavailable for this set
  cleanSets.push({
    id, name: set.name, year: set.year, theme: set.theme,
    pieces: metric.total, listedParts: set.listedParts,
    uniqueRatio: Number((metric.unique.size / metric.total).toFixed(4)),
    colors: metric.colors.size, minifigs: metric.minifigs,
    specializedShare: Number((metric.specialized / metric.total).toFixed(4)),
  });
}

const palette = [...colors.values()].map(({ years, themes, ...color }) => ({
  ...color,
  years: Object.entries(years).map(([year, quantity]) => [Number(year), quantity]),
  themes: Object.entries(themes).sort((a, b) => b[1] - a[1]).slice(0, 6),
})).filter((color) => color.years.length);

const payload = {
  generatedAt: new Date().toISOString(),
  methodology: {
    canonicalInventory: 'Lowest-numbered inventory version per set; spare parts excluded.',
    basicParts: 'Only categories named Bricks, Plates, or Tiles. All other part categories are treated as specialized.',
    reliableYears: '1949–2027; sets without a linked inventory are excluded from calculated metrics.',
  },
  sets: cleanSets,
  themes: [...new Set(cleanSets.map((set) => set.theme))].sort(),
  colors: palette,
};
fs.mkdirSync(`${root}app/public/data`, { recursive: true });
fs.writeFileSync(output, JSON.stringify(payload));
console.log(`Wrote ${cleanSets.length.toLocaleString()} calculated set records and ${palette.length} color records to ${output}`);
