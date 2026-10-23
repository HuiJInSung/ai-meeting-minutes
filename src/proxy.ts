import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, decrypt } from "@/lib/session";

// 只做「有沒有合法 cookie」的快速檢查，真正的權限檢查在頁面與 API 裡
const publicPages = ["/"]; // landing page 誰都能看
const authPages = ["/login", "/signup"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const session = await decrypt(req.cookies.get(SESSION_COOKIE)?.value);
  const isAuthPage = authPages.includes(path);

  if (publicPages.includes(path)) return NextResponse.next();

  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/app", req.nextUrl));
  }
  return NextResponse.next();
}

// API 自己回 401，不經過 proxy（也避免 proxy 限制上傳大小）
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico)$).*)"],
};
