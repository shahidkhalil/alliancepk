/**
 * Approve a draft blog: set published=true on blogs/{slug}.
 *
 * Usage:
 *   npx tsx scripts/gsc-approve-blog.ts <slug>
 *   npx tsx scripts/gsc-approve-blog.ts --file scripts/data/generated/my-slug.json
 */
import fs from "fs";
import path from "path";
import {
  argValue,
  loadFirebaseToken,
  patchBlogDoc,
  PROJECT,
} from "./gsc-blog/lib";

async function main() {
  let slug: string | undefined = process.argv[2];
  if (slug?.startsWith("--")) slug = undefined;

  const file = argValue("--file");
  if (file) {
    const posts = JSON.parse(fs.readFileSync(path.resolve(file), "utf8")) as {
      slug: string;
    }[];
    slug = posts[0]?.slug;
  }

  if (!slug) {
    console.error(
      "Usage:\n  npx tsx scripts/gsc-approve-blog.ts <slug>\n  npx tsx scripts/gsc-approve-blog.ts --file path/to/post.json"
    );
    process.exit(1);
  }

  const token = loadFirebaseToken();
  await patchBlogDoc(
    token,
    slug,
    {
      published: true,
      source: "gsc_auto_blog_approved",
      updatedAt: new Date().toISOString(),
    },
    ["published", "source", "updatedAt"]
  );
  console.log(`✓ Published blogs/${slug} on ${PROJECT}`);
  console.log(`  Live at /blog/${slug}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
