import { NextResponse } from "next/server";
import { tokenUrl } from "../../_api/routes";

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Email is required" 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid email format" 
        },
        { status: 400 }
      );
    }

    const sendOtpEndpoint = `${tokenUrl()}/send-otp`;

    // Call backend API to send OTP
    const backendResponse = await fetch(sendOtpEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await backendResponse.json();

    if (backendResponse.ok) {
      return NextResponse.json({
        success: true,
        message: result.message || "OTP sent successfully to your email",
        data: result.data
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: result.message || "Failed to send OTP. Please try again." 
        },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error("Error in send OTP API:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error. Please try again later." 
      },
      { status: 500 }
    );
  }
}
