import { NextResponse } from "next/server";
import { getToken } from "../../../_api/auth_lib/session";
import { url } from "../../../_api/routes";

export async function PUT(request, { params }) {
  try {
    const token = await getToken();
    const { id } = params;
    const body = await request.json();

    const updateEndpoint = `${url()}/tower/${id}`;

    const response = await fetch(updateEndpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to update tower." },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error updating tower:", error);
    return NextResponse.json(
      { success: false, message: "Error updating tower" },
      { status: 500 }
    );
  }
}
