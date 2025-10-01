// /app/apis/getHarvestPredictions/route.js

import { NextResponse } from "next/server";
import { getToken, getUserId } from "../../_api/auth_lib/session";
import { url } from "../../_api/routes";

export async function GET() {
  try {
    const token = await getToken();
    const userId = await getUserId();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication token not found." },
        { status: 401 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID not found in session." },
        { status: 401 }
      );
    }

    const analyticsEndpoint = `${url()}/analytics/harvest-prediction/user/${userId}`;
    
    const response = await fetch(analyticsEndpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", errorText);
      return NextResponse.json(
        { success: false, message: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching harvest predictions:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching harvest predictions" },
      { status: 500 }
    );
  }
}
