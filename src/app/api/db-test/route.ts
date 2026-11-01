
import { connection, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  await connection();

  try {
    const result = await pool.query("SELECT NOW() AS database_time");

    return NextResponse.json({
      success: true,
      message: "Connected to PostgreSQL successfully!",
      databaseTime: result.rows[0].database_time,
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed.",
        error:
          error instanceof Error
            ? error.message
            : "Unknown database error",
      },
      { status: 500 }
    );
  }
}
