import { NextResponse } from "next/server";
import pool from "../../lib/db";

type AcademicRow = {
  id: number;
  title: string;
  description: string;
  link: string;
};

export async function GET() {
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        "SELECT id, title, description, link FROM academic_resources ORDER BY id DESC"
      );
      const items = rows as AcademicRow[];
      return NextResponse.json({ ok: true, items }, { status: 200 });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Academic GET error:", error);
    return NextResponse.json(
      { ok: false, message: "获取学术资源失败" },
      { status: 500 }
    );
  }
}

