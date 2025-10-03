import { NextResponse } from "next/server";
import { getUserId, getToken } from "../../_api/auth_lib/session";
import { url } from "../../_api/routes";

export async function GET() {
  try {
    const userId = await getUserId();
    const token = await getToken();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Fetch full user details from backend
    const response = await fetch(`${url()}/user/${userId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch user details" },
        { status: response.status }
      );
    }

    const userData = await response.json();

    return NextResponse.json({ 
      success: true, 
      data: {
        userId: userData.data.id,
        firstName: userData.data.first_name,
        lastName: userData.data.last_name,
        email: userData.data.email
      }
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    return NextResponse.json(
      { success: false, message: "Error getting user information" },
      { status: 500 }
    );
  }
}
