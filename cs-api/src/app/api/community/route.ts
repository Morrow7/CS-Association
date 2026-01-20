import { NextResponse } from "next/server";
import pool from "../../lib/db";

type CommunityItem = {
  id: number;
  title: string;
  description: string;
  link: string | null;
  created_at: string;
};

export async function GET() {
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        "SELECT id, title, description, link, created_at FROM community_posts ORDER BY created_at DESC"
      );
      const items = rows as CommunityItem[];
      return NextResponse.json({ ok: true, items }, { status: 200 });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Community API error:", error);
    return NextResponse.json(
      { ok: false, message: "获取学习交流中心内容失败" },
      { status: 500 }
    );
  }
}

