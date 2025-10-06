// /app/api/updateNutrientLog/route.js

import { NextResponse } from "next/server";
import { getToken } from "../../_api/auth_lib/session";
import { url } from "../../_api/routes";

export async function PUT(req) {
  try {
    const token = await getToken();
    const { id, ...nutrientLogData } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication token not found." },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Nutrient log ID is required." },
        { status: 400 }
      );
    }

    const putEndpoint = `${url()}/nutrient/${id}`;

    const response = await fetch(putEndpoint, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nutrientLogData),
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to update nutrient log." },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error updating nutrient log:", error);
    return NextResponse.json(
      { success: false, message: "Error updating nutrient log" },
      { status: 500 }
    );
  }
}
