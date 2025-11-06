import { NextResponse } from "next/server";
import { tokenUrl } from "../../_api/routes";

export async function POST(request) {
  try {
    const { email, newPassword, confirmPassword, otpCode } = await request.json();

    // Validate required fields
    if (!email || !newPassword || !confirmPassword || !otpCode) {
      return NextResponse.json(
        { 
          success: false, 
          message: "All fields are required" 
        },
        { status: 400 }
      );
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Passwords do not match" 
        },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otpCode)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "OTP must be 6 digits" 
        },
        { status: 400 }
      );
    }

    const verifyChangePasswordOtpEndpoint = `${tokenUrl()}/verify-change-password-otp`;

    // Call backend API to verify OTP and reset password
    const backendResponse = await fetch(verifyChangePasswordOtpEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        newPassword,
        confirmPassword,
        otpCode
      }),
    });

    const result = await backendResponse.json();

    if (backendResponse.ok) {
      return NextResponse.json({
        success: true,
        message: result.message || "Password reset successfully",
        data: result.data
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: result.message || "Failed to reset password. Please check your OTP and try again." 
        },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error("Error in reset password API:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error. Please try again later." 
      },
      { status: 500 }
    );
  }
}
