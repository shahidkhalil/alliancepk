/**
 * Rank GSC query opportunities for US location + service blog topics.
 *
 * Usage:
 *   npx tsx scripts/gsc-blog-opportunities.ts
 *   npx tsx scripts/gsc-blog-opportunities.ts --days 90 --limit 20 --json
 */
import fs from "fs";
import path from "path";
import {
  argFlag,
  argValue,
  fetchGscQueries,
  GSC_SITE,
  listExistingBlogs,
  loadServiceMap,
  scoreOpportunities,
} from "./gsc-blog/lib";

async function main() {
  const days = Number(argValue("--days") || 28);
  const limit = Number(argValue("--limit") || 15);
  const asJson = argFlag("--json");
  const outFile = argValue("--out");

  console.error(`Fetching GSC queries for ${GSC_SITE} (last ${days} days)…`);
  const [rows, existing, map] = await Promise.all([
    fetchGscQueries({ days, rowLimit: 1000 }),
    listExistingBlogs(),
    Promise.resolve(loadServiceMap()),
  ]);
  console.error(`Got ${rows.length} queries; ${existing.length} existing blogs`);

  const opportunities = scoreOpportunities(rows, map, existing).slice(0, limit);

  if (asJson || outFile) {
    const payload = {
      site: GSC_SITE,
      days,
      generatedAt: new Date().toISOString(),
      count: opportunities.length,
      opportunities,
    };
    const text = JSON.stringify(payload, null, 2);
    if (outFile) {
      const abs = path.resolve(outFile);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, text);
      console.error(`Wrote ${abs}`);
    }
    if (asJson) console.log(text);
    else if (!outFile) console.log(text);
  } else {
    if (!opportunities.length) {
      console.log("No geo+service opportunities found.");
      return;
    }
    console.log("\nRanked opportunities:\n");
    for (const [i, o] of opportunities.entries()) {
      console.log(
        `${i + 1}. [${o.score}] "${o.query}" → ${o.service.id} @ ${o.location.city}, ${o.location.state}`
      );
      console.log(
        `   clicks=${o.clicks} impr=${o.impressions} ctr=${(o.ctr * 100).toFixed(1)}% pos=${o.position.toFixed(1)}`
      );
      console.log(`   ${o.reason}`);
      console.log(`   CTA: ${o.service.serviceLink.href}\n`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
