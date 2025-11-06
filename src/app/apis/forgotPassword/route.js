import { NextResponse } from "next/server";
import {tokenUrl} from "../../_api/routes";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const oauthRequest = `${tokenUrl()}/change-password-otp`;

    const oauthResponse = await fetch(oauthRequest, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await oauthResponse.json();

    if (oauthResponse.ok) {
      return NextResponse.json({
        success: true,
        message: result.message || "OTP sent successfully to your email",
        data: result.data
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: result.message || "Failed to send OTP. Please check your email and try again." 
        },
        { status: oauthResponse.status }
      );
    }
  } catch (error) {
    console.error("Error in forgot password API:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error. Please try again later." 
      },
      { status: 500 }
    );
  }
}
