# Portfolio

Astro + TypeScript portfolio starter for a computer science master's student. It is configured for static output and deployment to Cloudflare Workers Static Assets.

## Commands

```sh
bun install
bun run dev
bun run build
bun run preview
bun run deploy
```

## Customize

- Edit your profile, links, project cards, and writing list in `src/data/profile.ts`.
- Update the production URL in `astro.config.mjs`.
- Update the Cloudflare Worker name in `wrangler.jsonc`.

## Deploy

Authenticate Wrangler first:

```sh
bunx wrangler login
```

Then deploy:

```sh
bun run deploy
```
