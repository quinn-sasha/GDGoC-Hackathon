import { NextRequest, NextResponse } from "next/server";

const OLD_HOST = "frontend-301231638824.asia-northeast1.run.app";
const NEW_HOST = "frontend-opwia3uwya-an.a.run.app";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (host === OLD_HOST) {
    const url = request.nextUrl.clone();
    url.host = NEW_HOST;
    url.protocol = "https:";
    url.port = "";
    return NextResponse.redirect(url, { status: 301 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/(.*)",
};
