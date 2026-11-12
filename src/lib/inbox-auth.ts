
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "forma_inbox_session";
const SESSION_SECONDS = 60 * 60 * 8;

function sign(value: string): string {
  const secret = process.env.INBOX_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("INBOX_SESSION_SECRET is missing or too short");
  }

  return createHmac("sha256", secret)
    .update(value)
    .digest("hex");
}

export function checkPin(pin: string): boolean {
  const expected = process.env.INBOX_PIN;

  if (!expected || !/^\d{6,}$/.test(expected)) {
    throw new Error("Valid INBOX_PIN is not configured");
  }

  const a = Buffer.from(pin);
  const b = Buffer.from(expected);

  return a.length === b.length && timingSafeEqual(a, b);
}

export function makeSession(): string {
  const expires = String(
    Math.floor(Date.now() / 1000) + SESSION_SECONDS
  );

  return `${expires}.${sign(expires)}`;
}

export async function isInboxAuthorized(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;

  if (!token) return false;

  const [expires, signature, extra] = token.split(".");

  if (
    extra !== undefined ||
    !expires ||
    !signature ||
    !/^\d+$/.test(expires)
  ) {
    return false;
  }

  if (Number(expires) <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expected = sign(expires);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);

  return a.length === b.length && timingSafeEqual(a, b);
}

export async function setInboxSession() {
  const store = await cookies();

  store.set(COOKIE_NAME, makeSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function clearInboxSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
