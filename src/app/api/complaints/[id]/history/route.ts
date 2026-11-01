import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const complaintId = Number(id);

    // Validate complaint ID
    if (!Number.isSafeInteger(complaintId) || complaintId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid complaint ID." },
        { status: 400 }
      );
    }

    // Find the complaint
    const complaint = await pool.query(
      `SELECT id, title, status
       FROM complaints
       WHERE id = $1`,
      [complaintId]
    );

    if (complaint.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Complaint not found." },
        { status: 404 }
      );
    }

    // Fetch its status history
    const history = await pool.query(
      `SELECT old_status, new_status, changed_at, note
       FROM complaint_status_history
       WHERE complaint_id = $1
       ORDER BY changed_at ASC`,
      [complaintId]
    );

    return NextResponse.json({
      success: true,
      complaint: complaint.rows[0],
      history: history.rows,
    });
  } catch (error) {
    console.error("Status history fetch failed:", error);

    return NextResponse.json(
      { success: false, message: "Could not fetch status history." },
      { status: 500 }
    );
  }
}