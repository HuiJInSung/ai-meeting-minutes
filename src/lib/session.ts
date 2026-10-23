import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// 登入狀態存在加密簽章的 cookie（JWT），只放 userId
export const SESSION_COOKIE = "session";
const SESSION_DAYS = 7;

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET);

type SessionPayload = { userId: string };

export async function encrypt(payload: SessionPayload) {
  if (!process.env.SESSION_SECRET) {
    throw new Error("請在 .env.local 設定 SESSION_SECRET");
  }
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(encodedKey);
}

export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    return typeof payload.userId === "string" ? { userId: payload.userId } : null;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const token = await encrypt({ userId });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  return decrypt(cookieStore.get(SESSION_COOKIE)?.value);
}
