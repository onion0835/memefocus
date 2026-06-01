# MemeFocus

The Curated Hub for AI & Developer Memes.

MemeFocus is a pure static website for AI meme discovery and developer culture topic clusters. It uses HTML, Tailwind CDN, Alpine.js CDN, and small local CSS only.

## Deploy

Cloudflare Pages settings:

- Framework preset: None
- Build command: `exit 0`
- Build output directory: `/`
- Root directory: leave empty

No build step is required.

## Embed Database

Generate a paste-ready Claude / vibe coding embed database from Reddit, Hacker News, and X:

```powershell
node tools/build-embed-database.mjs --limit 24 --days 30
```

If `npm` is available, the same command is also exposed as:

```powershell
npm run generate:embeds -- --limit 24 --days 30
```

Outputs:

- `data/embed-database.js` - loaded by `index.html` before `assets/feed.js`
- `data/embed-database.json` - structured archive for other tools
- `data/embed-database-snippet.html` - inline `<script>` snippet you can paste into another page

Reddit public search can return 403, so the generator supports `REDDIT_BEARER_TOKEN` or `REDDIT_CLIENT_ID` + `REDDIT_CLIENT_SECRET`. X requires `X_BEARER_TOKEN` for recent search.

```powershell
$env:REDDIT_CLIENT_ID="YOUR_CLIENT_ID"
$env:REDDIT_CLIENT_SECRET="YOUR_CLIENT_SECRET"
$env:X_BEARER_TOKEN="YOUR_X_TOKEN"
node tools/build-embed-database.mjs --limit 24 --days 7
```
