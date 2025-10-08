// /app/api/deleteNutrientLog/route.js

import { NextResponse } from "next/server";
import { getToken } from "../../_api/auth_lib/session";
import { url } from "../../_api/routes";

export async function DELETE(req) {
  try {
    const token = await getToken();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

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

    const deleteEndpoint = `${url()}/nutrient/${id}`;

    const response = await fetch(deleteEndpoint, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to delete nutrient log." },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error deleting nutrient log:", error);
    return NextResponse.json(
      { success: false, message: "Error deleting nutrient log" },
      { status: 500 }
    );
  }
}
