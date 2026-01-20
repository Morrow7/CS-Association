import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import pool from "../../../lib/db";

const redirectAfterLogin =
  process.env.GITHUB_LOGIN_REDIRECT || "http://localhost:3000/home";
const redirectUri =
  process.env.GITHUB_REDIRECT_URI || "http://localhost:3001/api/github";

export async function GET(request: Request) {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { ok: false, message: "GitHub 配置缺失" },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    const cookieStore = await cookies();
    const savedState = cookieStore.get("gh_oauth_state")?.value;

    if (!code || !state || !savedState || state !== savedState) {
      return NextResponse.json(
        { ok: false, message: "state 校验失败" },
        { status: 400 }
      );
    }

    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token as string | undefined;

    if (!accessToken) {
      console.error("GitHub token response:", tokenJson);
      return NextResponse.json(
        { ok: false, message: "获取 access_token 失败" },
        { status: 500 }
      );
    }

    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "cs-association-app",
      },
    });
    const ghUser = await userRes.json();

    const ghLogin = ghUser.login as string;
    if (!ghLogin) {
      return NextResponse.json(
        { ok: false, message: "获取 GitHub 用户信息失败" },
        { status: 500 }
      );
    }

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        "SELECT id FROM users WHERE username = ?",
        [ghLogin]
      );
      const users = rows as { id: number }[];

      if (users.length === 0) {
        const randomHash = await bcrypt.hash(crypto.randomUUID(), 10);
        await conn.execute(
          "INSERT INTO users (username, password_hash, department) VALUES (?, ?, ?)",
          [ghLogin, randomHash, "GitHub"]
        );
      }
    } finally {
      conn.release();
    }

    return NextResponse.redirect(redirectAfterLogin);
  } catch (error) {
    console.error("GitHub callback error:", error);
    return NextResponse.json(
      { ok: false, message: "GitHub 登录失败" },
      { status: 500 }
    );
  }
}
