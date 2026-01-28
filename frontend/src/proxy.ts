import { NextRequest, NextResponse } from "next/server";

export default function proxy(req: NextRequest) {
  const sessionId = req.cookies.get("sid")?.value;

  const res = NextResponse.next();

  if (sessionId) {
    res.headers.set("x-user", "authenticated");
  }

  return res;
}
