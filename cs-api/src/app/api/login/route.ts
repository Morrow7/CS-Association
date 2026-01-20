import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "../../lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, message: "用户名和密码不能为空" },
        { status: 400 }
      );
    }

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        "SELECT id, username, password_hash, department FROM users WHERE username = ?",
        [username]
      );

      const users = rows as {
        id: number;
        username: string;
        password_hash: string;
        department: string | null;
      }[];
      if (users.length === 0) {
        return NextResponse.json(
          { ok: false, message: "用户不存在" },
          { status: 401 }
        );
      }

      const user = users[0] as {
        id: number;
        username: string;
        password_hash: string;
        department: string | null;
      };

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return NextResponse.json(
          { ok: false, message: "密码错误" },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          ok: true,
          user: {
            id: user.id,
            username: user.username,
            department: user.department,
          },
        },
        { status: 200 }
      );
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { ok: false, message: "登录失败" },
      { status: 500 }
    );
  }
}
