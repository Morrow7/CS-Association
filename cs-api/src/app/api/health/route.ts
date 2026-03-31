import { NextResponse } from "next/server";
import pool from "../../lib/db";

export async function GET() {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT 1 as test, NOW() as time');
        connection.release();
        
        return NextResponse.json({
            status: "ok",
            message: "数据库连接正常",
            timestamp: new Date().toISOString(),
            dbTime: (rows as any[])[0]?.time,
        }, { status: 200 });
    } catch (error: any) {
        console.error("Health check failed:", error);
        return NextResponse.json({
            status: "error",
            message: "数据库连接失败",
            error: error.message,
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
