// /app/api/addNutrientLog/route.js

import { NextResponse } from "next/server";
import { getToken } from "../../_api/auth_lib/session";
import { url } from "../../_api/routes";

export async function POST(req) {
  try {
    const token = await getToken();
    const nutrientLogData = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication token not found." },
        { status: 401 }
      );
    }

    const postEndpoint = `${url()}/nutrient`;

    const response = await fetch(postEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nutrientLogData),
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to create nutrient log." },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error creating nutrient log:", error);
    return NextResponse.json(
      { success: false, message: "Error creating nutrient log" },
      { status: 500 }
    );
  }
}
