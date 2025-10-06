// /app/api/getNutrientLogs/route.js

import { NextResponse } from "next/server";
import { getToken } from "../../_api/auth_lib/session";
import { url } from "../../_api/routes";

export async function GET() {
  try {
    const token = await getToken();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication token not found." },
        { status: 401 }
      );
    }

    const getEndpoint = `${url()}/nutrient`;

    const response = await fetch(getEndpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch nutrient logs from the backend." },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching nutrient logs:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching nutrient logs" },
      { status: 500 }
    );
  }
}
