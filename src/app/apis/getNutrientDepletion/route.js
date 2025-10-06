// /app/apis/getNutrientDepletion/route.js

import { NextResponse } from "next/server";
import { getToken } from "../../_api/auth_lib/session";
import { url } from "../../_api/routes";

export async function GET(request) {
  try {
    const token = await getToken();
    const { searchParams } = new URL(request.url);
    const towerId = searchParams.get('towerId');

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication token not found." },
        { status: 401 }
      );
    }

    if (!towerId) {
      return NextResponse.json(
        { success: false, message: "Tower ID is required." },
        { status: 400 }
      );
    }

    const analyticsEndpoint = `${url()}/analytics/nutrient-depletion/tower/${towerId}`;
    
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
    console.error("Error fetching nutrient depletion:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching nutrient depletion analysis" },
      { status: 500 }
    );
  }
}
