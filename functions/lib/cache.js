/**
 * Tiny Firestore-backed cache with TTL, used to avoid re-spending
 * API credits (Serper, OpenAI, PageSpeed) on repeated work.
 */

const crypto = require("crypto");

let db = null;
function initCache(firestore) {
  db = firestore;
}

function keyToId(key) {
  return crypto.createHash("sha1").update(key).digest("hex");
}

async function getCache(key) {
  if (!db) return null;
  try {
    const snap = await db.collection("cache").doc(keyToId(key)).get();
    if (!snap.exists) return null;
    const { value, expiresAt } = snap.data();
    if (expiresAt && expiresAt.toMillis() < Date.now()) return null;
    return value;
  } catch {
    return null;
  }
}

async function setCache(key, value, ttlDays) {
  if (!db) return;
  try {
    await db.collection("cache").doc(keyToId(key)).set({
      key,
      value,
      expiresAt: new Date(Date.now() + ttlDays * 86400000),
      createdAt: new Date(),
    });
  } catch (e) {
    console.warn("cache set failed:", e.message);
  }
}

/**
 * Per-IP daily counter, namespaced per feature so chatting doesn't
 * consume the voice/audit quota. Returns true if within `limit`.
 * Fail-open: if we can't measure (no DB / bad IP / tx error), allow the request
 * so Maya doesn't look dead for US demo visitors.
 */
async function checkRateLimit(ip, limit, scope = "global") {
  if (!db) {
    console.warn("rate limit skipped: cache backend not ready", scope);
    return true;
  }
  const keyIp =
    ip && typeof ip === "string" && ip.length >= 3 && ip.length <= 64
      ? ip
      : "unknown";
  const day = new Date().toISOString().slice(0, 10);
  const ref = db.collection("cache").doc(keyToId(`rate:${scope}:${keyIp}:${day}`));
  // Unknown IP shares a tighter bucket so fail-open isn't a free unlimited path.
  const effectiveLimit = keyIp === "unknown" ? Math.min(limit, 30) : limit;
  try {
    const n = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const count = (snap.exists ? snap.data().count : 0) + 1;
      tx.set(ref, { count, expiresAt: new Date(Date.now() + 2 * 86400000) });
      return count;
    });
    return n <= effectiveLimit;
  } catch (e) {
    console.warn("rate limit check failed (allowing):", e.message);
    return true;
  }
}

module.exports = { initCache, getCache, setCache, checkRateLimit };
