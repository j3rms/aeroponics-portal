import { NextResponse } from "next/server";
import { getToken } from "../../_api/auth_lib/session";
import { url } from "../../_api/routes";

export async function GET(request) {
  try {
    let token = await getToken();
    if (!token) {
      const auth = request.headers.get("authorization");
      if (auth && auth.startsWith("Bearer ")) {
        token = auth.substring("Bearer ".length);
      }
    }
    if (!token) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const backendRes = await fetch(`${url()}/user/profile-picture`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (backendRes.status === 404) {
      return NextResponse.json(
        { success: false, message: "Profile picture not set" },
        { status: 404 }
      );
    }

    if (!backendRes.ok) {
      const text = await backendRes.text();
      return NextResponse.json(
        { success: false, message: text || "Failed to fetch profile picture" },
        { status: backendRes.status }
      );
    }

    const contentType = backendRes.headers.get("content-type") || "application/octet-stream";
    const arrayBuffer = await backendRes.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error fetching profile picture" },
      { status: 500 }
    );
  }
}
