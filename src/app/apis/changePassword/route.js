import { NextResponse } from "next/server";
import { getToken, getUserId } from "../../_api/auth_lib/session";
import { url } from "../../_api/routes";

export async function PUT(req) {
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

    // Validate required fields
    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        { success: false, message: "Current and new password are required" },
        { status: 400 }
      );
    }

    // First, get current user data to verify current password
    const getUserResponse = await fetch(`${url()}/user/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!getUserResponse.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to verify user" },
        { status: getUserResponse.status }
      );
    }

    const userData = await getUserResponse.json();
    const currentUser = userData.data;

    // Update user with new password
    const response = await fetch(`${url()}/user/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        first_name: currentUser.first_name,
        last_name: currentUser.last_name,
        email: currentUser.email,
        password: body.newPassword, // New password
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.message || "Failed to change password" 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ 
      success: true, 
      message: "Password changed successfully",
      data: data 
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { success: false, message: "Server error changing password" },
      { status: 500 }
    );
  }
}
