import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { firstName, lastName, email, password, confirmPassword, otpCode } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !confirmPassword || !otpCode) {
      return NextResponse.json(
        { 
          success: false, 
          message: "All fields are required" 
        },
        { status: 400 }
      );
    }

    // Validate password match
    if (password !== confirmPassword) {
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

    // Call backend API to verify OTP and register user
    const backendResponse = await fetch("http://localhost:8080/oauth/verify-otp-register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        otpCode
      }),
    });

    const result = await backendResponse.json();

    if (backendResponse.ok) {
      return NextResponse.json({
        success: true,
        message: result.message || "Account created successfully",
        data: result
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: result.message || "Failed to verify OTP or create account. Please try again." 
        },
        { status: backendResponse.status }
      );
    }
  } catch (error) {
    console.error("Error in verify OTP and register API:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error. Please try again later." 
      },
      { status: 500 }
    );
  }
}
