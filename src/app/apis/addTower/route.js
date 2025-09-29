import { NextResponse } from "next/server";
import { getToken } from "../../_api/auth_lib/session";
import { url } from "../../_api/routes";

export async function POST(req) {
  try {
    const token = await getToken();
    const body = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const response = await fetch(`${url()}/tower`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { success: false, message: err || "Failed to add tower" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    console.error("Error adding tower:", error);
    return NextResponse.json(
      { success: false, message: "Server error adding tower" },
      { status: 500 }
    );
  }
}