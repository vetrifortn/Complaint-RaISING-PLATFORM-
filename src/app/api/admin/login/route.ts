import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username =
      typeof body.username === "string" ? body.username.trim() : "";
    const password =
      typeof body.password === "string" ? body.password : "";

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      return NextResponse.json(
        { success: false, message: "Admin credentials are not configured." },
        { status: 500 }
      );
    }

    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json(
        { success: false, message: "Incorrect username or password." },
        { status: 401 }
      );
    }

    await createAdminSession();

    return NextResponse.json({
      success: true,
      message: "Admin login successful.",
    });
  } catch (error) {
    console.error("Admin login failed:", error);

    return NextResponse.json(
      { success: false, message: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}