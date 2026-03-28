import { createHmac } from "crypto";

const SECRET = () => process.env.ADMIN_PASSWORD || "fallback";
const TOKEN_TTL = 24 * 60 * 60 * 1000; // 24h

export function createToken(): string {
  const ts = Date.now().toString();
  const sig = createHmac("sha256", SECRET()).update(ts).digest("hex");
  return Buffer.from(`${ts}.${sig}`).toString("base64url");
}

export function verifyToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const [ts, sig] = decoded.split(".");
    if (!ts || !sig) return false;

    const age = Date.now() - Number(ts);
    if (age > TOKEN_TTL || age < 0) return false;

    const expected = createHmac("sha256", SECRET()).update(ts).digest("hex");
    return sig === expected;
  } catch {
    return false;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}
