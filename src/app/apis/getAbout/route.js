import { NextResponse } from "next/server";
import { getToken } from "../../_api/auth_lib/session";
import { url } from "../../_api/routes";

export async function GET() {
  try {
    let token = await getToken();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const getEndpoint = `${url()}/about`;

    const response = await fetch(getEndpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch about data from the backend." },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({ 
      success: true, 
      data: data
    });
  } catch (error) {
    console.error("Error fetching about data:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching about data" },
      { status: 500 }
    );
  }
}
