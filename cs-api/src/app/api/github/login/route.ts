import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri =
    process.env.GITHUB_REDIRECT_URI || "http://localhost:3001/api/github";

  if (!clientId) {
    return NextResponse.json(
      { ok: false, message: "GitHub 配置缺失" },
      { status: 500 }
    );
  }

  const state = crypto.randomUUID();

  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", "read:user user:email");
  authorizeUrl.searchParams.set("state", state);

  const res = NextResponse.redirect(authorizeUrl.toString());
  res.cookies.set("gh_oauth_state", state, {
    httpOnly: true,
    path: "/",
    maxAge: 600,
  });

  return res;
}

