import { NextResponse } from "next/server";
import { getToken } from "../../_api/auth_lib/session";
import { url } from "../../_api/routes";

export async function POST(request) {
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

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    const backendForm = new FormData();
    backendForm.append("file", file);

    const backendRes = await fetch(`${url()}/user/profile-picture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: backendForm,
    });

    const data = await backendRes.json().catch(() => null);
    if (!backendRes.ok) {
      return NextResponse.json(
        { success: false, message: data?.message || "Failed to upload profile picture" },
        { status: backendRes.status }
      );
    }

    return NextResponse.json({ success: true, ...(data || {}) }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Error uploading profile picture" },
      { status: 500 }
    );
  }
}
