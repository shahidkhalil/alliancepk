# GSC → Auto Blog

Manual pipeline: Search Console opportunities → SEO blog draft → approve live.

## Setup

```bash
# Same SA as analytics / search-console MCP
export GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/analytics-mcp-alliancepak.json
export OPENAI_API_KEY=sk-...   # required for generation
firebase login                 # required for Firestore draft/approve
```

Edit keyword → CTA mapping: [`service-map.json`](./service-map.json)

## Commands

```bash
# 1) Rank opportunities (dry-run)
npx tsx scripts/gsc-blog-opportunities.ts
npx tsx scripts/gsc-blog-opportunities.ts --json --out scripts/data/generated/opportunities.json

# 2) Generate SEO draft (JSON + optional Firestore draft)
npx tsx scripts/gsc-generate-blog.ts --auto
npx tsx scripts/gsc-generate-blog.ts --auto --publish-draft
npx tsx scripts/gsc-generate-blog.ts --from scripts/data/generated/opportunities.json --index 0 --publish-draft

# 3) Approve (publish live)
npx tsx scripts/gsc-approve-blog.ts <slug>
npx tsx scripts/gsc-approve-blog.ts --file scripts/data/generated/<slug>.json
```

Drafts use `published: false`. After approve, the post is live at `/blog/{slug}`.
