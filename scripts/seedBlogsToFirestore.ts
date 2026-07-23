/**
 * Upsert blog posts into Firestore `blogs/{slug}` from a JSON file.
 *
 * Content source of truth is Firestore. Use this only for bulk import/update.
 *
 * Usage:
 *   npx tsx scripts/seedBlogsToFirestore.ts path/to/posts.json
 *
 * JSON format: BlogPost[] (same fields as Firestore docs).
 */
import fs from "fs";
import path from "path";
import https from "https";

const PROJECT = process.env.FIREBASE_PROJECT || "alliancepak";

type SeedPost = {
  slug: string;
  title: string;
  [key: string]: unknown;
};

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
    const body = JSON.stringify({
      fields: (toFirestoreValue(data) as { mapValue: { fields: unknown } }).mapValue.fields,
    });
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
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error(
      "Usage: npx tsx scripts/seedBlogsToFirestore.ts <posts.json>\n" +
        "Blogs are stored in Firestore — pass a JSON array of posts to upsert."
    );
    process.exit(1);
  }

  const abs = path.resolve(fileArg);
  const posts = JSON.parse(fs.readFileSync(abs, "utf8")) as SeedPost[];
  if (!Array.isArray(posts) || !posts.length) {
    throw new Error("JSON must be a non-empty array of posts with slug + title");
  }

  const token = loadAccessToken();
  console.log(`Upserting ${posts.length} posts → ${PROJECT}/blogs`);
  for (const post of posts) {
    if (!post.slug || !post.title) {
      console.warn("skip (missing slug/title)", post);
      continue;
    }
    const payload = {
      ...post,
      sections: post.sections || [],
      content: post.content || [],
      keywords: post.keywords || [],
      published: post.published !== false,
      source: "json_upsert",
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
