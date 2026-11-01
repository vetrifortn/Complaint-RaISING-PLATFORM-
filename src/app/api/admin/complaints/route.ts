import { NextResponse } from "next/server";
import pool from "@/lib/db";

// FETCH ALL COMPLAINTS FOR ADMIN DASHBOARD
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT
        id,
        title,
        category,
        description,
        location,
        latitude,
        longitude,
        status,
        created_at
       FROM complaints
       ORDER BY created_at DESC`
    );

    return NextResponse.json({
      success: true,
      complaints: result.rows,
    });
  } catch (error) {
    console.error("Admin complaints fetch failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not load complaints.",
      },
      { status: 500 }
    );
  }
}