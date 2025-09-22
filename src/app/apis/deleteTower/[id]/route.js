import { NextResponse } from "next/server";
import { getToken } from "../../../_api/auth_lib/session";
import { url } from "../../../_api/routes";

export async function DELETE(req, { params }) {
  try {
    const token = await getToken();
    const { id } = await params;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const response = await fetch(`${url()}/tower/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { success: false, message: err || "Failed to delete tower" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tower:", error);
    return NextResponse.json(
      { success: false, message: "Server error deleting tower" },
      { status: 500 }
    );
  }
}
