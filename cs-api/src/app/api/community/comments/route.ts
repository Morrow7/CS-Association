import { NextResponse } from "next/server";
import pool from "../../../lib/db";

type CommentRow = {
  id: number;
  post_id: number;
  author: string;
  content: string;
  created_at: string;
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const postId = parseInt(url.searchParams.get("postId") || "");
    if (!postId || Number.isNaN(postId)) {
      return NextResponse.json(
        { ok: false, message: "postId 参数不合法" },
        { status: 400 }
      );
    }

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        "SELECT id, post_id, author, content, created_at FROM community_comments WHERE post_id = ? ORDER BY created_at DESC",
        [postId]
      );
      const comments = rows as CommentRow[];
      return NextResponse.json({ ok: true, comments }, { status: 200 });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Community comments GET error:", error);
    return NextResponse.json(
      { ok: false, message: "获取评论失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const postId = Number(body.postId);
    const author =
      typeof body.author === "string" ? body.author.trim() : "";
    const content =
      typeof body.content === "string" ? body.content.trim() : "";

    if (!postId || Number.isNaN(postId) || !author || !content) {
      return NextResponse.json(
        { ok: false, message: "参数不合法" },
        { status: 400 }
      );
    }
    if (author.length > 50) {
      return NextResponse.json(
        { ok: false, message: "作者名称过长" },
        { status: 400 }
      );
    }

    const conn = await pool.getConnection();
    try {
      await conn.execute(
        "INSERT INTO community_comments (post_id, author, content) VALUES (?, ?, ?)",
        [postId, author, content]
      );
      return NextResponse.json({ ok: true }, { status: 201 });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("Community comments POST error:", error);
    return NextResponse.json(
      { ok: false, message: "提交评论失败" },
      { status: 500 }
    );
  }
}

