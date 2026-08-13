/**
 * Upsert a blog JSON file as a Firestore draft (published: false).
 * Usage: npx tsx scripts/upsert-blog-draft.ts scripts/data/generated/<slug>.json
 */
import fs from "fs";
import path from "path";
import { loadFirebaseToken, patchBlogDoc } from "./gsc-blog/lib";

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error("Pass path to blog JSON");
  const raw = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
  const post = Array.isArray(raw) ? raw[0] : raw;
  if (!post?.slug || !post?.title) throw new Error("Invalid blog JSON");
  const token = loadFirebaseToken();
  const payload = {
    ...post,
    published: false,
    source: post.source || "gsc_auto_blog",
    updatedAt: new Date().toISOString(),
  };
  await patchBlogDoc(token, post.slug, payload);
  console.log(`Draft upserted: blogs/${post.slug}`);
  console.log(JSON.stringify({ slug: post.slug, title: post.title, published: false }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
