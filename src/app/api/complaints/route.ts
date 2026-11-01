import { verifyAdminSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import pool from "@/lib/db";

// SUBMIT A NEW COMPLAINT
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : "";
    const category =
      typeof body.category === "string" ? body.category.trim() : "";
    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";
    const location =
      typeof body.location === "string" ? body.location.trim() : "";

    const latitude =
      body.latitude == null ? null : Number(body.latitude);
    const longitude =
      body.longitude == null ? null : Number(body.longitude);

    if (!title || !category || !description || !location) {
      return NextResponse.json(
        { success: false, message: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    if (
      title.length > 200 ||
      category.length > 100 ||
      description.length > 10000 ||
      location.length > 1000
    ) {
      return NextResponse.json(
        { success: false, message: "One or more fields are too long." },
        { status: 400 }
      );
    }

    if (
      (latitude !== null &&
        (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) ||
      (longitude !== null &&
        (!Number.isFinite(longitude) || longitude < -180 || longitude > 180))
    ) {
      return NextResponse.json(
        { success: false, message: "The selected map coordinates are invalid." },
        { status: 400 }
      );
    }

    if ((latitude === null) !== (longitude === null)) {
      return NextResponse.json(
        { success: false, message: "Please select a complete map location." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO complaints
        (title, category, description, location, latitude, longitude, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, title, category, description, location,
                 latitude, longitude, status, created_at`,
      [
        title,
        category,
        description,
        location,
        latitude,
        longitude,
        "pending",
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Complaint saved successfully.",
        complaint: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Complaint submission failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not save the complaint.",
      },
      { status: 500 }
    );
  }
}

// FETCH COMPLAINTS
export async function GET() {
  const isAuthenticated = await verifyAdminSession();

if (!isAuthenticated) {
  return Response.json(
    { success: false, message: "Unauthorized" },
    { status: 401 }
  );
}
  try {
    const result = await pool.query(
      `SELECT id, title, category, description, location,
              latitude, longitude, status, created_at
       FROM complaints
       WHERE latitude IS NOT NULL
         AND longitude IS NOT NULL
       ORDER BY created_at DESC`
    );

    return NextResponse.json({
      success: true,
      complaints: result.rows,
    });
  } catch (error) {
    console.error("Fetching complaints failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not fetch complaints.",
      },
      { status: 500 }
    );
  }
}

// UPDATE COMPLAINT STATUS
export async function PUT(request: Request) {
  const isAuthenticated = await verifyAdminSession();

if (!isAuthenticated) {
  return Response.json(
    { success: false, message: "Unauthorized" },
    { status: 401 }
  );
}
  const client = await pool.connect();

  try {
    const body = await request.json();

    const complaintId = Number(body.id);
    const newStatus =
      typeof body.status === "string" ? body.status.trim() : "";
    const note =
      typeof body.note === "string" ? body.note.trim() : "";

    const allowedStatuses = [
      "pending",
      "in_progress",
      "resolved",
    ];

    if (
      !Number.isSafeInteger(complaintId) ||
      complaintId <= 0 ||
      !allowedStatuses.includes(newStatus)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid complaint ID or status." },
        { status: 400 }
      );
    }

    if (note.length > 2000) {
      return NextResponse.json(
        { success: false, message: "The status note is too long." },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT status
       FROM complaints
       WHERE id = $1
       FOR UPDATE`,
      [complaintId]
    );

    if (existing.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        { success: false, message: "Complaint not found." },
        { status: 404 }
      );
    }

    const oldStatus = existing.rows[0].status;

    if (oldStatus === newStatus) {
      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        message: "Complaint already has this status.",
        status: newStatus,
      });
    }

    await client.query(
      `UPDATE complaints
       SET status = $1
       WHERE id = $2`,
      [newStatus, complaintId]
    );

    await client.query(
      `INSERT INTO complaint_status_history
        (complaint_id, old_status, new_status, note)
       VALUES ($1, $2, $3, $4)`,
      [complaintId, oldStatus, newStatus, note || null]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Complaint status updated successfully.",
      oldStatus,
      newStatus,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Status update failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not update complaint status.",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}