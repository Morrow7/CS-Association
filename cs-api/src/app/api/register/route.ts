import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "../../lib/db";

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: "请求体格式错误" },
        { status: 400 }
      );
    }
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const department = typeof body.department === "string" ? body.department.trim() : "";

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, message: "用户名和密码不能为空" },
        { status: 400 }
      );
    }

    if (username.length > 50 || department.length > 50) {
      return NextResponse.json(
        { ok: false, message: "字段长度过长" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        "SELECT id FROM users WHERE username = ?",
        [username]
      );
      const existing = rows as { id: number }[];

      if (existing.length > 0) {
        return NextResponse.json(
          { ok: false, message: "该用户名已被注册" },
          { status: 409 }
        );
      }

      await conn.execute(
        "INSERT INTO users (username, password_hash, department) VALUES (?, ?, ?)",
        [username, hashed, department || "未填写"]
      );
    } finally {
      conn.release();
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { ok: false, message: "注册失败" },
      { status: 500 }
    );
  }
}
