import { NextResponse } from 'next/server';
import pool from '../lib/db';

export async function GET() {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        return NextResponse.json({ ok: true, rows });
    } catch (error) {
        console.error('DB error:', error);
        return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
    }
}