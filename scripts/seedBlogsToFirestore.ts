/**
 * Seed / sync blog posts from src/lib/blogData.ts → Firestore `blogs/{slug}`.
 *
 * Requires Firebase CLI login (uses access token from firebase-tools config).
 *
 * Usage:
 *   npx tsx scripts/seedBlogsToFirestore.ts
 */
import fs from "fs";
import path from "path";
import https from "https";
import { blogPosts } from "../src/lib/blogData";

const PROJECT = process.env.FIREBASE_PROJECT || "alliancepak";

function loadAccessToken(): string {
  const configPath = path.join(
    process.env.HOME || "",
    ".config/configstore/firebase-tools.json"
  );
  const tools = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const token = tools?.tokens?.access_token;
  if (!token) throw new Error("No Firebase CLI access token — run: firebase login");
  return token;
}

function toFirestoreValue(v: unknown): Record<string, unknown> {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") {
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  }
  if (Array.isArray(v)) {
    return { arrayValue: { values: v.map(toFirestoreValue) } };
  }
  if (typeof v === "object") {
    const fields: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (val === undefined) continue;
      fields[k] = toFirestoreValue(val);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(v) };
}

function patchDoc(token: string, slug: string, data: Record<string, unknown>) {
  return new Promise<void>((resolve, reject) => {
    const body = JSON.stringify({ fields: (toFirestoreValue(data) as { mapValue: { fields: unknown } }).mapValue.fields });
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/blogs/${encodeURIComponent(slug)}`;
    const req = https.request(
      url,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) resolve();
          else reject(new Error(`${slug}: ${res.statusCode} ${raw.slice(0, 300)}`));
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const token = loadAccessToken();
  console.log(`Seeding ${blogPosts.length} posts → ${PROJECT}/blogs`);
  for (const post of blogPosts) {
    const payload = {
      ...post,
      sections: post.sections || [],
      content: post.content || [],
      keywords: post.keywords || [],
      published: true,
      source: "blogData_sync",
      updatedAt: new Date().toISOString(),
    };
    await patchDoc(token, post.slug, payload);
    console.log("✓", post.slug);
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
