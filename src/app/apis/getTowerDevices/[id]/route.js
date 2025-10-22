import { NextResponse } from "next/server";
import { getToken } from "../../../_api/auth_lib/session";
import { url } from "../../../_api/routes";

export async function GET(req, { params }) {
  try {
    const token = await getToken();
    const { id } = await params;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const response = await fetch(`${url()}/tower/${id}/device`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let message = "Failed to fetch tower devices";
      try {
        const errJson = await response.json();
        message = errJson.message || message;
      } catch (e) {
        try {
          message = await response.text() || message;
        } catch (_) {}
      }
      return NextResponse.json(
        { success: false, message },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching tower devices:", error);
    return NextResponse.json(
      { success: false, message: "Server error fetching tower devices" },
      { status: 500 }
    );
  }
}
