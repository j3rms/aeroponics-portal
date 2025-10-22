import { NextResponse } from "next/server";
import { getToken, getUserId } from "../../_api/auth_lib/session";
import { url } from "../../_api/routes";

export async function POST(req) {
  try {
    const token = await getToken();
    const userId = await getUserId();

    if (!token || !userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate required fields (avoid falsy checks so 0 is handled predictably)
    if (
      !body.name ||
      body.min_ph_level == null ||
      body.max_ph_level == null ||
      body.min_ppm == null ||
      body.max_ppm == null
    ) {
      return NextResponse.json(
        { success: false, message: "All plant fields are required" },
        { status: 400 }
      );
    }

    // Prepare payload for backend
    const payload = {
      id: 0, // New plant
      name: body.name,
      min_ph_level: parseFloat(body.min_ph_level),
      max_ph_level: parseFloat(body.max_ph_level),
      min_ppm: parseInt(body.min_ppm),
      max_ppm: parseInt(body.max_ppm)
    };

    // Call backend to create plant
    const response = await fetch(`${url()}/plant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.message || "Failed to create plant" 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Return the created plant data
    return NextResponse.json({ 
      success: true, 
      message: "Plant created successfully",
      data: data 
    });
  } catch (error) {
    console.error("Error creating plant:", error);
    return NextResponse.json(
      { success: false, message: "Server error creating plant" },
      { status: 500 }
    );
  }
}
