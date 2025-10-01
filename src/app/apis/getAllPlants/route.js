// /app/api/getAllPlants/route.js

import { NextResponse } from "next/server";
import { getToken, getUserId } from "../../_api/auth_lib/session";
import { url } from "../../_api/routes";

export async function GET() {
  try {
    let token = await getToken();
    let userId = await getUserId();

    if (!token || !userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const getEndpoint = `${url()}/plant`;

    const response = await fetch(getEndpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch plants from the backend." },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Filter plants to show:
    // 1. System plants (user_id = 1 or a specific system user ID)
    // 2. Current user's custom plants (user_id = current user)
    let filteredPlants = [];
    if (data.status && Array.isArray(data.data)) {
      filteredPlants = data.data.filter(plant => {
        // If plant has no user property, treat it as a system plant (show to everyone)
        if (!plant.user) {
          return true;
        }
        // Show system plants (assuming user ID 1 is the system/admin)
        // OR show plants created by the current user
        return plant.user.id === 1 || plant.user.id === userId;
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        ...data,
        data: filteredPlants
      }
    });
  } catch (error) {
    console.error("Error fetching plants:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching plants" },
      { status: 500 }
    );
  }
}
