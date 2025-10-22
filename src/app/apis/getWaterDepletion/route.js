// /app/apis/getWaterDepletion/route.js

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

    const analyticsEndpoint = `${url()}/analytics/water-depletion/tower/${towerId}`;
    
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
      console.error("Backend water depletion error:", errorText);
      return NextResponse.json(
        { success: false, message: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Normalize water level values from 1-10 scale to percentage for display
    // Backend stores 1-10, but we need to convert for accurate analytics display
    if (data.data?.currentWaterLevel) {
      const rawLevel = parseInt(data.data.currentWaterLevel);
      if (rawLevel >= 1 && rawLevel <= 10) {
        // Convert 1-10 scale to percentage: 1=100%, 2=90%, ..., 10=10%
        const normalizedPercentage = (11 - rawLevel) * 10;
        data.data.currentWaterPercentage = normalizedPercentage;
        
        console.log(`Water depletion - Raw level: ${rawLevel}, Normalized: ${normalizedPercentage}%`);
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching water depletion:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching water depletion analysis" },
      { status: 500 }
    );
  }
}
