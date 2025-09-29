// /app/api/getAllUsers/route.js

import { NextResponse } from "next/server";
import { getToken} from "../../_api/auth_lib/session";
import { url } from "../../_api/routes";

export async function GET() {
  try {
    let token = await getToken();
    const getEndpoint = `${url()}/user/profile `;

    const response = await fetch(getEndpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch users from the backend." },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching users" },
      { status: 500 }
    );
  }
}
